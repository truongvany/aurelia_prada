const express = require('express');
const router = express.Router();
const {
  getPromotions,
  getActivePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} = require('../controllers/promotionController.js');

const { protect, admin } = require('../middleware/authMiddleware.js');

// Public route to get active promos for frontend
router.route('/active').get(getActivePromotions);

// Admin routes
router.route('/').get(protect, admin, getPromotions).post(protect, admin, createPromotion);
router
  .route('/:id')
  .put(protect, admin, updatePromotion)
  .delete(protect, admin, deletePromotion);

module.exports = router;
