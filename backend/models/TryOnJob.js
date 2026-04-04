const mongoose = require('mongoose');

const tryOnJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    provider: {
      type: String,
      default: process.env.TRYON_PROVIDER || 'mock',
    },
    garmentImageUrl: {
      type: String,
      required: true,
    },
    modelImageUrl: {
      type: String,
      required: true,
    },
    resultImageUrl: {
      type: String,
    },
    errorCode: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    isDemoResult: {
      type: Boolean,
      default: false,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 2,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

tryOnJobSchema.index({ user: 1, createdAt: -1 });

const TryOnJob = mongoose.model('TryOnJob', tryOnJobSchema);

module.exports = TryOnJob;
