const mongoose = require('mongoose');
const Order = require('../models/Order');
const Voucher = require('../models/Voucher');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      voucherCode,
      discountPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    // Process Voucher if provided
    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), isActive: true });
      if (voucher) {
        // Double check validity before finalizing order
        const isExpired = new Date(voucher.expirationDate) < new Date();
        const isMaxed = voucher.maxUsage && voucher.usageCount >= voucher.maxUsage;
        
        if (!isExpired && !isMaxed) {
          voucher.usageCount += 1;
          await voucher.save();
        } else {
           console.warn(`Attempted to use invalid/expired voucher: ${voucherCode}`);
           // Optionally throw error or just proceed without discount if you want to be strict
        }
      }
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      voucherCode, // Store used voucher
      discountPrice: discountPrice || 0,
      status: 'Processing',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const ownerId = order.user?._id?.toString() || order.user?.toString();
    const requesterId = req.user._id.toString();
    if (ownerId !== requesterId && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to view this order' });
      return;
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tra cứu đơn hàng (khách không đăng nhập): mã đơn + email khớp tài khoản đặt hàng
// @route   POST /api/orders/lookup
// @access  Public
const lookupOrder = async (req, res) => {
  try {
    const { orderId, email } = req.body || {};
    if (!orderId || !email || typeof email !== 'string') {
      res.status(400).json({ message: 'Vui lòng nhập mã đơn hàng và email.' });
      return;
    }

    const trimmedId = String(orderId).trim();
    if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
      res.status(400).json({ message: 'Mã đơn hàng không hợp lệ.' });
      return;
    }

    const order = await Order.findById(trimmedId).populate(
      'user',
      'name email'
    );

    if (!order || !order.user) {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
      return;
    }

    const orderEmail = (order.user.email || '').toLowerCase().trim();
    const inputEmail = email.toLowerCase().trim();
    if (orderEmail !== inputEmail) {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
      return;
    }

    const payload = order.toObject();
    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'Delivered';

      const updatedOrder = await order.save();

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    if (status === 'Confirmed') {
      order.isPaid = order.paymentMethod !== 'COD' ? true : order.isPaid;
    }

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  lookupOrder,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
};
