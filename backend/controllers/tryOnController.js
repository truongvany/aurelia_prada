const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

const Product = require('../models/Product');
const TryOnJob = require('../models/TryOnJob');
const { tryOnPaths } = require('../middleware/tryOnUploadMiddleware');
const { queueTryOnJob } = require('../services/tryOnJobRunner');

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildPublicUploadUrl(filePath) {
  const normalized = String(filePath || '').replace(/\\/g, '/');
  const marker = '/uploads/';
  const idx = normalized.lastIndexOf(marker);
  if (idx === -1) return '';
  return normalized.slice(idx);
}

function extFromContentType(contentType) {
  const value = String(contentType || '').toLowerCase();
  if (value.includes('png')) return '.png';
  if (value.includes('webp')) return '.webp';
  if (value.includes('jpg') || value.includes('jpeg')) return '.jpg';
  return '';
}

function extFromSourceUrl(sourceUrl) {
  try {
    const parsed = new URL(sourceUrl);
    const ext = path.extname(parsed.pathname || '').toLowerCase();
    if (ext === '.png' || ext === '.webp' || ext === '.jpg' || ext === '.jpeg') {
      return ext === '.jpeg' ? '.jpg' : ext;
    }
  } catch {
    // Ignore invalid URL and fallback later.
  }

  return '';
}

function normalizeUploadUrlFromAbsolute(sourceUrl) {
  try {
    const parsed = new URL(sourceUrl);
    if (parsed.pathname.startsWith('/uploads/')) {
      return parsed.pathname;
    }
  } catch {
    // Ignore invalid URL.
  }

  return '';
}

function pickProductGarmentImage(product) {
  if (!product) return '';

  const variantImage = Array.isArray(product.variants)
    ? (product.variants.find((variant) => Array.isArray(variant?.images) && variant.images.length > 0)
      ?.images?.[0] || '')
    : '';

  if (variantImage) return variantImage;
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
  return '';
}

async function downloadGarmentFromUrl(sourceUrl) {
  const timeoutMs = Number(process.env.FITROOM_TIMEOUT_MS || 45000);
  const res = await fetch(sourceUrl, {
    method: 'GET',
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw httpError(`Khong tai duoc anh ao tu URL (HTTP ${res.status}).`, 400);
  }

  const contentType = String(res.headers.get('content-type') || '').toLowerCase();
  if (contentType && !contentType.startsWith('image/')) {
    throw httpError('Duong dan garmentImageUrl khong phai la tep anh hop le.', 400);
  }

  const ext = extFromContentType(contentType) || extFromSourceUrl(sourceUrl) || '.jpg';
  const outputAbs = path.join(tryOnPaths.inputDir, `${Date.now()}-prefill-garment${ext}`);
  const bytes = Buffer.from(await res.arrayBuffer());

  await fs.writeFile(outputAbs, bytes);
  return buildPublicUploadUrl(outputAbs);
}

async function resolveGarmentImage({ garmentFile, garmentImageUrl, productId }) {
  const productIdRaw = String(productId || '').trim();
  let product = undefined;
  let productDoc = null;

  if (productIdRaw) {
    if (!mongoose.Types.ObjectId.isValid(productIdRaw)) {
      throw httpError('productId khong hop le.', 400);
    }

    productDoc = await Product.findById(productIdRaw)
      .select('image images variants.images')
      .lean();

    if (productDoc?._id) {
      product = productDoc._id;
    }
  }

  if (garmentFile) {
    const uploadedGarmentUrl = buildPublicUploadUrl(garmentFile.path);
    if (!uploadedGarmentUrl) {
      throw httpError('Khong the xu ly duong dan anh ao upload.', 400);
    }

    return {
      garmentImageUrl: uploadedGarmentUrl,
      product,
    };
  }

  let sourceUrl = String(garmentImageUrl || '').trim();
  if (!sourceUrl && productDoc) {
    sourceUrl = pickProductGarmentImage(productDoc);
  }

  if (!sourceUrl) {
    throw httpError('Can upload garmentImage hoac cung cap garmentImageUrl/productId hop le.', 400);
  }

  if (sourceUrl.startsWith('uploads/')) {
    sourceUrl = `/${sourceUrl}`;
  }

  if (sourceUrl.startsWith('/uploads/')) {
    return {
      garmentImageUrl: sourceUrl,
      product,
    };
  }

  const uploadUrlFromAbsolute = normalizeUploadUrlFromAbsolute(sourceUrl);
  if (uploadUrlFromAbsolute) {
    return {
      garmentImageUrl: uploadUrlFromAbsolute,
      product,
    };
  }

  if (!/^https?:\/\//i.test(sourceUrl)) {
    throw httpError('garmentImageUrl khong hop le. Chi chap nhan URL http/https.', 400);
  }

  const downloadedGarmentUrl = await downloadGarmentFromUrl(sourceUrl);
  if (!downloadedGarmentUrl) {
    throw httpError('Khong the xu ly garmentImageUrl.', 400);
  }

  return {
    garmentImageUrl: downloadedGarmentUrl,
    product,
  };
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
    const body = req.body || {};

    if (!modelFile) {
      res.status(400).json({ message: 'Can upload day du modelImage.' });
      return;
    }

    const modelImageUrl = buildPublicUploadUrl(modelFile.path);

    if (!modelImageUrl) {
      res.status(400).json({ message: 'Khong the xu ly duong dan anh nguoi mau upload.' });
      return;
    }

    const resolvedGarment = await resolveGarmentImage({
      garmentFile,
      garmentImageUrl: body.garmentImageUrl,
      productId: body.productId,
    });

    const job = await TryOnJob.create({
      user: req.user._id,
      product: resolvedGarment.product,
      provider: process.env.TRYON_PROVIDER || 'mock',
      garmentImageUrl: resolvedGarment.garmentImageUrl,
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
    res.status(error.statusCode || 500).json({ message: error.message });
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
