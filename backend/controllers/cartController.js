const Cart = require('../models/Cart');

// @desc    Get logged in user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    // Tìm giỏ hàng theo user ID
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    // Nếu chưa có tạo mới một giỏ rỗng
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Kiểm tra xem hàng đã có trong giỏ chưa với cùng size (nếu có size)
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (itemIndex > -1) {
      // Đã tồn tại, tăng số lượng
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      // Chưa tồn tại, thêm mới
      cart.items.push({ product: productId, quantity: Number(quantity), size });
    }

    await cart.save();
    
    // Trả về cart đã populate lại product details
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (cart) {
      cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
      await cart.save();

      const updatedCart = await Cart.findById(cart._id).populate('items.product');
      res.json(updatedCart);
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
    try {
      const cart = await Cart.findOne({ user: req.user._id });
      
      if (cart) {
        cart.items = [];
        await cart.save();
        res.json({ message: 'Cart cleared' });
      } else {
        res.status(404).json({ message: 'Cart not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
};
