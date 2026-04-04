const fs = require('fs/promises');
const path = require('path');

const { ensureTryOnDirs, tryOnPaths } = require('../middleware/tryOnUploadMiddleware');

const DEFAULT_FITROOM_ENDPOINT = 'https://platform.fitroom.app/api/tryon/v2/tasks';
const DEFAULT_FITROOM_STATUS_ENDPOINT = 'https://platform.fitroom.app/api/tryon/v2/tasks/{jobId}';

function toAbsolutePathFromPublicUrl(publicUrl) {
  const normalized = String(publicUrl || '').replace(/^\/+/, '');
  return path.join(__dirname, '..', normalized);
}

function toPublicUploadUrl(absPath) {
  const relative = path.relative(path.join(__dirname, '..', 'uploads'), absPath);
  return `/uploads/${relative.split(path.sep).join('/')}`;
}

function mimeFromExt(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

function getByPath(data, dotPath) {
  if (!dotPath) return undefined;
  return dotPath.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), data);
}

function pickResultUrl(payload) {
  const customPath = process.env.FITROOM_RESULT_URL_PATH || '';
  const candidates = [
    customPath,
    'download_signed_url',
    'data.download_signed_url',
    'result.download_signed_url',
    'result_image',
    'data.result_image',
    'data.result_image_url',
    'data.output_url',
    'task.result_image',
    'task.resultImageUrl',
    'resultImageUrl',
    'result.imageUrl',
    'result.url',
    'data.resultImageUrl',
    'data.imageUrl',
    'data.output',
    'output.imageUrl',
    'outputUrl',
    'imageUrl',
    'url',
  ].filter(Boolean);

  for (const candidate of candidates) {
    const value = getByPath(payload, candidate);
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return '';
}

function pickJobId(payload) {
  const customPath = process.env.FITROOM_JOB_ID_PATH || '';
  const candidates = [
    customPath,
    'task_id',
    'data.task_id',
    'task.task_id',
    'taskId',
    'data.taskId',
    'jobId',
    'id',
    'data.jobId',
    'data.id',
    'result.jobId',
  ].filter(Boolean);

  for (const candidate of candidates) {
    const value = getByPath(payload, candidate);
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }

  return '';
}

function pickStatus(payload) {
  const statusPath = process.env.FITROOM_STATUS_PATH || '';
  const candidates = [
    statusPath,
    'status',
    'data.status',
    'task.status',
  ].filter(Boolean);

  for (const candidate of candidates) {
    const value = getByPath(payload, candidate);
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).toLowerCase().trim();
    }
  }

  return '';
}

function pickErrorMessage(payload) {
  const candidates = [
    'error',
    'message',
    'data.error',
    'data.message',
    'result.error',
  ];

  for (const candidate of candidates) {
    const value = getByPath(payload, candidate);
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function buildProviderHeaders() {
  const apiKey = String(process.env.FITROOM_API_KEY || '').trim();
  const keyHeader = String(process.env.FITROOM_API_KEY_HEADER || '').trim();
  const bearerToken = String(process.env.FITROOM_BEARER_TOKEN || '').trim();

  const headers = {};
  if (apiKey && keyHeader) {
    headers[keyHeader] = apiKey;
  } else if (apiKey) {
    headers['X-API-KEY'] = apiKey;
  }

  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  return headers;
}

async function persistProviderImage(imageUrl, jobId) {
  const shouldStore = String(process.env.TRYON_STORE_PROVIDER_RESULT || 'true').toLowerCase() !== 'false';
  if (!shouldStore) return imageUrl;

  if (!/^https?:\/\//i.test(imageUrl)) return imageUrl;

  const timeoutMs = Number(process.env.FITROOM_TIMEOUT_MS || 45000);
  const res = await fetch(imageUrl, { method: 'GET', signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) {
    throw new Error(`Khong tai duoc anh ket qua provider: HTTP ${res.status}`);
  }

  const contentType = String(res.headers.get('content-type') || '').toLowerCase();
  const ext = contentType.includes('png') ? '.png' : contentType.includes('webp') ? '.webp' : '.jpg';
  const outputAbs = path.join(tryOnPaths.resultDir, `${Date.now()}-provider-${jobId}${ext}`);
  const bytes = Buffer.from(await res.arrayBuffer());

  await fs.writeFile(outputAbs, bytes);
  return toPublicUploadUrl(outputAbs);
}

async function pollProviderStatus(jobId) {
  const statusEndpointTemplate = String(
    process.env.FITROOM_STATUS_ENDPOINT || DEFAULT_FITROOM_STATUS_ENDPOINT
  ).trim();

  const statusEndpoint = statusEndpointTemplate.replace('{jobId}', encodeURIComponent(jobId));
  const timeoutMs = Number(process.env.FITROOM_TIMEOUT_MS || 45000);
  const intervalMs = Number(process.env.FITROOM_POLL_INTERVAL_MS || 3000);
  const maxAttempts = Number(process.env.FITROOM_POLL_MAX_ATTEMPTS || 20);

  const completedValues = String(process.env.FITROOM_COMPLETED_VALUES || 'completed,done,success,succeeded')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  const failedValues = String(process.env.FITROOM_FAILED_VALUES || 'failed,error,cancelled,rejected')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    const res = await fetch(statusEndpoint, {
      method: 'GET',
      headers: buildProviderHeaders(),
      signal: AbortSignal.timeout(timeoutMs),
    });

    let payload = {};
    try {
      payload = await res.json();
    } catch {
      payload = {};
    }

    if (!res.ok) {
      continue;
    }

    const directUrl = pickResultUrl(payload);
    if (directUrl) return directUrl;

    const status = pickStatus(payload);
    if (failedValues.includes(status)) {
      const detail = pickErrorMessage(payload);
      throw new Error(`Provider that bai voi trang thai: ${status}${detail ? ` - ${detail}` : ''}`);
    }

    if (!status || completedValues.includes(status)) {
      const completedUrl = pickResultUrl(payload);
      if (completedUrl) return completedUrl;
    }
  }

  return '';
}

async function processTryOnFitRoom({ garmentImageUrl, modelImageUrl, jobId, productId, userId }) {
  const endpoint = String(process.env.FITROOM_API_ENDPOINT || DEFAULT_FITROOM_ENDPOINT).trim();

  const headers = buildProviderHeaders();
  const garmentField = String(process.env.FITROOM_GARMENT_FIELD || 'cloth_image').trim();
  const modelField = String(process.env.FITROOM_MODEL_FIELD || 'model_image').trim();
  const clothTypeField = String(process.env.FITROOM_CLOTH_TYPE_FIELD || 'cloth_type').trim();
  const clothTypeValue = String(process.env.FITROOM_CLOTH_TYPE || 'upper').trim();
  const hdModeField = String(process.env.FITROOM_HD_MODE_FIELD || 'hd_mode').trim();
  const hdModeValue = String(process.env.FITROOM_HD_MODE || '').trim();
  const timeoutMs = Number(process.env.FITROOM_TIMEOUT_MS || 45000);

  const garmentAbs = toAbsolutePathFromPublicUrl(garmentImageUrl);
  const modelAbs = toAbsolutePathFromPublicUrl(modelImageUrl);
  const garmentBytes = await fs.readFile(garmentAbs);
  const modelBytes = await fs.readFile(modelAbs);

  const formData = new FormData();
  formData.append(
    garmentField,
    new Blob([garmentBytes], { type: mimeFromExt(garmentAbs) }),
    path.basename(garmentAbs)
  );
  formData.append(
    modelField,
    new Blob([modelBytes], { type: mimeFromExt(modelAbs) }),
    path.basename(modelAbs)
  );
  if (clothTypeField && clothTypeValue) {
    formData.append(clothTypeField, clothTypeValue);
  }
  if (hdModeField && hdModeValue) {
    formData.append(hdModeField, hdModeValue);
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: formData,
    signal: AbortSignal.timeout(timeoutMs),
  });

  let payload = {};
  try {
    payload = await res.json();
  } catch {
    payload = {};
  }

  if (!res.ok) {
    const detail = pickErrorMessage(payload) || `HTTP ${res.status}`;
    throw new Error(`FitRoom API loi: ${detail}`);
  }

  let resultUrl = pickResultUrl(payload);

  if (!resultUrl) {
    const remoteJobId = pickJobId(payload);
    if (remoteJobId) {
      resultUrl = await pollProviderStatus(remoteJobId);
    }
  }

  if (!resultUrl) {
    throw new Error('FitRoom API khong tra ve URL anh ket qua.');
  }

  const storedResultUrl = await persistProviderImage(resultUrl, jobId);

  return {
    resultImageUrl: storedResultUrl,
    isDemoResult: false,
  };
}

async function processTryOnMock({ modelImageUrl, jobId }) {
  ensureTryOnDirs();

  const sourceAbs = toAbsolutePathFromPublicUrl(modelImageUrl);
  const ext = path.extname(sourceAbs).toLowerCase() || '.jpg';
  const outputAbs = path.join(tryOnPaths.resultDir, `${Date.now()}-tryon-${jobId}${ext}`);

  await fs.copyFile(sourceAbs, outputAbs);

  return {
    resultImageUrl: toPublicUploadUrl(outputAbs),
    isDemoResult: true,
  };
}

async function processTryOnWithProvider(payload) {
  const provider = String(process.env.TRYON_PROVIDER || 'mock').toLowerCase();

  if (provider === 'mock') {
    return processTryOnMock(payload);
  }

  if (provider === 'fitroom') {
    return processTryOnFitRoom(payload);
  }

  throw new Error(
    `Provider ${provider} chua duoc ho tro. Dat TRYON_PROVIDER=mock hoac fitroom.`
  );
}

module.exports = {
  processTryOnWithProvider,
};
