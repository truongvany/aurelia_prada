const express = require('express');

const { protect } = require('../middleware/authMiddleware');
const {
  createTryOnRateLimit,
  readTryOnRateLimit,
} = require('../middleware/tryOnRateLimit');
const { handleTryOnUpload } = require('../middleware/tryOnUploadMiddleware');
const {
  createTryOnJob,
  getTryOnJobById,
  getMyTryOnJobs,
} = require('../controllers/tryOnController');

const router = express.Router();

router.post(
  '/jobs',
  protect,
  createTryOnRateLimit,
  handleTryOnUpload,
  createTryOnJob
);

router.get('/jobs/my', protect, readTryOnRateLimit, getMyTryOnJobs);
router.get('/jobs/:id', protect, readTryOnRateLimit, getTryOnJobById);

module.exports = router;
