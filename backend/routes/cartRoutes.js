const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItemQuantity,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCart).post(protect, addToCart).delete(protect, clearCart);
router.route('/:itemId').delete(protect, removeFromCart).patch(protect, updateCartItemQuantity);

module.exports = router;
