import { formatVnd } from './common.js';
import { getOrderById, clearCart, updateOrderToPaid, confirmOrderCod, uploadOrderPaymentProof, fetchPublicPaymentSettings } from './api.js';

// ─── Config ────────────────────────────────────────────────────────────────
const BANK_CONFIG = {
  bankCode: 'VCB',
  bankName: 'Vietcombank',
  accountName: 'AURELIA PRADA',
  accountNumber: '1234567890',
  branch: 'Chi nhánh TP. Hồ Chí Minh',
};

const MOMO_CONFIG = {
  phone: '0901234567',
  name: 'AURELIA PRADA',
};

// Status pipeline definition
const STATUS_STEPS = [
  { key: 'Processing', label: 'Đơn hàng đã đặt', desc: 'Chúng tôi đã nhận được đơn hàng của bạn.', icon: '📋' },
  { key: 'Confirmed', label: 'Đã xác nhận', desc: 'Đơn hàng được xác nhận và đang chuẩn bị.', icon: '✅' },
  { key: 'Shipped', label: 'Đang vận chuyển', desc: 'Đơn hàng đang trên đường giao đến bạn.', icon: '🚚' },
  { key: 'Delivered', label: 'Giao hàng thành công', desc: 'Bạn đã nhận được hàng. Cảm ơn bạn!', icon: '🎉' },
];

const STATUS_ORDER = ['Processing', 'Confirmed', 'Shipped', 'Delivered'];

// ─── State ─────────────────────────────────────────────────────────────────
let order = null;

function isOrderCompleteForCustomer(currentOrder) {
  if (!currentOrder) return false;
  if (currentOrder.isPaid) return true;
  return currentOrder.paymentMethod === 'COD' && currentOrder.status !== 'Processing';
}

function getPaymentMethodLabel(method) {
  const map = {
    COD: 'COD - Thanh toán khi nhận hàng',
    QR_BANKING: 'QR chuyển khoản',
    Banking: 'Chuyển khoản ngân hàng',
    MoMo: 'Ví MoMo',
    VNPay: 'VNPay',
  };
  return map[method] || method || '—';
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function getStatusBadgeClass(status) {
  const map = {
    Processing: 'sb-processing',
    Confirmed: 'sb-confirmed',
    Shipped: 'sb-shipped',
    Delivered: 'sb-delivered',
    Cancelled: 'sb-cancelled',
  };
  return map[status] || 'sb-processing';
}

function getStatusLabel(status) {
  const map = {
    Processing: 'Đang xử lý',
    Confirmed: 'Đã xác nhận',
    Shipped: 'Đang giao',
    Delivered: 'Đã giao',
    Cancelled: 'Đã hủy',
  };
  return map[status] || status;
}

function makeQrUrl(amount, content, type = 'bank') {
  if (type === 'momo') {
    const data = encodeURIComponent(`2|99|${MOMO_CONFIG.phone}|${MOMO_CONFIG.name}||0|0|${amount}|${content}`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${data}`;
  }
  const bankCode = BANK_CONFIG.bankCode || 'VCB';
  return `https://img.vietqr.io/image/${bankCode}-${BANK_CONFIG.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
}

async function loadPaymentSettings() {
  try {
    const settings = await fetchPublicPaymentSettings();
    if (settings?.bankConfig) {
      Object.assign(BANK_CONFIG, settings.bankConfig);
    }
    if (settings?.momoConfig) {
      Object.assign(MOMO_CONFIG, settings.momoConfig);
    }
  } catch (error) {
    // Keep built-in defaults when settings endpoint is unavailable.
  }
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const oldText = btn.textContent;
    btn.textContent = '✓';
    btn.style.background = '#27ae60';
    btn.style.color = '#fff';
    setTimeout(() => {
      btn.textContent = oldText;
      btn.style.background = '';
      btn.style.color = '';
    }, 1500);
  });
}

// ─── Render ─────────────────────────────────────────────────────────────────
function renderPaymentPanel() {
  const panel = document.getElementById('paymentContent');
  if (!panel || !order) return;

  const amount = order.totalPrice;
  const content = `Thanh toan don hang ${order._id.slice(-8).toUpperCase()}`;

  if (order.paymentMethod === 'COD') {
    panel.innerHTML = `
      <div class="cod-box">
        <div class="cod-icon">💵</div>
        <h3>Thanh toán khi nhận hàng</h3>
        <p>Vui lòng chuẩn bị đúng số tiền khi shipper đến.</p>
        <div class="pay-amount-highlight" style="margin-top:20px;">
          <span>Tổng thanh toán</span>
          <span>${formatVnd(amount)}</span>
        </div>
        <p class="cod-id">Mã đơn: #${order._id.slice(-8).toUpperCase()}</p>
        <div style="margin-top:30px;">
           <button id="btn-complete-cod" style="background:#1a1a1a; color:#fff; border:none; padding:16px 24px; font-size:13px; font-weight:700; width:100%; border-radius:2px; cursor:pointer;">
             HOÀN TẤT ĐẶT HÀNG
           </button>
        </div>
      </div>`;
    
    panel.querySelector('#btn-complete-cod')?.addEventListener('click', async () => {
      const btn = panel.querySelector('#btn-complete-cod');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'ĐANG XỬ LÝ...';
      }

      try {
        order = await confirmOrderCod(order._id);
        sessionStorage.removeItem(`pending_order_${order._id}`);
        await clearCart().catch(() => {});
        showSuccessView();
      } catch (error) {
        alert(error.message || 'Không thể xác nhận đơn COD. Vui lòng thử lại.');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'HOÀN TẤT ĐẶT HÀNG';
        }
      }
    });
    return;
  }

  const isMomo = order.paymentMethod === 'MoMo';
  const qrUrl = isMomo ? makeQrUrl(amount, content, 'momo') : makeQrUrl(amount, content, 'bank');

  let html = '';
  if (isMomo) {
    html = `
      <div class="qr-section">
        <div class="qr-img-wrap"><img src="${qrUrl}" alt="MoMo QR"></div>
        <div class="bank-info">
          <div class="bank-row"><span>SĐT MoMo</span><span class="bank-val">${MOMO_CONFIG.phone}</span><button class="copy-btn" data-copy="${MOMO_CONFIG.phone}">Sao chép</button></div>
          <div class="bank-row"><span>Nội dung</span><span class="bank-val">${content}</span><button class="copy-btn" data-copy="${content}">Sao chép</button></div>
        </div>
      </div>`;
  } else {
    html = `
      <div class="qr-tabs">
        <button class="qr-tab active" data-tab="qr">Quét mã QR</button>
        <button class="qr-tab" data-tab="manual">Chuyển khoản</button>
      </div>
      <div class="qr-panel active" id="tab-qr">
        <div class="qr-section">
          <div class="qr-img-wrap"><img src="${qrUrl}" alt="VietQR"></div>
        </div>
      </div>
      <div class="qr-panel" id="tab-manual">
        <div class="bank-info">
          <div class="bank-row"><span>Ngân hàng</span><span class="bank-val">${BANK_CONFIG.bankName}</span></div>
          <div class="bank-row"><span>Số tài khoản</span><span class="bank-val">${BANK_CONFIG.accountNumber}</span><button class="copy-btn" data-copy="${BANK_CONFIG.accountNumber}">Sao chép</button></div>
          <div class="bank-row"><span>Nội dung</span><span class="bank-val">${content}</span><button class="copy-btn" data-copy="${content}">Sao chép</button></div>
        </div>
      </div>`;
  }

  panel.innerHTML = html + `
    <div class="pay-amount-highlight" style="margin-top:20px;">
      <span>Số tiền cần chuyển</span>
      <span>${formatVnd(amount)}</span>
    </div>
    <div style="margin-top:16px; border:1px solid #eee; padding:14px; border-radius:4px; background:#fafafa;">
      <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#555; margin-bottom:10px;">Ảnh chứng minh thanh toán</div>
      <input type="file" id="payment-proof-file" accept="image/*" style="display:block; width:100%; font-size:12px; margin-bottom:10px;">
      <button id="btn-upload-proof" style="background:#1a1a1a; color:#fff; border:none; padding:10px 14px; font-size:12px; font-weight:700; border-radius:2px; cursor:pointer;">TẢI ẢNH LÊN</button>
      <div id="payment-proof-msg" style="margin-top:10px; font-size:12px; color:#777;">${order.paymentResult?.proofImageUrl ? 'Đã có ảnh chứng minh thanh toán.' : 'Vui lòng upload ảnh trước khi xác nhận đã thanh toán.'}</div>
      <div id="payment-proof-preview" style="margin-top:10px; ${order.paymentResult?.proofImageUrl ? '' : 'display:none;'}">
        <a href="${order.paymentResult?.proofImageUrl || '#'}" target="_blank" rel="noopener" style="font-size:12px; color:#1a1a1a; text-decoration:underline;">Xem ảnh đã tải</a>
        <img src="${order.paymentResult?.proofImageUrl || ''}" alt="Ảnh thanh toán" style="width:100%; max-height:220px; object-fit:contain; margin-top:8px; background:#fff; border:1px solid #eee; border-radius:2px;" />
      </div>
    </div>
    <div style="margin-top:28px; display:flex; align-items:center; justify-content:center; gap:10px;">
      <input type="checkbox" id="check-paid" style="width:18px; height:18px; cursor:pointer;">
      <label for="check-paid" style="font-size:14px; font-weight:600; cursor:pointer;">Tôi đã chuyển khoản</label>
    </div>
    <div id="payment-actions" style="margin-top:20px; text-align:center;">
      <button id="btn-confirm-paid" disabled style="background:#1a1a1a; color:#fff; border:none; padding:16px 24px; font-size:13px; font-weight:700; cursor:not-allowed; width:100%; border-radius:2px; opacity: 0.5;">
        THANH TOÁN HOÀN TẤT
      </button>
    </div>`;

  // Listeners
  panel.querySelectorAll('.qr-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      panel.querySelectorAll('.qr-tab').forEach(t => t.classList.remove('active'));
      panel.querySelectorAll('.qr-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      panel.querySelector(`#tab-${tab.dataset.tab}`)?.classList.add('active');
    });
  });
  panel.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => copyToClipboard(btn.dataset.copy, btn));
  });

  const checkPaid = panel.querySelector('#check-paid');
  const confirmBtn = panel.querySelector('#btn-confirm-paid');
  const proofInput = panel.querySelector('#payment-proof-file');
  const uploadProofBtn = panel.querySelector('#btn-upload-proof');
  const proofMsg = panel.querySelector('#payment-proof-msg');
  const proofPreview = panel.querySelector('#payment-proof-preview');
  let proofUploaded = Boolean(order.paymentResult?.proofImageUrl);

  const refreshProofPreview = () => {
    const proofUrl = order.paymentResult?.proofImageUrl || '';
    if (!proofPreview) return;
    if (!proofUrl) {
      proofPreview.style.display = 'none';
      return;
    }

    proofPreview.style.display = '';
    proofPreview.innerHTML = `
      <a href="${proofUrl}" target="_blank" rel="noopener" style="font-size:12px; color:#1a1a1a; text-decoration:underline;">Xem ảnh đã tải</a>
      <img src="${proofUrl}" alt="Ảnh thanh toán" style="width:100%; max-height:220px; object-fit:contain; margin-top:8px; background:#fff; border:1px solid #eee; border-radius:2px;" />
    `;
  };

  const toggleConfirmState = () => {
    if (!confirmBtn) return;
    const canConfirm = Boolean(checkPaid?.checked) && proofUploaded;
    confirmBtn.disabled = !canConfirm;
    confirmBtn.style.opacity = canConfirm ? '1' : '0.5';
    confirmBtn.style.cursor = canConfirm ? 'pointer' : 'not-allowed';
  };

  if (uploadProofBtn && proofInput) {
    uploadProofBtn.addEventListener('click', async () => {
      const selectedFile = proofInput.files?.[0];
      if (!selectedFile) {
        if (proofMsg) proofMsg.textContent = 'Vui lòng chọn ảnh trước khi tải lên.';
        return;
      }

      uploadProofBtn.disabled = true;
      uploadProofBtn.textContent = 'ĐANG TẢI...';
      if (proofMsg) proofMsg.textContent = 'Đang upload ảnh chứng minh thanh toán...';

      try {
        order = await uploadOrderPaymentProof(order._id, selectedFile);
        proofUploaded = Boolean(order.paymentResult?.proofImageUrl);
        refreshProofPreview();
        if (proofMsg) proofMsg.textContent = 'Upload ảnh thành công. Bạn có thể xác nhận đã thanh toán.';
      } catch (error) {
        if (proofMsg) proofMsg.textContent = error.message || 'Upload ảnh thất bại. Vui lòng thử lại.';
      } finally {
        uploadProofBtn.disabled = false;
        uploadProofBtn.textContent = 'TẢI ẢNH LÊN';
        toggleConfirmState();
      }
    });
  }

  if (checkPaid && confirmBtn) {
    checkPaid.addEventListener('change', () => {
      toggleConfirmState();
    });

    toggleConfirmState();

    confirmBtn.addEventListener('click', async () => {
      if (!proofUploaded) {
        alert('Vui lòng upload ảnh chứng minh thanh toán trước khi xác nhận.');
        return;
      }

      confirmBtn.disabled = true;
      confirmBtn.textContent = 'ĐANG XÁC NHẬN...';
      try {
        order = await updateOrderToPaid(order._id, {
          id: `QR-${order._id}`,
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
        });
        sessionStorage.removeItem(`pending_order_${order._id}`);
        await clearCart().catch(() => {});
        showSuccessView();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        alert(error.message || 'Xác nhận thanh toán thất bại. Vui lòng thử lại.');
      } finally {
        confirmBtn.textContent = 'THANH TOÁN HOÀN TẤT';
        toggleConfirmState();
      }
    });
  }
}

function showSuccessView() {
  const panel = document.getElementById('paymentPanel');
  const successContainer = document.getElementById('success-view-container');
  if (!panel || !successContainer) return;

  panel.style.display = 'none';
  successContainer.innerHTML = `
    <div class="success-card">
       <!-- Horizontal Stepper -->
       <div class="horizontal-stepper" id="statusTimeline"></div>
       
       <div class="success-icon-wrap" style="margin-top: 40px;">
         <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
       </div>
       <h2 class="success-title">Thanh toán hoàn tất!</h2>
       <p class="success-desc">
         Chúng tôi đã ghi nhận thanh toán của bạn. Đơn hàng đang được chuẩn bị và sẽ sớm được giao đến bạn.
       </p>
       <div class="order-id-badge">
         <span>Mã đơn</span> #${order._id.slice(-8).toUpperCase()}
       </div>
       <br>
       <a href="profile.html#orders" class="btn-profile-orders">
         QUẢN LÝ ĐƠN HÀNG
       </a>
    </div>
  `;

  renderStatusTimelineHtml(order.status);

  // Update overall progress bar
  document.querySelectorAll('.co-progress .step').forEach((s, i) => {
    if (i <= 3) { s.classList.add('done'); s.classList.remove('active'); }
    if (i === 3) s.classList.add('active');
  });
}

function renderStatusTimelineHtml(currentStatus) {
  const tl = document.getElementById('statusTimeline');
  if (!tl || !order) return;

  const ICONS = {
    Processing: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
    Confirmed: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    Shipped: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polyline points="16 8 20 8 23 11 23 16 16 16 16 8"></polyline><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
    Delivered: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8l-2-2H5L3 8v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"></path><path d="M3 8h18"></path><path d="M10 12h4"></path></svg>',
  };

  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  tl.innerHTML = STATUS_STEPS.map((step, i) => {
    const isDone = currentIdx > i;
    const isActive = currentIdx === i;
    const cls = isDone ? 'done' : isActive ? 'active' : '';
    return `
      <div class="h-step ${cls}">
        <div class="h-step-line"></div>
        <div class="h-step-icon">${ICONS[step.key]}</div>
        <div class="h-step-label">${step.label}</div>
      </div>`;
  }).join('');
}

function renderItems() {
  const list = document.getElementById('payItemList');
  const countEl = document.getElementById('payItemCount');
  const totalsEl = document.getElementById('payTotals');
  if (!list || !order) return;
  const items = order.orderItems || [];
  if (countEl) countEl.textContent = `${items.length} sản phẩm`;
  list.innerHTML = items.map(item => `
    <div class="order-item">
      <img src="${item.image || ''}" alt="${item.name}" onerror="this.style.background='#f0f0f0'">
      <div class="order-item-info"><h5>${item.name}</h5><p>${formatVnd(item.price)} × ${item.qty}</p></div>
      <div class="order-item-price">${formatVnd(item.price * item.qty)}</div>
    </div>`).join('');
  const discount = order.discountPrice || 0;
  const shipping = order.shippingPrice || 0;
  totalsEl.innerHTML = `
    <div class="pay-total-row"><span>Tạm tính</span><span>${formatVnd(order.itemsPrice || 0)}</span></div>
    ${discount > 0 ? `<div class="pay-total-row"><span>Giảm giá</span><span class="pay-discount-val">-${formatVnd(discount)}</span></div>` : ''}
    <div class="pay-total-row"><span>Phí vận chuyển</span><span>${shipping === 0 ? 'Miễn phí' : formatVnd(shipping)}</span></div>
    <div class="pay-total-row grand"><span>TỔNG THANH TOÁN</span><span>${formatVnd(order.totalPrice)}</span></div>`;
}

function renderShippingInfo() {
  const el = document.getElementById('shippingInfoContent');
  if (!el || !order) return;
  const addr = order.shippingAddress || {};
  el.innerHTML = `
    <div style="font-size:13px;color:#333;line-height:2;">
      <div><span style="color:#999;font-size:12px;">Địa chỉ:</span> ${addr.street || '—'}</div>
      <div><span style="color:#999;font-size:12px;">Khu vực:</span> ${addr.state || '—'}, ${addr.city || '—'}</div>
      <div><span style="color:#999;font-size:12px;">Thanh toán:</span> ${getPaymentMethodLabel(order.paymentMethod)}</div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const orderId = new URLSearchParams(window.location.search).get('orderId');
  if (!orderId) return;
  try {
    await loadPaymentSettings();
    order = await getOrderById(orderId);
    if (isOrderCompleteForCustomer(order)) {
      showSuccessView();
      renderItems();
      renderShippingInfo();
      return;
    }

    renderPaymentPanel();
    renderItems();
    renderShippingInfo();
    
    // If payment was abandoned, offer to restore cart
    if (!isOrderCompleteForCustomer(order) && sessionStorage.getItem(`pending_order_${orderId}`)) {
      const cartItems = JSON.parse(sessionStorage.getItem(`pending_order_${orderId}`) || '[]');
      const banner = document.createElement('div');
      banner.style.cssText = 'background:#fff3cd; border: 1px solid #ffc107; color: #856404; padding: 12px 16px; margin-bottom: 16px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 13px;';
      banner.innerHTML = `
        <span>Bạn có một đơn hàng chưa thanh toán. Nếu muốn quay về giỏ hàng, <a href="cart.html" style="color:#856404; text-decoration:underline; font-weight:700;">bấm đây</a></span>`;
      const container = document.querySelector('.checkout-container') || document.body;
      container.insertBefore(banner, container.firstChild);
    }
    
    setInterval(async () => {
      const fresh = await getOrderById(orderId).catch(() => null);
      if (!fresh) return;

      const becameComplete = !isOrderCompleteForCustomer(order) && isOrderCompleteForCustomer(fresh);
      const changedStatus = fresh.status !== order.status;
      order = fresh;

      if (becameComplete) {
        showSuccessView();
        return;
      }

      if (changedStatus) {
        order = fresh;
        if (document.getElementById('paymentPanel')?.style.display === 'none') {
          renderStatusTimelineHtml(order.status);
        }
      }
    }, 30_000);
  } catch (err) { console.error(err); }
});
