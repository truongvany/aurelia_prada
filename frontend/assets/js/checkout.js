import { formatVnd } from './common.js';
import { fetchCart, clearCart, getUserInfo, createOrder, getVoucherByCode } from './api.js';

console.log('[checkout.js] Loaded');

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

function resolveItemAvailableStock(item) {
  const product = item.product || {};
  const variants = Array.isArray(product.variants) ? product.variants : [];

  if (variants.length > 0) {
    const selectedColor = String(item.color || '').trim().toLowerCase();
    const selectedColorCode = String(item.colorCode || '').trim().toLowerCase();
    const matched = variants.find((variant) => {
      const variantColor = String(variant.color || '').trim().toLowerCase();
      const variantColorCode = String(variant.colorCode || '').trim().toLowerCase();
      return (
        (selectedColor && variantColor === selectedColor) ||
        (selectedColorCode && variantColorCode === selectedColorCode)
      );
    });

    return Math.max(0, Number(matched?.stock || 0));
  }

  return Math.max(0, Number(product.stock || 0));
}

function validateCheckoutStock() {
  const items = cartData?.items || [];
  for (const item of items) {
    const maxStock = resolveItemAvailableStock(item);
    if (Number(item.quantity || 0) > maxStock) {
      return {
        ok: false,
        message: `San pham ${item.product?.name || ''} chi con ${maxStock} trong kho. Vui long cap nhat gio hang.`,
      };
    }
  }

  return { ok: true };
}

// ─── Auth guard ────────────────────────────────────────────────────────────
// ─── Location API ────────────────────────────────────────────────────────
async function initLocationSelectors() {
    const citySelect = document.getElementById('co-city');
    const stateSelect = document.getElementById('co-state');
    const wardSelect = document.getElementById('co-ward');

    if (!citySelect) return;

    try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const provinces = await response.json();
        
        provinces.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.code;
            opt.textContent = p.name;
            citySelect.appendChild(opt);
        });

        citySelect.addEventListener('change', async () => {
            const pCode = citySelect.value;
            stateSelect.disabled = true;
            stateSelect.innerHTML = '<option value="" disabled selected>Quận / Huyện</option>';
            wardSelect.disabled = true;
            wardSelect.innerHTML = '<option value="" disabled selected>Phường / Xã</option>';

            if (!pCode) return;

            try {
                const res = await fetch(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`);
                const data = await res.json();
                data.districts.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.code;
                    opt.textContent = d.name;
                    stateSelect.appendChild(opt);
                });
                stateSelect.disabled = false;
            } catch (err) { console.error('Districts load error:', err); }
        });

        stateSelect.addEventListener('change', async () => {
            const dCode = stateSelect.value;
            wardSelect.disabled = true;
            wardSelect.innerHTML = '<option value="" disabled selected>Phường / Xã</option>';

            if (!dCode) return;

            try {
                const res = await fetch(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`);
                const data = await res.json();
                data.wards.forEach(w => {
                    const opt = document.createElement('option');
                    opt.value = w.code; // or w.name
                    opt.textContent = w.name;
                    wardSelect.appendChild(opt);
                });
                wardSelect.disabled = false;
            } catch (err) { console.error('Wards load error:', err); }
        });
    } catch (err) {
        console.error('Provinces load error:', err);
    }
}

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

  initLocationSelectors();

  // Pre-fill user info
  const user = getUserInfo();
  if (user) {
    const prompt = document.querySelector('.login-prompt');
    if (prompt) prompt.style.display = 'none';

    const nameEl = document.getElementById('co-name');
    const phoneEl = document.getElementById('co-phone');
    const emailEl = document.getElementById('co-email');
    if (nameEl && !nameEl.value && user.name) nameEl.value = user.name;
    if (phoneEl && !phoneEl.value && user.phone) phoneEl.value = user.phone;
    if (emailEl && !emailEl.value && user.email) emailEl.value = user.email;
  }

  try {
    // Check if this is a "Buy Now" flow
    const params = new URLSearchParams(window.location.search);
    const isBuyNow = params.get('buyNow') === '1';
    
    if (isBuyNow) {
      // Load product from sessionStorage (Mua ngay)
      const buyNowProduct = sessionStorage.getItem('buyNow_product');
      if (!buyNowProduct) {
        window.location.href = 'collections.html';
        return;
      }
      
      const product = JSON.parse(buyNowProduct);
      cartData = {
        items: [{
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock || 0,
          },
          quantity: product.quantity,
          size: product.size,
          color: product.color || '',
          colorCode: product.colorCode || '',
        }],
      };
    } else {
      // Load from cart normally
      cartData = await fetchCart();
      
      // Redirect to cart if empty
      if (!cartData?.items?.length) {
        window.location.href = 'cart.html';
        return;
      }
    }
    
    renderItems();
    renderTotals();
  } catch (err) {
    console.error('Checkout init error:', err);
    const list = document.getElementById('coItemList');
    if (list) list.innerHTML = '<p style="color:#e74c3c;font-size:13px;padding:20px;">Lỗi tải giỏ hàng. <a href="cart.html">Quay lại giỏ hàng</a></p>';
  }
}

function renderItems() {
  const list = document.getElementById('coItemList');
  if (!list || !cartData) return;

  const items = cartData.items || [];

  if (items.length === 0) {
    list.innerHTML = '<p style="color:#aaa;font-size:13px;text-align:center;padding:20px;">Giỏ hàng trống.</p>';
    return;
  }

  list.innerHTML = items.map(item => {
    const p = item.product || {};
    const maxStock = resolveItemAvailableStock(item);
    const colorLine = item.color ? `<span>Mau: ${item.color}</span>` : '';
    return `
      <div class="order-item">
        <img src="${p.image || ''}" alt="${p.name || ''}" class="order-item-img"
             onerror="this.style.background='#f0f0f0'">
        <div class="order-item-info">
          <h5>${p.name || 'Sản phẩm'}</h5>
          <div class="oi-meta">
            ${colorLine}
            <span class="oi-size-tag">Size: ${item.size || 'M'}</span>
            <span>Số lượng: ${item.quantity}</span>
            <span>Con lai: ${maxStock}</span>
          </div>
          <div class="oi-bottom">
            <span class="oi-price">${formatVnd(p.price || 0)}</span>
            <a href="cart.html" class="oi-edit">Sửa</a>
          </div>
        </div>
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
  if (el('coSubtotalActual')) el('coSubtotalActual').textContent = formatVnd(afterDisc);
  if (el('coTotal')) el('coTotal').textContent = formatVnd(total);

  // Shipping
  const shipEl = el('coShipping');
  if (shipEl) {
    if (shipping === 0) {
      shipEl.textContent = 'Miễn phí';
      shipEl.style.color = '#27ae60';
    } else {
      shipEl.textContent = formatVnd(shipping);
      shipEl.style.color = 'var(--aura-ink)';
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
    const data = await getVoucherByCode(code);
    const sub = getSubtotal();
    if (data.minOrderValue && sub < data.minOrderValue) {
      showVoucherMsg(`Đơn hàng tối thiểu ${formatVnd(data.minOrderValue)} để dùng mã này.`, 'err');
      appliedVoucher = null;
    } else {
      appliedVoucher = data;
      const discStr = data.discountType === 'percent'
        ? `${data.discountAmount}%`
        : formatVnd(data.discountAmount);
      showVoucherMsg(`✓ Đã áp dụng — giảm ${discStr}`, 'ok');
    }
  } catch (err) {
    showVoucherMsg(err.message || 'Lỗi áp dụng voucher.', 'err');
    appliedVoucher = null;
  } finally {
    btn.disabled = false;
    btn.textContent = 'ÁP DỤNG';
    renderTotals();
  }
}

// ─── Place Order ───────────────────────────────────────────────────────────
async function placeOrder() {
  console.log('Place Order Clicked - Validating fields...');
  const btn = document.getElementById('placeOrderBtn');

  const getVal = (id) => document.getElementById(id)?.value.trim() || '';
  const getSelectVal = (id) => document.getElementById(id)?.value || '';  // numeric or empty
  const getSelectedText = (id) => {
    const sel = document.getElementById(id);
    return sel && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : '';
  };

  const fields = {
    name: getVal('co-name'),
    phone: getVal('co-phone'),
    email: getVal('co-email'),
    street: getVal('co-street'),
    // Select value is numeric code when chosen, or empty string for the disabled placeholder
    city: getSelectVal('co-city') ? getSelectedText('co-city') : '',
    state: getSelectVal('co-state') ? getSelectedText('co-state') : '',
    ward: getSelectVal('co-ward') ? getSelectedText('co-ward') : '',
    note: getVal('co-note'),
  };

  console.log('Form data:', fields);

  const missing = !fields.name || !fields.phone || !fields.email || !fields.street ||
                  !fields.city || !fields.state || !fields.ward;

  if (missing) {
    console.warn('Validation failed:', fields);
    highlightMissingFields(fields);
    const errorBox = document.getElementById('coFormError');
    if (errorBox) errorBox.style.display = 'flex';

    const firstError = document.querySelector('.is-invalid');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (document.getElementById('coFormError')) document.getElementById('coFormError').style.display = 'none';

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
    size: item.size || '',
    color: item.color || '',
    colorCode: item.colorCode || '',
    product: item.product._id,
  }));

  if (orderItems.length === 0) {
    alert('Giỏ hàng đang trống.'); return;
  }

  const stockCheck = validateCheckoutStock();
  if (!stockCheck.ok) {
    alert(stockCheck.message);
    window.location.href = 'cart.html';
    return;
  }

  const orderData = {
    orderItems,
    shippingAddress: {
      street: fields.street,
      city: fields.city,
      state: fields.state,
      ward: fields.ward,
      country: 'Việt Nam',
    },
    paymentMethod,
    itemsPrice: sub,
    taxPrice: 0,
    shippingPrice: shipping,
    totalPrice: total,
    voucherCode: appliedVoucher?.code || null,
    discountPrice: disc,
    note: fields.note
  };

  btn.innerHTML = '<span class="loader"></span> ĐANG XỬ LÝ...';
  btn.disabled = true;

  // Visual feedback: Next step
  const stepPayment = document.getElementById('step-payment');
  if (stepPayment) {
    document.querySelector('.step.active')?.classList.replace('active', 'done');
    stepPayment.classList.add('active');
  }

  try {
    const order = await createOrder(orderData);
    // Save cart data to sessionStorage before redirect (in case payment is abandoned)
    sessionStorage.setItem(`pending_order_${order._id}`, JSON.stringify(cartData.items));
    // Clear buy now data after order created
    sessionStorage.removeItem('buyNow_product');
    
    try { 
      // Don't clear cart here - wait for successful payment
      // await clearCart(); 
    } catch (_) {}
    window.location.href = `payment.html?orderId=${order._id}`;
  } catch (err) {
    console.error('Order failed:', err);
    alert('Đặt hàng thất bại: ' + (err.message || 'Lỗi không xác định.'));
    // Revert steps on error
    if (stepPayment) {
        stepPayment.classList.remove('active');
        const steps = document.querySelectorAll('.step');
        if (steps[1]) steps[1].classList.replace('done', 'active');
    }
  } finally {
    btn.innerHTML = 'ĐẶT HÀNG NGAY';
    btn.disabled = false;
  }
}

function highlightMissingFields(fields) {
  const map = {
    name: 'co-name', phone: 'co-phone', email: 'co-email',
    street: 'co-street', city: 'co-city', state: 'co-state', ward: 'co-ward'
  };
  Object.entries(map).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const parent = el.closest('.form-group');
    // For selects: value="" means placeholder (not chosen). For inputs: empty string means not filled
    const elVal = el.tagName === 'SELECT' ? el.value : (el.value?.trim() || '');
    const isInvalid = !fields[key] || !elVal;
    
    if (isInvalid) {
      el.classList.add('is-invalid');
      if (parent && !parent.querySelector('.co-tooltip')) {
        const tooltip = document.createElement('div');
        tooltip.className = 'co-tooltip';
        tooltip.innerHTML = '* Trường này bắt buộc';
        parent.appendChild(tooltip);
      }
    } else {
      el.classList.remove('is-invalid');
      parent?.querySelector('.co-tooltip')?.remove();
    }
  });
}

// ─── Bootstrap ─────────────────────────────────────────────────────────────
console.log('[checkout.js] Module starting execution...');

async function bootstrap() {
  console.log('[checkout] Starting bootstrap...');
  
  // Place order - move early
  const placeBtn = document.getElementById('placeOrderBtn');
  console.log('[checkout] placeOrderBtn found:', placeBtn);
  if (placeBtn) placeBtn.addEventListener('click', placeOrder);

  // Voucher
  document.getElementById('applyVoucherBtn')?.addEventListener('click', applyVoucher);
  document.getElementById('voucherInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyVoucher();
  });

  console.log('[checkout] Calling initCheckout...');
  await initCheckout();
  console.log('[checkout] initCheckout done');

  // Payment option highlight
  document.querySelectorAll('.payment-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Clear red border on input
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => { 
      el.classList.remove('is-invalid'); 
      el.closest('.form-group')?.querySelector('.co-tooltip')?.remove();
    });
    el.addEventListener('change', () => { 
      el.classList.remove('is-invalid'); 
      el.closest('.form-group')?.querySelector('.co-tooltip')?.remove();
    });
  });
}

// Run bootstrap immediately since modules are deferred anyway
bootstrap().catch(err => console.error('[checkout] Bootstrap failed:', err));
