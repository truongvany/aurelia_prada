const mongoose = require('mongoose');
const Order = require('../models/Order');
const Voucher = require('../models/Voucher');
const Product = require('../models/Product');
const User = require('../models/User');

function toLower(value) {
  return String(value || '').trim().toLowerCase();
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function findMatchingVariant(product, color, colorCode) {
  const variants = product.variants || [];
  if (!variants.length) return { variant: null, index: -1 };

  const colorKey = toLower(color);
  const colorCodeKey = toLower(colorCode);

  const index = variants.findIndex((variant) => {
    const variantColor = toLower(variant.color);
    const variantColorCode = toLower(variant.colorCode);
    return (
      (colorKey && variantColor === colorKey) ||
      (colorCodeKey && variantColorCode === colorCodeKey)
    );
  });

  if (index < 0) return { variant: null, index: -1 };
  return { variant: variants[index], index };
}

function resolveItemStock(product, item) {
  const variants = product.variants || [];
  if (variants.length > 0) {
    if (!toLower(item.color) && !toLower(item.colorCode)) {
      return {
        ok: false,
        message: `San pham ${product.name} can chon mau truoc khi dat hang.`,
      };
    }

    const match = findMatchingVariant(product, item.color, item.colorCode);
    if (!match.variant) {
      return {
        ok: false,
        message: `Khong tim thay bien the mau cho san pham ${product.name}.`,
      };
    }

    return {
      ok: true,
      availableStock: Math.max(0, Number(match.variant.stock || 0)),
      variantIndex: match.index,
      color: match.variant.color || item.color || '',
      colorCode: match.variant.colorCode || item.colorCode || '',
    };
  }

  return {
    ok: true,
    availableStock: Math.max(0, Number(product.stock || 0)),
    variantIndex: -1,
    color: '',
    colorCode: '',
  };
}

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

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    const normalizedItems = [];
    const updates = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw createHttpError(404, `San pham khong ton tai: ${item.name || item.product}`);
      }

      const qty = Number(item.qty || item.quantity || 0);
      if (!Number.isFinite(qty) || qty <= 0) {
        throw createHttpError(400, `So luong khong hop le cho san pham ${product.name}.`);
      }

      const resolved = resolveItemStock(product, item);
      if (!resolved.ok) {
        throw createHttpError(400, resolved.message);
      }

      if (qty > resolved.availableStock) {
        throw createHttpError(
          400,
          `San pham ${product.name} chi con ${resolved.availableStock} trong kho cho bien the da chon.`
        );
      }

      updates.push({ product, qty, resolved });
      normalizedItems.push({
        name: item.name || product.name,
        qty,
        image: item.image || product.image || '',
        price: Number(item.price || product.price || 0),
        size: item.size || '',
        color: resolved.color,
        colorCode: resolved.colorCode,
        product: product._id,
      });
    }

    for (const { product, qty, resolved } of updates) {
      if (resolved.variantIndex > -1) {
        product.variants[resolved.variantIndex].stock = Math.max(
          0,
          Number(product.variants[resolved.variantIndex].stock || 0) - qty
        );
        product.stock = product.variants.reduce(
          (sum, variant) => sum + Math.max(0, Number(variant.stock || 0)),
          0
        );
      } else {
        product.stock = Math.max(0, Number(product.stock || 0) - qty);
      }

      product.totalSold = Math.max(0, Number(product.totalSold || 0) + qty);
      await product.save();
    }

    if (voucherCode) {
      const voucher = await Voucher.findOne({
        code: String(voucherCode).toUpperCase(),
        isActive: true,
      });

      if (voucher) {
        const isExpired = new Date(voucher.expirationDate) < new Date();
        const isMaxed = voucher.maxUsage && voucher.usageCount >= voucher.maxUsage;

        if (!isExpired && !isMaxed) {
          voucher.usageCount += 1;
          await voucher.save();
        }
      }
    }

    const order = new Order({
      orderItems: normalizedItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      voucherCode,
      discountPrice: discountPrice || 0,
      status: 'Processing',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
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

// @desc    Tra cuu don hang (khach khong dang nhap): ma don + email khop tai khoan dat hang
// @route   POST /api/orders/lookup
// @access  Public
const lookupOrder = async (req, res) => {
  try {
    const { orderId, email } = req.body || {};
    if (!orderId || !email || typeof email !== 'string') {
      res.status(400).json({ message: 'Vui long nhap ma don hang va email.' });
      return;
    }

    const trimmedId = String(orderId).trim();
    if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
      res.status(400).json({ message: 'Ma don hang khong hop le.' });
      return;
    }

    const order = await Order.findById(trimmedId).populate(
      'user',
      'name email'
    );

    if (!order || !order.user) {
      res.status(404).json({ message: 'Khong tim thay don hang.' });
      return;
    }

    const orderEmail = (order.user.email || '').toLowerCase().trim();
    const inputEmail = email.toLowerCase().trim();
    if (orderEmail !== inputEmail) {
      res.status(404).json({ message: 'Khong tim thay don hang.' });
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
      return res.status(400).json({ message: 'Trang thai khong hop le.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const oldStatus = order.status;
    order.status = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      if (oldStatus !== 'Delivered') {
        const pointsAwarded = Math.floor(order.totalPrice / 10000);
        if (pointsAwarded > 0) {
          const user = await User.findById(order.user);
          if (user) {
            user.points = (user.points || 0) + pointsAwarded;

            if (user.points >= 5000) {
              user.membershipLevel = 'VVIP';
            } else if (user.points >= 1000) {
              user.membershipLevel = 'Premium';
            }

            await user.save();
          }
        }
      }
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
