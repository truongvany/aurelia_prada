const express = require('express');
const router = express.Router();
const {
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getVoucherByCode,
} = require('../controllers/voucherController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to validate a voucher code
router.get('/code/:code', getVoucherByCode);

// Admin routes
router.route('/')
  .get(protect, admin, getVouchers)
  .post(protect, admin, createVoucher);

router.route('/:id')
  .put(protect, admin, updateVoucher)
  .delete(protect, admin, deleteVoucher);

module.exports = router;
