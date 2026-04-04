const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  lookupOrder,
  uploadOrderPaymentProof,
  updateOrderToPaid,
  confirmCodOrder,
  updateOrderToDelivered,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const { handlePaymentProofUpload } = require('../middleware/orderPaymentProofUploadMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/payment-proof').put(protect, handlePaymentProofUpload, uploadOrderPaymentProof);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/confirm-cod').put(protect, confirmCodOrder);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

module.exports = router;

