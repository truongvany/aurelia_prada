import { formatVnd } from './common.js';
import { fetchCart, clearCart, getUserInfo, createOrder } from './api.js';

// ─── State ─────────────────────────────────────────────────────────────────
let cartData = null;
let appliedVoucher = null;
const SHIPPING_THRESHOLD = 2_000_000;
const SHIPPING_FEE = 30_000;

// ─── Computed ──────────────────────────────────────────────────────────────
const getSubtotal = () =>
  (cartData?.items || []).reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);

const getDiscount = (sub) => {
  if (!appliedVoucher) return 0;
  return appliedVoucher.discountType === 'percent'
    ? Math.round(sub * appliedVoucher.discountAmount / 100)
    : appliedVoucher.discountAmount;
};

const getShipping = (afterDiscount) => (afterDiscount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE);

const getTotal = () => {
  const sub = getSubtotal();
  const disc = getDiscount(sub);
  const afterDisc = Math.max(0, sub - disc);
  return afterDisc + getShipping(afterDisc);
};

// ─── Auth guard ────────────────────────────────────────────────────────────
function requireLogin() {
  if (!getUserInfo()) {
    window.location.href = 'login.html?redirect=checkout.html';
    return false;
  }
  return true;
}

// ─── Load Cart ─────────────────────────────────────────────────────────────
async function initCheckout() {
  if (!requireLogin()) return;

  // Pre-fill user info
  const user = getUserInfo();
  if (user) {
    const nameEl = document.getElementById('co-name');
    const phoneEl = document.getElementById('co-phone');
    if (nameEl && !nameEl.value && user.name) nameEl.value = user.name;
    if (phoneEl && !phoneEl.value && user.phone) phoneEl.value = user.phone;
  }

  try {
    cartData = await fetchCart();
    renderItems();
    renderTotals();

    // Redirect to cart if empty
    if (!cartData?.items?.length) {
      window.location.href = 'cart.html';
    }
  } catch (err) {
    console.error('Checkout init error:', err);
    const list = document.getElementById('coItemList');
    if (list) list.innerHTML = '<p style="color:#e74c3c;font-size:13px;">Lỗi tải giỏ hàng. <a href="cart.html">Quay lại giỏ hàng</a></p>';
  }
}

function renderItems() {
  const list = document.getElementById('coItemList');
  const countEl = document.getElementById('coItemCount');
  if (!list || !cartData) return;

  const items = cartData.items || [];
  if (countEl) countEl.textContent = `${items.length} sản phẩm`;

  if (items.length === 0) {
    list.innerHTML = '<p style="color:#aaa;font-size:13px;text-align:center;">Giỏ hàng trống.</p>';
    return;
  }

  list.innerHTML = items.map(item => {
    const p = item.product || {};
    const total = (p.price || 0) * item.quantity;
    return `
      <div class="order-item">
        <img src="${p.image || ''}" alt="${p.name || ''}" class="order-item-img"
             onerror="this.style.background='#f0f0f0'">
        <div class="order-item-info">
          <h5>${p.name || 'Sản phẩm'}</h5>
          <p>Size: ${item.size || 'M'} &nbsp;·&nbsp; ×${item.quantity}</p>
          <p>${formatVnd(p.price || 0)}</p>
        </div>
        <div class="order-item-price">${formatVnd(total)}</div>
      </div>`;
  }).join('');
}

function renderTotals() {
  const sub = getSubtotal();
  const disc = getDiscount(sub);
  const afterDisc = Math.max(0, sub - disc);
  const shipping = getShipping(afterDisc);
  const total = afterDisc + shipping;

  const el = (id) => document.getElementById(id);

  if (el('coSubtotal')) el('coSubtotal').textContent = formatVnd(sub);
  if (el('coTotal')) el('coTotal').textContent = formatVnd(total);

  // Shipping
  const shipEl = el('coShipping');
  if (shipEl) {
    if (shipping === 0) {
      shipEl.textContent = 'Miễn phí';
      shipEl.className = 'free-ship';
    } else {
      shipEl.textContent = formatVnd(shipping);
      shipEl.className = '';
    }
  }

  // Voucher row
  const discRow = el('coDiscountRow');
  if (discRow && appliedVoucher && disc > 0) {
    discRow.style.display = 'flex';
    if (el('coDiscount')) el('coDiscount').textContent = `-${formatVnd(disc)}`;
  } else if (discRow) {
    discRow.style.display = 'none';
  }
}

// ─── Voucher ───────────────────────────────────────────────────────────────
function showVoucherMsg(text, type) {
  const el = document.getElementById('voucherMsg');
  if (!el) return;
  el.textContent = text;
  el.className = `voucher-msg ${type}`;
}

async function applyVoucher() {
  const input = document.getElementById('voucherInput');
  const btn = document.getElementById('applyVoucherBtn');
  const code = (input?.value || '').trim().toUpperCase();

  if (!code) { showVoucherMsg('Vui lòng nhập mã voucher.', 'err'); return; }

  btn.disabled = true;
  btn.textContent = '...';
  showVoucherMsg('', '');

  try {
    const res = await fetch(`/api/vouchers/code/${code}`);
    const data = await res.json();

    if (!res.ok) {
      showVoucherMsg(data.message || 'Mã không hợp lệ.', 'err');
      input.className = 'err';
      appliedVoucher = null;
    } else {
      const sub = getSubtotal();
      if (data.minOrderValue && sub < data.minOrderValue) {
        showVoucherMsg(`Đơn hàng tối thiểu ${formatVnd(data.minOrderValue)} để dùng mã này.`, 'err');
        input.className = 'err';
        appliedVoucher = null;
      } else {
        appliedVoucher = data;
        input.className = 'ok';
        const discStr = data.discountType === 'percent'
          ? `${data.discountAmount}%`
          : formatVnd(data.discountAmount);
        showVoucherMsg(`✓ Áp dụng thành công — giảm ${discStr}`, 'ok');
      }
    }
  } catch {
    showVoucherMsg('Lỗi kết nối. Vui lòng thử lại.', 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = 'ÁP DỤNG';
    renderTotals();
  }
}

function removeVoucher() {
  appliedVoucher = null;
  const input = document.getElementById('voucherInput');
  if (input) { input.value = ''; input.className = ''; }
  showVoucherMsg('Đã bỏ mã giảm giá.', 'ok');
  renderTotals();
}

// ─── Place Order ───────────────────────────────────────────────────────────
async function placeOrder() {
  const btn = document.getElementById('placeOrderBtn');

  // Validate required fields
  const fields = {
    name: document.getElementById('co-name')?.value.trim(),
    phone: document.getElementById('co-phone')?.value.trim(),
    street: document.getElementById('co-street')?.value.trim(),
    city: document.getElementById('co-city')?.value.trim(),
    state: document.getElementById('co-state')?.value.trim(),
    zip: document.getElementById('co-zip')?.value.trim() || '70000',
    country: document.getElementById('co-country')?.value.trim() || 'Việt Nam',
  };

  if (!fields.name || !fields.phone || !fields.street || !fields.city || !fields.state) {
    highlightMissingFields(fields);
    alert('Vui lòng điền đầy đủ các trường bắt buộc (*).');
    return;
  }

  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'COD';
  const sub = getSubtotal();
  const disc = getDiscount(sub);
  const afterDisc = Math.max(0, sub - disc);
  const shipping = getShipping(afterDisc);
  const total = afterDisc + shipping;

  const orderItems = (cartData?.items || []).map(item => ({
    name: item.product.name,
    qty: item.quantity,
    image: item.product.image,
    price: item.product.price,
    product: item.product._id,
  }));

  if (orderItems.length === 0) {
    alert('Giỏ hàng đang trống.'); return;
  }

  const orderData = {
    orderItems,
    shippingAddress: {
      street: fields.street,
      city: fields.city,
      state: fields.state,
      zipCode: fields.zip,
      country: fields.country,
    },
    paymentMethod,
    itemsPrice: sub,
    taxPrice: 0,
    shippingPrice: shipping,
    totalPrice: total,
    voucherCode: appliedVoucher?.code || null,
    discountPrice: disc,
  };

  btn.classList.add('loading');
  btn.disabled = true;

  // Mark payment step active
  document.getElementById('step-payment')?.classList.add('active');

  try {
    const order = await createOrder(orderData);

    // Clear backend cart
    try { await clearCart(); } catch (_) {}

    // Mark payment step active
    document.getElementById('step-payment')?.classList.add('active', 'done');
    document.getElementById('step-done')?.classList.add('active');

    // Update cart badge
    const badge = document.getElementById('cart-badge');
    if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }

    // Redirect to payment page with order ID
    window.location.href = `payment.html?orderId=${order._id}`;


  } catch (err) {
    console.error('Order failed:', err);
    alert('Đặt hàng thất bại: ' + (err.message || 'Lỗi không xác định. Vui lòng thử lại.'));
    document.getElementById('step-payment')?.classList.remove('active');
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

function highlightMissingFields(fields) {
  const map = {
    name: 'co-name', phone: 'co-phone',
    street: 'co-street', city: 'co-city', state: 'co-state',
  };
  Object.entries(map).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.borderColor = fields[key] ? '' : '#e74c3c';
  });
}

// ─── Bootstrap ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await initCheckout();

  // Voucher
  document.getElementById('applyVoucherBtn')?.addEventListener('click', applyVoucher);
  document.getElementById('voucherInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyVoucher();
  });
  document.getElementById('removeVoucherBtn')?.addEventListener('click', removeVoucher);

  // Payment option highlight
  document.querySelectorAll('.payment-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');

      // Show CC fields only for CreditCard
      const val = opt.querySelector('input[type="radio"]')?.value;
      const ccFields = document.getElementById('cc-fields');
      if (ccFields) ccFields.classList.toggle('visible', val === 'CreditCard');
    });
  });

  // Remove border-color on input focus/input
  document.querySelectorAll('.co-forms input').forEach(input => {
    input.addEventListener('input', () => { input.style.borderColor = ''; });
  });

  // Place order
  document.getElementById('placeOrderBtn')?.addEventListener('click', placeOrder);

  // View orders after success
  document.getElementById('viewOrdersBtn')?.addEventListener('click', () => {
    window.location.href = 'profile.html';
  });
});
