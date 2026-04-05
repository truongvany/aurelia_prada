import { fetchProductById, generateVirtualTryOn } from './api.js';

const els = {
  productMini: document.getElementById('tryon-product-mini'),
  userPhotoInput: document.getElementById('user-photo-input'),
  userPreviewWrap: document.getElementById('user-preview-wrap'),
  userImagePreview: document.getElementById('user-image-preview'),
  btnRemovePhoto: document.getElementById('btn-remove-photo'),

  btnGenerate: document.getElementById('btn-generate'),
  stageEmpty: document.getElementById('stage-empty'),
  stageLoading: document.getElementById('stage-loading'),
  stageResult: document.getElementById('stage-result'),
  resultImage: document.getElementById('result-image'),
  btnDownload: document.getElementById('btn-download'),
};

const state = {
  product: null,
  userImageBase64: null,
  isGenerating: false,
};

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function formatVnd(num) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
}

function renderProductMini() {
  if (!state.product) return;

  els.productMini.innerHTML = `
    <img src="${state.product.image}" alt="${state.product.name}" />
    <div>
      <h4>${state.product.name}</h4>
      <p>${formatVnd(state.product.price)}</p>
    </div>
  `;
}

// Convert chosen file to Base64
async function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    alert('Ảnh quá lớn. Vui lòng chọn ảnh < 10MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const base64 = event.target.result;
    state.userImageBase64 = base64;
    els.userImagePreview.src = base64;
    els.userPreviewWrap.classList.remove('hidden');
    checkGenReady();
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  state.userImageBase64 = null;
  els.userPhotoInput.value = '';
  els.userPreviewWrap.classList.add('hidden');
  els.userImagePreview.src = '';
  checkGenReady();
}

function checkGenReady() {
  if (state.product && state.userImageBase64 && !state.isGenerating) {
    els.btnGenerate.disabled = false;
  } else {
    els.btnGenerate.disabled = true;
  }
}

function setStageMode(mode) {
  els.stageEmpty.classList.add('hidden');
  els.stageLoading.classList.add('hidden');
  els.stageResult.classList.add('hidden');

  if (mode === 'empty') els.stageEmpty.classList.remove('hidden');
  if (mode === 'loading') els.stageLoading.classList.remove('hidden');
  if (mode === 'result') els.stageResult.classList.remove('hidden');
}

async function handleGenerate() {
  if (!state.userImageBase64 || !state.product) return;

  state.isGenerating = true;
  checkGenReady();
  setStageMode('loading');

  try {
    const res = await generateVirtualTryOn(state.product._id, state.userImageBase64);
    
    // Server proxies and returns resultImage
    if (res.resultImage) {
      els.resultImage.src = res.resultImage;
      setStageMode('result');
    }
  } catch (error) {
    console.error('Try On error:', error);
    alert(`Lỗi AI: ${error.message}`);
    setStageMode('empty');
  } finally {
    state.isGenerating = false;
    checkGenReady();
  }
}

function downloadImage() {
  if (!els.resultImage.src || els.resultImage.src === window.location.href) return;

  const a = document.createElement('a');
  a.href = els.resultImage.src;
  a.download = `aurelia-ai-tryon-${Date.now()}.png`;
  a.click();
}

function bindEvents() {
  els.userPhotoInput.addEventListener('change', handlePhotoUpload);
  els.btnRemovePhoto.addEventListener('click', removePhoto);
  els.btnGenerate.addEventListener('click', handleGenerate);
  els.btnDownload.addEventListener('click', downloadImage);
}

async function init() {
  const productId = getProductId();
  if (!productId) {
    alert('Thiếu mã sản phẩm để thử đồ.');
    return;
  }

  try {
    state.product = await fetchProductById(productId);
    renderProductMini();
    checkGenReady();
    bindEvents();
  } catch (error) {
    console.error(error);
    alert('Không thể tải thông tin sản phẩm.');
  }
}

init();