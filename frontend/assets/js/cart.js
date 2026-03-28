import { formatVnd } from './common.js';
import { fetchCart, removeFromCart, addToCart, clearCart, getUserInfo, createOrder, getVoucherByCode } from './api.js';

// ─── State ────────────────────────────────────────────────────────────────────
let cartData = null;          // Cart from API: { _id, items: [{_id, product, quantity, size}] }
let appliedVoucher = null;    // { code, discountType, discountAmount, minOrderValue }
let isLoading = false;

// ─── Computed ─────────────────────────────────────────────────────────────────
function getItemsTotal() {
  if (!cartData || !cartData.items) return 0;
  return cartData.items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
}

function getDiscountAmount(subtotal) {
  if (!appliedVoucher) return 0;
  if (appliedVoucher.discountType === 'percent') {
    return Math.round(subtotal * appliedVoucher.discountAmount / 100);
  }
  return appliedVoucher.discountAmount;
}

function getFinalTotal() {
  const subtotal = getItemsTotal();
  return Math.max(0, subtotal - getDiscountAmount(subtotal));
}

// ─── Auth guard ───────────────────────────────────────────────────────────────
function requireLogin() {
  const user = getUserInfo();
  if (!user) {
    window.location.href = 'login.html?redirect=cart.html';
    return false;
  }
  return true;
}

// ─── Render Cart ──────────────────────────────────────────────────────────────
async function loadAndRenderCart() {
  if (!requireLogin()) return;

  const container = document.getElementById('cartItemsContainer');
  const skeleton = document.getElementById('cartSkeleton');

  try {
    cartData = await fetchCart();
    if (skeleton) skeleton.remove();
    renderCartItems();
    updateSummary();
    updateCheckoutBtn();
  } catch (err) {
    console.error('Failed to load cart:', err);
    if (skeleton) skeleton.remove();
    if (container) {
      container.innerHTML = `
        <div class="empty-cart-state">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg>
          <h3>Không thể tải giỏ hàng</h3>
          <p>Vui lòng <a href="login.html?redirect=cart.html">đăng nhập</a> lại và thử lại.</p>
        </div>`;
    }
  }
}

function renderCartItems() {
  const container = document.getElementById('cartItemsContainer');
  const countLabel = document.getElementById('cartCountLabel');
  if (!container) return;

  const items = cartData?.items || [];

  if (items.length === 0) {
    countLabel.innerHTML = '<span style="color:#e74c3c;">0 Sản Phẩm</span>';
    container.innerHTML = `
      <div class="empty-cart-state">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        <h3>Giỏ hàng đang trống</h3>
        <p>Hãy khám phá bộ sưu tập mới nhất của chúng tôi.</p>
      </div>`;
    return;
  }

  countLabel.innerHTML = `<span style="color:#e74c3c;">${items.length} Sản Phẩm</span>`;

  let html = '';
  items.forEach((item) => {
    const product = item.product || {};
    const price = product.price || 0;
    const origPrice = product.originalPrice || 0;
    const itemTotal = price * item.quantity;
    const itemId = item._id;

    const hasSale = origPrice > price;
    const discountVal = hasSale ? (origPrice - price) * item.quantity : 0;
    const discountPct = hasSale ? Math.round((1 - price / origPrice) * 100) : 0;

    html += `
      <div class="cart-item-row" data-item-id="${itemId}">
        <div class="cart-item-media">
          <img src="${product.image || ''}" alt="${product.name || ''}" class="cart-item-img"
               onerror="this.style.background='#f0f0f0'">
          <div class="cart-item-info">
            <h4>${product.name || 'Sản phẩm'}</h4>
            <p>Size: ${item.size || 'M'}</p>
            <p style="font-weight:700;color:#1a1a1a;margin-top:4px;">${formatVnd(price)}</p>
          </div>
        </div>
        <div class="cart-item-disc">
          ${hasSale
            ? `-${formatVnd(discountVal)}<span class="percent">(-${discountPct}%)</span>`
            : '<span style="color:#ccc;font-size:12px;">—</span>'}
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn minus" data-item-id="${itemId}" aria-label="Giảm">−</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn plus" data-item-id="${itemId}" data-product-id="${product._id || ''}" aria-label="Tăng">+</button>
        </div>
        <div class="cart-item-total">
          ${formatVnd(itemTotal)}
          <button class="cart-btn-del" data-item-id="${itemId}" aria-label="Xóa sản phẩm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>`;
  });

  container.innerHTML = html;
  setupItemListeners();
}

// ─── Summary ──────────────────────────────────────────────────────────────────
function updateSummary() {
  const items = cartData?.items || [];
  const subtotal = getItemsTotal();
  const discount = getDiscountAmount(subtotal);
  const finalTotal = getFinalTotal();

  const el = (id) => document.getElementById(id);

  if (el('summaryCount')) el('summaryCount').textContent = `${items.length} sản phẩm`;
  if (el('summaryRawTotal')) el('summaryRawTotal').textContent = formatVnd(subtotal);
  if (el('summaryFinalTotal')) el('summaryFinalTotal').textContent = formatVnd(finalTotal);

  const voucherRow = el('voucherRow');
  if (voucherRow) {
    if (appliedVoucher && discount > 0) {
      voucherRow.style.display = 'flex';
      if (el('summaryDiscount')) el('summaryDiscount').textContent = `-${formatVnd(discount)}`;
    } else {
      voucherRow.style.display = 'none';
    }
  }

  // Shipping
  const shippingEl = el('summaryShipping');
  if (shippingEl) {
    if (finalTotal >= 2000000) {
      shippingEl.textContent = 'Miễn phí';
      shippingEl.style.color = '#27ae60';
    } else {
      shippingEl.textContent = formatVnd(30000);
      shippingEl.style.color = '#555';
    }
  }
}

function updateCheckoutBtn() {
  const btn = document.getElementById('checkoutBtn');
  if (!btn) return;
  const items = cartData?.items || [];
  btn.disabled = items.length === 0;
}

// ─── Item Listeners ───────────────────────────────────────────────────────────
function setupItemListeners() {
  // Qty Plus
  document.querySelectorAll('.qty-btn.plus').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (isLoading) return;
      isLoading = true;
      btn.disabled = true;
      try {
        const itemId = btn.dataset.itemId;
        const productId = btn.dataset.productId;
        const item = cartData.items.find(i => i._id === itemId);
        if (item && productId) {
          cartData = await addToCart(productId, 1, item.size);
          renderCartItems();
          updateSummary();
          updateCheckoutBtn();
        }
      } catch (e) { console.error(e); }
      finally { isLoading = false; }
    });
  });

  // Qty Minus
  document.querySelectorAll('.qty-btn.minus').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (isLoading) return;
      const itemId = btn.dataset.itemId;
      const item = cartData.items.find(i => i._id === itemId);
      if (!item) return;

      if (item.quantity <= 1) {
        // Remove item
        await handleRemoveItem(itemId);
      } else {
        // We need to decrease qty — use removeFromCart then re-add (n-1)
        // Actually easiest: remove then add with qty-1
        isLoading = true;
        btn.disabled = true;
        try {
          await removeFromCart(itemId);
          if (item.quantity - 1 > 0) {
            cartData = await addToCart(item.product._id, item.quantity - 1, item.size);
          } else {
            cartData = await fetchCart();
          }
          renderCartItems();
          updateSummary();
          updateCheckoutBtn();
        } catch(e) { console.error(e); }
        finally { isLoading = false; }
      }
    });
  });

  // Delete
  document.querySelectorAll('.cart-btn-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.itemId;
      handleRemoveItem(itemId);
    });
  });
}

async function handleRemoveItem(itemId) {
  if (isLoading) return;
  isLoading = true;

  // Optimistic: fade out row
  const row = document.querySelector(`[data-item-id="${itemId}"]`);
  if (row) { row.style.opacity = '.4'; row.style.pointerEvents = 'none'; }

  try {
    cartData = await removeFromCart(itemId);
    renderCartItems();
    updateSummary();
    updateCheckoutBtn();
    // Invalidate voucher if cart now below min order
    if (appliedVoucher) {
      const subtotal = getItemsTotal();
      if (subtotal < appliedVoucher.minOrderValue) {
        clearVoucher();
        showVoucherFeedback('Đơn hàng không đủ điều kiện áp dụng voucher này.', 'error');
      }
    }
  } catch (err) {
    console.error(err);
    if (row) { row.style.opacity = '1'; row.style.pointerEvents = 'auto'; }
  } finally {
    isLoading = false;
  }
}

// ─── Voucher ──────────────────────────────────────────────────────────────────
function showVoucherFeedback(msg, type = 'success') {
  const el = document.getElementById('voucherFeedback');
  if (!el) return;
  el.textContent = msg;
  el.className = `voucher-feedback ${type}`;
}

function clearVoucher() {
  appliedVoucher = null;
  const input = document.getElementById('voucherInput');
  if (input) { input.value = ''; input.className = ''; }
  showVoucherFeedback('');
  updateSummary();
}

async function applyVoucher() {
  const input = document.getElementById('voucherInput');
  const btn = document.getElementById('applyVoucherBtn');
  const code = (input?.value || '').trim().toUpperCase();

  if (!code) { showVoucherFeedback('Vui lòng nhập mã voucher.', 'error'); return; }

  btn.disabled = true;
  btn.textContent = '...';
  showVoucherFeedback('');

  try {
    const data = await getVoucherByCode(code);
    const subtotal = getItemsTotal();
    
    if (data.minOrderValue && subtotal < data.minOrderValue) {
      showVoucherFeedback(`Đơn hàng tối thiểu ${formatVnd(data.minOrderValue)} để dùng mã này.`, 'error');
      input.className = 'is-invalid';
      appliedVoucher = null;
    } else {
      appliedVoucher = data;
      input.className = 'is-valid';
      const discountDesc = data.discountType === 'percent'
        ? `${data.discountAmount}%`
        : formatVnd(data.discountAmount);
      showVoucherFeedback(`✓ Áp dụng thành công! Giảm ${discountDesc}`, 'success');
      document.getElementById('voucherRow').style.display = 'flex';
    }
  } catch (err) {
    showVoucherFeedback(err.message || 'Lỗi áp dụng voucher.', 'error');
    input.className = 'is-invalid';
    appliedVoucher = null;
  } finally {
    btn.disabled = false;
    btn.textContent = 'ÁP DỤNG';
    updateSummary();
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Load cart from backend
  await loadAndRenderCart();

  // Voucher apply
  const applyBtn = document.getElementById('applyVoucherBtn');
  const voucherInput = document.getElementById('voucherInput');
  if (applyBtn) applyBtn.addEventListener('click', applyVoucher);
  if (voucherInput) {
    voucherInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyVoucher();
    });
  }

  // Remove voucher
  const removeVoucherBtn = document.getElementById('removeVoucherBtn');
  if (removeVoucherBtn) {
    removeVoucherBtn.addEventListener('click', () => {
      clearVoucher();
      showVoucherFeedback('Đã bỏ mã giảm giá.', 'success');
    });
  }

  // Checkout button → go to standalone checkout page
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (!requireLogin()) return;
      window.location.href = 'checkout.html';
    });
  }
});

