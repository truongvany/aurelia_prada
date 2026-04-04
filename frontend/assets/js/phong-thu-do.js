import { createTryOnJob, fetchMyTryOnJobs, fetchTryOnJob, getUserInfo } from './api.js';
import { showToast } from './common.js';

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 2 * 60 * 1000;

let activeJobId = '';
let activePollTimer = null;
let isPolling = false;

function statusLabel(status) {
  if (status === 'completed') return 'Hoàn tất';
  if (status === 'failed') return 'Thất bại';
  if (status === 'processing') return 'Đang xử lý';
  return 'Chờ xử lý';
}

function renderHistoryList(jobs) {
  const listNode = document.getElementById('tryon-history-list');
  if (!listNode) return;

  if (!Array.isArray(jobs) || jobs.length === 0) {
    listNode.innerHTML = '<div class="history-empty">Chưa có lịch sử thử đồ.</div>';
    return;
  }

  listNode.innerHTML = jobs
    .map((job) => {
      const created = new Date(job.createdAt).toLocaleString('vi-VN');
      const thumb = job.resultImageUrl || job.modelImageUrl || job.garmentImageUrl || '';
      const canOpen = job.status === 'completed' && job.resultImageUrl;

      return `
        <article class="history-item">
          <img src="${thumb}" alt="History thumbnail" class="history-thumb" />
          <div class="history-meta">
            <strong>${job._id}</strong>
            <span>${created}</span>
            <span>${job.isDemoResult ? 'Kết quả demo' : 'Kết quả AI'}</span>
          </div>
          <div class="history-actions">
            <span class="history-status ${job.status}">${statusLabel(job.status)}</span>
            <button class="history-open" data-job-id="${job._id}" ${canOpen ? '' : 'disabled'}>
              Mở kết quả
            </button>
          </div>
        </article>
      `;
    })
    .join('');
}

async function loadHistory() {
  const user = getUserInfo();
  if (!user?.token) {
    renderHistoryList([]);
    return;
  }

  try {
    const { jobs } = await fetchMyTryOnJobs(12);
    renderHistoryList(jobs || []);
  } catch (error) {
    renderHistoryList([]);
  }
}

function setStatus(text, type = '') {
  const statusNode = document.getElementById('tryon-status');
  if (!statusNode) return;

  statusNode.textContent = text;
  statusNode.classList.remove('waiting', 'success', 'fail');
  if (type) statusNode.classList.add(type);
}

function setResultImage(url) {
  const stage = document.getElementById('result-stage');
  const imageNode = document.getElementById('result-image');
  if (!stage || !imageNode) return;

  if (!url) {
    imageNode.src = '';
    stage.classList.remove('has-result');
    return;
  }

  imageNode.src = url;
  stage.classList.add('has-result');
}

function setJobMeta(html) {
  const meta = document.getElementById('job-meta');
  if (meta) meta.innerHTML = html;
}

function previewFile(inputNode, wrapNode, imageNode) {
  if (!inputNode || !wrapNode || !imageNode) return;
  const file = inputNode.files?.[0];

  if (!file) {
    imageNode.src = '';
    wrapNode.classList.remove('has-image');
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  imageNode.src = objectUrl;
  wrapNode.classList.add('has-image');
}

function updateSubmitDisabled(disabled) {
  const submit = document.getElementById('tryon-submit');
  if (submit) submit.disabled = disabled;
}

function clearPolling() {
  if (activePollTimer) {
    clearInterval(activePollTimer);
    activePollTimer = null;
  }
  isPolling = false;
}

async function pollJob(jobId, startedAt) {
  if (isPolling) return;

  if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
    clearPolling();
    setStatus('Hết thời gian chờ', 'fail');
    setJobMeta('Job quá thời gian xử lý. Vui lòng thử lại với ảnh rõ hơn.');
    updateSubmitDisabled(false);
    return;
  }

  isPolling = true;
  try {
    const { job } = await fetchTryOnJob(jobId);
    if (!job) {
      throw new Error('Không đọc được trạng thái job.');
    }

    const createdLabel = new Date(job.createdAt).toLocaleString('vi-VN');
    setJobMeta(`
      <strong>Job:</strong> ${job._id}<br>
      <strong>Trạng thái:</strong> ${job.status}<br>
      <strong>Tạo lúc:</strong> ${createdLabel}
    `);

    if (job.status === 'pending' || job.status === 'processing') {
      setStatus('Đang xử lý AI...', 'waiting');
      return;
    }

    if (job.status === 'completed') {
      clearPolling();
      setResultImage(job.resultImageUrl);
      setStatus('Hoàn tất', 'success');

      const note = document.getElementById('result-note');
      if (note) {
        note.textContent = job.isDemoResult
          ? 'Đây là kết quả demo để kiểm thử luồng. Cấu hình provider thật để tạo ảnh thay đồ AI.'
          : 'Ảnh thử đồ đã sẵn sàng.';
      }

      showToast('Thành công', 'Đã tạo ảnh thử đồ', 'success');
      await loadHistory();
      updateSubmitDisabled(false);
      return;
    }

    if (job.status === 'failed') {
      clearPolling();
      setStatus('Xử lý thất bại', 'fail');
      setJobMeta(`
        <strong>Job:</strong> ${job._id}<br>
        <strong>Lỗi:</strong> ${job.errorMessage || 'Không xác định'}
      `);
      showToast('Lỗi', job.errorMessage || 'Không thể tạo ảnh thử đồ', 'error');
      updateSubmitDisabled(false);
    }
  } catch (error) {
    console.error('Try-on polling error:', error);
  } finally {
    isPolling = false;
  }
}

function startPolling(jobId) {
  clearPolling();
  const startedAt = Date.now();

  pollJob(jobId, startedAt);
  activePollTimer = setInterval(() => {
    pollJob(jobId, startedAt);
  }, POLL_INTERVAL_MS);
}

async function handleSubmit(event) {
  event.preventDefault();

  const user = getUserInfo();
  if (!user?.token) {
    showToast('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để dùng Phòng thử đồ', 'error');
    const redirect = `${window.location.pathname}${window.location.search}`;
    window.location.href = `login.html?redirect=${encodeURIComponent(redirect)}`;
    return;
  }

  const garmentInput = document.getElementById('garment-image-input');
  const modelInput = document.getElementById('model-image-input');
  const garmentImage = garmentInput?.files?.[0];
  const modelImage = modelInput?.files?.[0];

  if (!garmentImage || !modelImage) {
    showToast('Thiếu ảnh', 'Vui lòng chọn đủ ảnh áo và ảnh người mẫu', 'error');
    return;
  }

  try {
    updateSubmitDisabled(true);
    setStatus('Đang tải ảnh lên...', 'waiting');
    setResultImage('');
    setJobMeta('Đang tạo job thử đồ...');

    const response = await createTryOnJob({ garmentImage, modelImage });
    const job = response.job;

    if (!job?._id) {
      throw new Error('Không nhận được mã job từ server.');
    }

    activeJobId = job._id;
    setStatus('Job đã tạo, đang đợi xử lý', 'waiting');
    setJobMeta(`<strong>Job:</strong> ${job._id}<br><strong>Trạng thái:</strong> ${job.status}`);
    await loadHistory();
    startPolling(activeJobId);
  } catch (error) {
    updateSubmitDisabled(false);
    setStatus('Không thể tạo job', 'fail');
    setJobMeta(error.message || 'Đã xảy ra lỗi khi gửi ảnh.');
    showToast('Lỗi', error.message || 'Không thể tạo job thử đồ', 'error');
  }
}

function initTryOnPage() {
  const form = document.getElementById('tryon-form');
  if (!form) return;

  const garmentInput = document.getElementById('garment-image-input');
  const modelInput = document.getElementById('model-image-input');
  const garmentWrap = document.getElementById('garment-preview-wrap');
  const modelWrap = document.getElementById('model-preview-wrap');
  const garmentPreview = document.getElementById('garment-preview');
  const modelPreview = document.getElementById('model-preview');

  garmentInput?.addEventListener('change', () => {
    previewFile(garmentInput, garmentWrap, garmentPreview);
  });

  modelInput?.addEventListener('change', () => {
    previewFile(modelInput, modelWrap, modelPreview);
  });

  const historyRefreshBtn = document.getElementById('history-refresh-btn');
  historyRefreshBtn?.addEventListener('click', () => {
    loadHistory();
  });

  const historyList = document.getElementById('tryon-history-list');
  historyList?.addEventListener('click', async (event) => {
    const button = event.target.closest('.history-open');
    if (!button) return;

    const jobId = button.getAttribute('data-job-id');
    if (!jobId) return;

    try {
      const { job } = await fetchTryOnJob(jobId);
      if (job?.status === 'completed' && job.resultImageUrl) {
        activeJobId = job._id;
        setResultImage(job.resultImageUrl);
        setStatus('Mở từ lịch sử', 'success');
        setJobMeta(`
          <strong>Job:</strong> ${job._id}<br>
          <strong>Trạng thái:</strong> ${job.status}<br>
          <strong>Tạo lúc:</strong> ${new Date(job.createdAt).toLocaleString('vi-VN')}
        `);
      }
    } catch (error) {
      showToast('Lỗi', 'Không thể mở kết quả từ lịch sử', 'error');
    }
  });

  form.addEventListener('submit', handleSubmit);
  loadHistory();
}

document.addEventListener('DOMContentLoaded', initTryOnPage);
