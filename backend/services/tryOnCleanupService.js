const cron = require('node-cron');
const fs = require('fs/promises');
const path = require('path');

const TryOnJob = require('../models/TryOnJob');
const { tryOnPaths } = require('../middleware/tryOnUploadMiddleware');

let cleanupTask = null;

function toLocalTryOnPath(fileUrl) {
  const value = String(fileUrl || '').trim();
  if (!value || !value.includes('/uploads/tryon/')) return '';

  const normalized = value.replace(/\\/g, '/');
  const idx = normalized.indexOf('/uploads/');
  if (idx === -1) return '';

  const relative = normalized.slice(idx + '/uploads/'.length).replace(/^\/+/, '');
  const resolved = path.resolve(path.join(__dirname, '..', 'uploads', relative));
  const root = path.resolve(tryOnPaths.uploadsRoot);

  if (!resolved.startsWith(root)) return '';
  return resolved;
}

async function safeDeleteFile(fileUrl) {
  const absPath = toLocalTryOnPath(fileUrl);
  if (!absPath) return false;

  try {
    await fs.unlink(absPath);
    return true;
  } catch {
    return false;
  }
}

async function cleanupExpiredTryOnJobs() {
  const retentionHours = Number(process.env.TRYON_RETENTION_HOURS || 72);
  const now = new Date();
  const fallbackExpiry = new Date(Date.now() - retentionHours * 60 * 60 * 1000);

  const jobs = await TryOnJob.find({
    $or: [
      { expiresAt: { $lte: now } },
      {
        expiresAt: { $exists: false },
        createdAt: { $lte: fallbackExpiry },
      },
    ],
  }).select('_id garmentImageUrl modelImageUrl resultImageUrl status');

  if (!jobs.length) return { removedJobs: 0, removedFiles: 0 };

  let removedFiles = 0;
  for (const job of jobs) {
    const fileUrls = [job.garmentImageUrl, job.modelImageUrl, job.resultImageUrl];
    for (const fileUrl of fileUrls) {
      const deleted = await safeDeleteFile(fileUrl);
      if (deleted) removedFiles += 1;
    }
  }

  const ids = jobs.map((job) => job._id);
  await TryOnJob.deleteMany({ _id: { $in: ids } });

  return {
    removedJobs: ids.length,
    removedFiles,
  };
}

function startTryOnCleanupScheduler() {
  const cronExpr = process.env.TRYON_CLEANUP_CRON || '*/30 * * * *';

  if (!cron.validate(cronExpr)) {
    console.warn(`[TRYON] Cron expression khong hop le: ${cronExpr}. Bo qua scheduler cleanup.`);
    return;
  }

  if (cleanupTask) return;

  cleanupTask = cron.schedule(cronExpr, async () => {
    try {
      const stats = await cleanupExpiredTryOnJobs();
      if (stats.removedJobs > 0 || stats.removedFiles > 0) {
        console.log(`[TRYON] Cleanup: removed ${stats.removedJobs} jobs, ${stats.removedFiles} files.`);
      }
    } catch (error) {
      console.error('[TRYON] Cleanup error:', error.message);
    }
  });

  console.log(`[TRYON] Cleanup scheduler started with cron: ${cronExpr}`);
}

module.exports = {
  cleanupExpiredTryOnJobs,
  startTryOnCleanupScheduler,
};
