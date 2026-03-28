import { formatVnd } from './common.js';
import { getOrderById, getUserInfo } from './api.js';

// ─── Config ────────────────────────────────────────────────────────────────
// Bank & MoMo info — customize as needed
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
  {
    key: 'Processing',
    label: 'Đơn hàng đã đặt',
    desc: 'Chúng tôi đã nhận được đơn hàng của bạn.',
    icon: '📋',
  },
  {
    key: 'Confirmed',
    label: 'Đã xác nhận',
    desc: 'Đơn hàng được xác nhận và đang chuẩn bị.',
    icon: '✅',
  },
  {
    key: 'Shipped',
    label: 'Đang vận chuyển',
    desc: 'Đơn hàng đang trên đường giao đến bạn.',
    icon: '🚚',
  },
  {
    key: 'Delivered',
    label: 'Giao hàng thành công',
    desc: 'Bạn đã nhận được hàng. Cảm ơn bạn!',
    icon: '🎉',
  },
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
    // MoMo QR via QR code API
    const data = encodeURIComponent(
      `2|99|${MOMO_CONFIG.phone}|${MOMO_CONFIG.name}||0|0|${amount}|${content}`
    );
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
  }
  // VietQR — free API for Vietnamese bank QR
  // Format: https://img.vietqr.io/image/{bank}-{account}-{template}.png?amount={amount}&addInfo={content}&accountName={name}
  const bankCode = 'VCB'; // Vietcombank
  return `https://img.vietqr.io/image/${bankCode}-${BANK_CONFIG.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ Đã sao chép';
    btn.style.background = '#27ae60';
    btn.style.color = '#fff';
    setTimeout(() => {
      btn.textContent = 'Sao chép';
      btn.style.background = '';
      btn.style.color = '';
    }, 1800);
  });
}

// ─── Render ─────────────────────────────────────────────────────────────────
function renderStatusTimeline(currentStatus) {
  const tl = document.getElementById('statusTimeline');
  const badge = document.getElementById('statusBadge');
  if (!tl || !order) return;

  if (badge) {
    badge.className = `status-badge-inline ${getStatusBadgeClass(currentStatus)}`;
    badge.textContent = getStatusLabel(currentStatus);
  }

  // Update progress bar if delivered
  if (currentStatus === 'Delivered') {
    document.getElementById('pl-pay')?.classList.add('done');
    document.getElementById('pl-done')?.classList.add('done');
    document.getElementById('ps-pay')?.classList.remove('active');
    document.getElementById('ps-pay')?.classList.add('done');
    document.getElementById('ps-done')?.classList.add('active');
  }

  if (currentStatus === 'Cancelled') {
    tl.innerHTML = `
      <div class="status-step active">
        <div class="step-icon" style="background:#e74c3c; border-color:#e74c3c; color:#fff;">✕</div>
        <div class="step-content">
          <h4>Đơn hàng đã bị hủy</h4>
          <p>Nếu bạn đã thanh toán, tiền sẽ được hoàn trong 3-5 ngày làm việc.</p>
        </div>
      </div>`;
    return;
  }

  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  tl.innerHTML = STATUS_STEPS.map((step, i) => {
    const isDone = currentIdx > i;
    const isActive = currentIdx === i;
    const cls = isDone ? 'done' : isActive ? 'active' : '';
    const time = isDone
      ? (i === 0 ? new Date(order.createdAt).toLocaleString('vi-VN') :
         i === 3 && order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('vi-VN') : 'Đã hoàn thành')
      : isActive ? 'Hiện tại'
      : 'Đang chờ xử lý';

    return `
      <div class="status-step ${cls}">
        <div class="step-icon">${step.icon}</div>
        <div class="step-content">
          <h4>${step.label}</h4>
          <p>${step.desc}</p>
          <span class="step-time">${time}</span>
        </div>
      </div>`;
  }).join('');
}

function renderPaymentPanel() {
  const panel = document.getElementById('paymentContent');
  if (!panel || !order) return;

  const method = order.paymentMethod;
  const amount = order.totalPrice;
  const content = `Thanh toan don hang ${order._id.slice(-8).toUpperCase()}`;

  if (method === 'COD') {
    panel.innerHTML = `
      <div class="cod-box">
        <div class="cod-icon">💵</div>
        <h3>Thanh toán khi nhận hàng</h3>
        <p>Vui lòng chuẩn bị đúng số tiền khi shipper đến.<br>
        Không thanh toán trước khi kiểm tra hàng.</p>
        <div class="pay-amount-highlight" style="margin-top:20px;">
          <span>Tổng cần thanh toán</span>
          <span>${formatVnd(amount)}</span>
        </div>
        <p class="cod-id">Mã đơn: #${order._id.slice(-8).toUpperCase()}</p>
      </div>`;
  } else {
    const isMomo = method === 'MoMo';
    const qrUrl = isMomo ? makeQrUrl(amount, content, 'momo') : makeQrUrl(amount, content, 'bank');

    let html = '';
    if (isMomo) {
      html = `
        <div class="qr-section">
          <div class="qr-img-wrap">
            <img src="${qrUrl}" alt="MoMo QR" onerror="this.parentElement.innerHTML='<div class=qr-placeholder>📱</div>'">
          </div>
          <p style="font-size:12px;color:#aaa;margin-bottom:16px;">Quét mã QR bằng ứng dụng <strong>MoMo</strong> để thanh toán.</p>
          <div class="bank-info">
            <div class="bank-row"><span>Tài khoản MoMo</span><span class="bank-val">${MOMO_CONFIG.phone}</span><button class="copy-btn" data-copy="${MOMO_CONFIG.phone}">Sao chép</button></div>
            <div class="bank-row"><span>Tên tài khoản</span><span class="bank-val">${MOMO_CONFIG.name}</span></div>
            <div class="bank-row"><span>Nội dung chuyển khoản</span><span class="bank-val" style="font-size:12px;">${content}</span><button class="copy-btn" data-copy="${content}">Sao chép</button></div>
          </div>
        </div>`;
    } else {
      html = `
        <div class="qr-tabs">
          <button class="qr-tab active" data-tab="qr">Quét mã QR</button>
          <button class="qr-tab" data-tab="manual">Chuyển khoản thủ công</button>
        </div>
        <div class="qr-panel active" id="tab-qr">
          <div class="qr-section">
            <div class="qr-img-wrap"><img src="${qrUrl}" alt="VietQR" onerror="this.parentElement.innerHTML='<div class=qr-placeholder>🔳</div>'"></div>
            <p style="font-size:12px;color:#aaa;margin-bottom:0;">Quét mã QR bằng app ngân hàng hoặc VNPAY.</p>
          </div>
        </div>
        <div class="qr-panel" id="tab-manual">
          <div class="bank-info" style="margin-top:10px;">
            <div class="bank-row"><span>Ngân hàng</span><span class="bank-val">${BANK_CONFIG.bankName}</span></div>
            <div class="bank-row"><span>Chi nhánh</span><span class="bank-val" style="font-size:12px;">${BANK_CONFIG.branch}</span></div>
            <div class="bank-row"><span>Số tài khoản</span><span class="bank-val">${BANK_CONFIG.accountNumber}</span><button class="copy-btn" data-copy="${BANK_CONFIG.accountNumber}">Sao chép</button></div>
            <div class="bank-row"><span>Tên tài khoản</span><span class="bank-val">${BANK_CONFIG.accountName}</span></div>
            <div class="bank-row"><span>Nội dung CK</span><span class="bank-val" style="font-size:12px;">${content}</span><button class="copy-btn" data-copy="${content}">Sao chép</button></div>
          </div>
        </div>`;
    }

    panel.innerHTML = html + `
      <div class="pay-amount-highlight" style="margin-top:20px;">
        <span>Số tiền cần chuyển</span>
        <span>${formatVnd(amount)}</span>
      </div>
      <div id="payment-actions" style="margin-top:24px; text-align:center;">
        <button id="btn-confirm-paid" style="background:#1a1a1a; color:#fff; border:none; padding:15px 24px; font-size:13px; font-weight:700; letter-spacing:1px; cursor:pointer; width:100%; border-radius:2px;">
          TÔI ĐÃ CHUYỂN KHOẢN
        </button>
        <button id="btn-paid-success" style="display:none; background:#27ae60; color:#fff; border:none; padding:15px 24px; font-size:13px; font-weight:700; letter-spacing:1px; width:100%; border-radius:2px; cursor:default;">
          THANH TOÁN THÀNH CÔNG
        </button>
      </div>`;
  }

  // Initial visibility check
  const isUserConfirmed = localStorage.getItem(`paid_${order._id}`);
  if (order.status !== 'Processing' || isUserConfirmed) {
    showTimelineAndSuccess();
  } else {
    // Hide status card initially for Processing orders
    const statusCard = document.getElementById('statusTimeline')?.closest('.pay-card');
    if (statusCard) statusCard.style.display = 'none';
  }

  // Event Listeners
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

  const confirmBtn = panel.querySelector('#btn-confirm-paid');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      localStorage.setItem(`paid_${order._id}`, 'true');
      showTimelineAndSuccess();
      alert('Cảm ơn bạn! Chúng tôi sẽ kiểm tra và xác nhận đơn hàng sớm nhất có thể.');
    });
  }
}

function showTimelineAndSuccess() {
  const statusCard = document.getElementById('statusTimeline')?.closest('.pay-card');
  if (statusCard) statusCard.style.display = 'block';

  // Toggle buttons
  const confirmBtn = document.getElementById('btn-confirm-paid');
  const successBtn = document.getElementById('btn-paid-success');
  if (confirmBtn) confirmBtn.style.display = 'none';
  if (successBtn) successBtn.style.display = 'block';

  // Update top progress bar to "Done" for payment step
  document.getElementById('pl-pay')?.classList.add('done');
  document.getElementById('ps-pay')?.classList.add('done');
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
      <div class="order-item-info">
        <h5>${item.name}</h5>
        <p>${formatVnd(item.price)} × ${item.qty}</p>
      </div>
      <div class="order-item-price">${formatVnd(item.price * item.qty)}</div>
    </div>`).join('');

  const discount = order.discountPrice || 0;
  const shipping = order.shippingPrice || 0;
  totalsEl.innerHTML = `
    <div class="pay-total-row"><span>Tạm tính</span><span>${formatVnd(order.itemsPrice || 0)}</span></div>
    ${discount > 0 ? `<div class="pay-total-row"><span>Giảm giá ${order.voucherCode ? '(' + order.voucherCode + ')': ''}</span><span class="pay-discount-val">-${formatVnd(discount)}</span></div>` : ''}
    <div class="pay-total-row"><span>Phí vận chuyển</span><span>${shipping === 0 ? '<span style="color:#27ae60">Miễn phí</span>' : formatVnd(shipping)}</span></div>
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
      <div><span style="color:#999;font-size:12px;">Quốc gia:</span> ${addr.country || 'Việt Nam'}</div>
      <div><span style="color:#999;font-size:12px;">Thanh toán:</span> ${order.paymentMethod || '—'}</div>
    </div>`;
}

// ─── Bootstrap ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Get orderId from URL
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');

  if (!orderId) {
    // No order ID — show message
    document.getElementById('statusTimeline')?.parentElement?.insertAdjacentHTML('beforebegin', `
      <div style="text-align:center; padding:60px 20px;">
        <div style="font-size:48px; margin-bottom:16px;">📦</div>
        <h3 style="font-family:'Playfair Display',serif;">Không tìm thấy đơn hàng</h3>
        <p style="color:#888; margin:10px 0 24px;">Vui lòng đặt hàng trước hoặc kiểm tra lại link.</p>
        <a href="shop.html" style="background:#1a1a1a;color:#fff;padding:12px 28px;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:1px;">MUA SẮM NGAY</a>
      </div>`);
    return;
  }

  try {
    order = await getOrderById(orderId);

    renderStatusTimeline(order.status);
    renderPaymentPanel();
    renderItems();
    renderShippingInfo();

    // Poll for status updates every 30s (e.g., after admin confirms)
    let pollCount = 0;
    const pollInterval = setInterval(async () => {
      if (pollCount++ > 20) { clearInterval(pollInterval); return; } // max 10 min
      const fresh = await getOrderById(orderId).catch(() => null);
      if (!fresh) return;
      if (fresh.status !== order.status) {
        order = fresh;
        renderStatusTimeline(order.status);
        renderPaymentPanel();
      }
    }, 30_000);

  } catch (err) {
    console.error('Payment page error:', err);
    document.getElementById('statusTimeline').innerHTML = `
      <p style="color:#e74c3c; font-size:13px;">Không thể tải thông tin đơn hàng. <a href="profile.html">Xem đơn hàng của tôi</a></p>`;
  }
});
