const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

function buildKey(req) {
  return req.user?._id ? `user:${req.user._id}` : `ip:${ipKeyGenerator(req.ip)}`;
}

const createTryOnRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.TRYON_CREATE_MAX_PER_HOUR || 20),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: buildKey,
  message: {
    message: 'Ban da tao qua nhieu job thu do. Vui long thu lai sau.',
    errorCode: 'TRYON_RATE_LIMIT_CREATE',
  },
});

const readTryOnRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.TRYON_READ_MAX_PER_MINUTE || 120),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: buildKey,
  message: {
    message: 'Tan suat truy van job qua nhanh. Vui long giam polling.',
    errorCode: 'TRYON_RATE_LIMIT_READ',
  },
});

module.exports = {
  createTryOnRateLimit,
  readTryOnRateLimit,
};
