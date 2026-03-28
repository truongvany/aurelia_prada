import { formatVnd } from './common.js';
import { getOrderById } from './api.js';

// ─── Config ────────────────────────────────────────────────────────────────
const BANK_CONFIG = {
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
  const bankCode = 'VCB';
  return `https://img.vietqr.io/image/${bankCode}-${BANK_CONFIG.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
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
    
    panel.querySelector('#btn-complete-cod')?.addEventListener('click', () => {
      showSuccessView();
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
  if (checkPaid && confirmBtn) {
    checkPaid.addEventListener('change', () => {
      confirmBtn.disabled = !checkPaid.checked;
      confirmBtn.style.opacity = checkPaid.checked ? '1' : '0.5';
      confirmBtn.style.cursor = checkPaid.checked ? 'pointer' : 'not-allowed';
    });
    confirmBtn.addEventListener('click', () => {
      localStorage.setItem(`paid_${order._id}`, 'true');
      showSuccessView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function showSuccessView() {
  const panel = document.getElementById('paymentPanel');
  const successContainer = document.getElementById('success-view-container');
  if (!panel || !successContainer) return;

  panel.style.display = 'none';
  successContainer.innerHTML = `
    <div class="pay-card" style="text-align:center; padding:50px 30px;">
       <div style="width:72px; height:72px; background:#f0fff4; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px;">
         <span style="font-size:32px; color:#27ae60;">✓</span>
       </div>
       <h2 style="font-family:'Playfair Display',serif; font-size:26px; margin-bottom:12px;">Đã ghi nhận thanh toán!</h2>
       <p style="color:#666; font-size:14px; max-width:400px; margin:0 auto 24px; line-height:1.7;">
         Cảm ơn bạn! Chúng tôi đã nhận được thông báo và đang xử lý đơn hàng của bạn.
       </p>
       <div style="background:#f9f9f9; padding:12px 20px; border-radius:4px; display:inline-block; font-family:'Space Mono',monospace; font-size:13px; font-weight:700; margin-bottom:24px;">
         Mã đơn: #${order._id.slice(-8).toUpperCase()}
       </div>
       <br>
       <a href="profile.html#orders" style="display:inline-block; background:#1a1a1a; color:#fff; padding:14px 32px; text-decoration:none; font-size:12px; font-weight:700; letter-spacing:1.5px; border-radius:2px; transition:all .3s;">
         QUẢN LÝ ĐƠN HÀNG CỦA TÔI
       </a>
    </div>
    <div class="pay-card">
      <h2 class="pay-card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Trạng thái đơn hàng
        <span id="statusBadge" class="status-badge-inline ${getStatusBadgeClass(order.status)}" style="margin-left:auto;">${getStatusLabel(order.status)}</span>
      </h2>
      <div class="status-timeline" id="statusTimeline"></div>
    </div>
  `;

  renderStatusTimelineHtml(order.status);
  document.getElementById('pl-pay')?.classList.add('done');
  document.getElementById('ps-pay')?.classList.add('done');
}

function renderStatusTimelineHtml(currentStatus) {
  const tl = document.getElementById('statusTimeline');
  if (!tl || !order) return;
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  tl.innerHTML = STATUS_STEPS.map((step, i) => {
    const isDone = currentIdx > i;
    const isActive = currentIdx === i;
    const cls = isDone ? 'done' : isActive ? 'active' : '';
    const time = isDone ? (i === 0 ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Đã hoàn thành') : isActive ? 'Hiện tại' : 'Đang chờ xử lý';
    return `
      <div class="status-step ${cls}">
        <div class="step-icon">${step.icon}</div>
        <div class="step-content"><h4>${step.label}</h4><p>${step.desc}</p><span class="step-time">${time}</span></div>
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
      <div><span style="color:#999;font-size:12px;">Thanh toán:</span> ${order.paymentMethod || '—'}</div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const orderId = new URLSearchParams(window.location.search).get('orderId');
  if (!orderId) return;
  try {
    order = await getOrderById(orderId);
    renderPaymentPanel();
    renderItems();
    renderShippingInfo();
    if (localStorage.getItem(`paid_${orderId}`)) showSuccessView();
    
    setInterval(async () => {
      const fresh = await getOrderById(orderId).catch(() => null);
      if (fresh && fresh.status !== order.status) {
        order = fresh;
        if (localStorage.getItem(`paid_${orderId}`)) showSuccessView();
      }
    }, 30_000);
  } catch (err) { console.error(err); }
});
