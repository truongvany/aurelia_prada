const mongoose = require('mongoose');

const TryOnJob = require('../models/TryOnJob');
const { queueTryOnJob } = require('../services/tryOnJobRunner');

function buildPublicUploadUrl(filePath) {
  const normalized = String(filePath || '').replace(/\\/g, '/');
  const marker = '/uploads/';
  const idx = normalized.lastIndexOf(marker);
  if (idx === -1) return '';
  return normalized.slice(idx);
}

function toClientJob(job) {
  return {
    _id: job._id,
    status: job.status,
    provider: job.provider,
    garmentImageUrl: job.garmentImageUrl,
    modelImageUrl: job.modelImageUrl,
    resultImageUrl: job.resultImageUrl,
    isDemoResult: job.isDemoResult,
    errorCode: job.errorCode,
    errorMessage: job.errorMessage,
    attemptCount: job.attemptCount,
    maxAttempts: job.maxAttempts,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
  };
}

function isOwnerOrAdmin(job, reqUser) {
  if (!job || !reqUser) return false;
  if (reqUser.role === 'admin') return true;
  return String(job.user) === String(reqUser._id);
}

const createTryOnJob = async (req, res) => {
  try {
    const garmentFile = req.files?.garmentImage?.[0];
    const modelFile = req.files?.modelImage?.[0];

    if (!garmentFile || !modelFile) {
      res.status(400).json({ message: 'Can upload day du garmentImage va modelImage.' });
      return;
    }

    const garmentImageUrl = buildPublicUploadUrl(garmentFile.path);
    const modelImageUrl = buildPublicUploadUrl(modelFile.path);

    if (!garmentImageUrl || !modelImageUrl) {
      res.status(400).json({ message: 'Khong the xu ly duong dan tep upload.' });
      return;
    }

    const { productId } = req.body || {};
    let product = undefined;

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      product = productId;
    }

    const job = await TryOnJob.create({
      user: req.user._id,
      product,
      provider: process.env.TRYON_PROVIDER || 'mock',
      garmentImageUrl,
      modelImageUrl,
      status: 'pending',
      maxAttempts: Number(process.env.TRYON_MAX_ATTEMPTS || 2),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    queueTryOnJob(job._id.toString());

    res.status(202).json({
      message: 'Da tao job thu do AI.',
      job: toClientJob(job),
      pollUrl: `/api/tryon/jobs/${job._id}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTryOnJobById = async (req, res) => {
  try {
    const job = await TryOnJob.findById(req.params.id);

    if (!job) {
      res.status(404).json({ message: 'Khong tim thay job thu do.' });
      return;
    }

    if (!isOwnerOrAdmin(job, req.user)) {
      res.status(403).json({ message: 'Ban khong co quyen xem job nay.' });
      return;
    }

    res.json({ job: toClientJob(job) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyTryOnJobs = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const jobs = await TryOnJob.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      jobs: jobs.map((job) => toClientJob(job)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTryOnJob,
  getTryOnJobById,
  getMyTryOnJobs,
};
