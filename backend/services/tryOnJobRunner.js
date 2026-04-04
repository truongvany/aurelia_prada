const TryOnJob = require('../models/TryOnJob');
const { processTryOnWithProvider } = require('./tryOnProvider');

function queueTryOnJob(jobId, delayMs = 50) {
  setTimeout(() => {
    runTryOnJob(jobId).catch((error) => {
      console.error(`[TRYON] Job ${jobId} fatal error:`, error.message);
    });
  }, delayMs);
}

async function runTryOnJob(jobId) {
  const lockedJob = await TryOnJob.findOneAndUpdate(
    { _id: jobId, status: 'pending' },
    {
      $set: {
        status: 'processing',
        startedAt: new Date(),
        errorCode: '',
        errorMessage: '',
      },
      $inc: { attemptCount: 1 },
    },
    { new: true }
  );

  if (!lockedJob) {
    return;
  }

  try {
    const result = await processTryOnWithProvider({
      jobId: lockedJob._id.toString(),
      garmentImageUrl: lockedJob.garmentImageUrl,
      modelImageUrl: lockedJob.modelImageUrl,
      productId: lockedJob.product ? lockedJob.product.toString() : '',
      userId: lockedJob.user.toString(),
    });

    await TryOnJob.findByIdAndUpdate(lockedJob._id, {
      $set: {
        status: 'completed',
        resultImageUrl: result.resultImageUrl,
        isDemoResult: !!result.isDemoResult,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    const code = String(error.code || 'TRYON_PROVIDER_ERROR');
    const message = String(error.message || 'Khong the tao anh thu do AI.');

    if (lockedJob.attemptCount < lockedJob.maxAttempts) {
      await TryOnJob.findByIdAndUpdate(lockedJob._id, {
        $set: {
          status: 'pending',
          errorCode: code,
          errorMessage: message,
        },
      });
      queueTryOnJob(lockedJob._id.toString(), 2000);
      return;
    }

    await TryOnJob.findByIdAndUpdate(lockedJob._id, {
      $set: {
        status: 'failed',
        errorCode: code,
        errorMessage: message,
        completedAt: new Date(),
      },
    });
  }
}

module.exports = {
  queueTryOnJob,
  runTryOnJob,
};
