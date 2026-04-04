const express = require('express');
const router = express.Router();

const {
  getAdminSettings,
  updateAdminSettings,
  getPublicPaymentSettings,
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/payment').get(getPublicPaymentSettings);
router.route('/admin').get(protect, admin, getAdminSettings).put(protect, admin, updateAdminSettings);

module.exports = router;
