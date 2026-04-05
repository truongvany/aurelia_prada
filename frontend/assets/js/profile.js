import { getUserProfile, updateUserProfile, getMyOrders, logoutUser } from './api.js';
import { formatVnd } from './common.js';

async function initProfile() {
  const profileContent = document.getElementById('profileContent');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const errorAlert = document.getElementById('errorAlert');

  if (!profileContent) return;

  try {
    const user = await getUserProfile();
    renderUserInfo(user);
    renderSettingsForm(user);
    renderLoginHistory(user.loginHistory);
    renderAddresses(user);
    renderViewedProducts(user.viewedProducts);
    renderWishlist(user.wishlist);
    const { syncWishlistVisuals } = await import('./common.js');
    syncWishlistVisuals(user.wishlist);
    
    profileContent.style.display = 'block';
    if (loadingSpinner) loadingSpinner.style.display = 'none';

    // Load orders
    await loadOrders();

    setupTabs();
    setupForm(user);
    setupLogout();
    
    // Check for 'tab' in URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab');
    if (initialTab) {
        const tabBtn = document.querySelector(`[data-profile-tab="${initialTab}"]`);
        if (tabBtn) tabBtn.click();
    }
    

    // Auto-switch to tab if hash exists (e.g., #orders)
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const tabBtn = document.querySelector(`[data-profile-tab="${hash}"]`);
      if (tabBtn) tabBtn.click();
    }
  } catch (error) {
    if (errorAlert) {
      errorAlert.textContent = 'Phiên đăng nhập đã hết hạn. Đang chuyển hướng...';
      errorAlert.classList.add('show');
    }
    setTimeout(() => logoutUser(), 2000);
  }
}

function renderUserInfo(user) {
  const nameEl = document.getElementById('userName');
  const sidebarName = document.getElementById('userNameSidebar');

  if (nameEl) nameEl.textContent = user.name || 'N/A';
  if (sidebarName) sidebarName.textContent = user.name || 'User';
}

function renderLoginHistory(history) {
    const container = document.getElementById('loginHistoryContainer');
    if (!container) return;
    
    if (!history || history.length === 0) {
        container.innerHTML = '<tr><td colspan="6" class="text-center py-4">Chưa có lịch sử đăng nhập.</td></tr>';
        return;
    }
    
    container.innerHTML = [...history].reverse().map(log => `
        <tr>
            <td>${log.device || 'Unknown'}</td>
            <td style="font-size: 12px; color: #666;">${log.software || '---'}</td>
            <td>${log.loginType || 'Mặc định'}</td>
            <td>${log.location || 'Vietnam'}</td>
            <td>${log.ip}</td>
            <td>${new Date(log.timestamp).toLocaleString()}</td>
        </tr>
    `).join('');
}

function renderAddresses(user) {
    const container = document.getElementById('addressContainer');
    if (!container) return;

    if (!user.address || !user.address.street) {
        container.innerHTML = `
            <div class="ivy-empty-state" style="padding: 40px 0;">
                <p style="color: #888; font-size: 13px;">Bạn chưa lưu địa chỉ nào.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="ivy-address-card">
            <div class="ivy-addr-top">
                <div class="ivy-addr-name">${user.name} (Địa chỉ mặc định)</div>
                <div class="ivy-addr-actions">
                    <span class="ivy-addr-btn-edit">Sửa</span>
                    <span class="ivy-addr-badge-def">Mặc định</span>
                </div>
            </div>
            <div class="ivy-addr-row">
                <strong>Điện thoại:</strong> ${user.phone || '---'}
            </div>
            <div class="ivy-addr-row">
                <strong>Địa chỉ:</strong> ${user.address.street}, ${user.address.city || ''}
            </div>
        </div>
    `;
}

async function renderViewedProducts(viewedProducts) {
    const container = document.getElementById('viewedProductsContainer');
    if (!container) return;

    if (!viewedProducts || viewedProducts.length === 0) {
        container.innerHTML = '<p class="text-muted">Danh sách sản phẩm bạn vừa xem sẽ xuất hiện tại đây.</p>';
        return;
    }

    try {
        const { createProductCard } = await import('./common.js');
        container.innerHTML = viewedProducts.map(createProductCard).join('');
    } catch (err) {
        container.innerHTML = '<p class="text-muted">Không thể tải danh sách sản phẩm.</p>';
    }
}

async function renderWishlist(wishlist) {
    const container = document.getElementById('wishlistContainer');
    if (!container) return;

    if (!wishlist || wishlist.length === 0) {
        container.innerHTML = '<p class="text-muted">Bạn chưa có sản phẩm yêu thích nào.</p>';
        return;
    }

    try {
        const { createProductCard } = await import('./common.js');
        container.innerHTML = wishlist.map(createProductCard).join('');
    } catch (err) {
        container.innerHTML = '<p class="text-muted">Không thể tải danh sách sản phẩm yêu thích.</p>';
    }
}

function renderSettingsForm(user) {
  const nameParts = (user.name || '').split(' ');
  const lastName = nameParts[0] || '';
  const firstName = nameParts.slice(1).join(' ') || '';

  const lastNameInput = document.getElementById('settingLastName');
  const firstNameInput = document.getElementById('settingFirstName');
  const emailInput = document.getElementById('settingEmail');
  const phoneInput = document.getElementById('settingPhone');
  const dobInput = document.getElementById('settingDob');
  
  if (lastNameInput) lastNameInput.value = lastName;
  if (firstNameInput) firstNameInput.value = firstName;
  if (emailInput) emailInput.value = user.email || '';
  if (phoneInput) phoneInput.value = user.phone || '';
  if (dobInput) dobInput.value = user.dob || '';

  const genderRadios = document.querySelectorAll('input[name="gender"]');
  genderRadios.forEach(radio => {
    if (radio.value === user.gender) radio.checked = true;
  });

  const sidebarName = document.getElementById('userNameSidebar');
  if (sidebarName) sidebarName.textContent = user.name || 'User';
}

// ─── Order Detail Modal ──────────────────────────────────────
function injectProfileOrderModal() {
  if (document.getElementById('pom-overlay')) return;

  const style = document.createElement('style');
  style.textContent = `
    #pom-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity .3s;
    }
    #pom-overlay.open { opacity: 1; pointer-events: auto; }
    #pom-modal {
      background: #fff; width: 92%; max-width: 680px; max-height: 88vh;
      overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,.2);
      transform: translateY(20px); transition: transform .3s;
    }
    #pom-overlay.open #pom-modal { transform: translateY(0); }

    .pom-header {
      padding: 22px 26px 16px;
      border-bottom: 2px solid #1a1a1a;
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    .pom-header h2 {
      font-family: 'Playfair Display', serif;
      font-size: 20px; font-weight: 700; margin: 0 0 6px;
    }
    .pom-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 2px; font-size: 11px;
      font-weight: 700; letter-spacing: .5px; text-transform: uppercase;
    }
    .pom-badge.delivered { background: #e8f8f0; color: #27ae60; }
    .pom-badge.processing { background: #fff8e1; color: #f39c12; }
    .pom-badge.shipped { background: #e8f0ff; color: #2980b9; }
    .pom-badge.cancelled { background: #fde8e8; color: #e74c3c; }
    .pom-close {
      background: none; border: none; cursor: pointer; font-size: 24px;
      color: #bbb; line-height: 1; padding: 0; flex-shrink: 0;
    }
    .pom-close:hover { color: #e74c3c; }

    .pom-body { padding: 22px 26px; }
    .pom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }
    .pom-info-card {
      padding: 14px 16px;
      border: 1px solid #eee; border-radius: 2px; background: #fafafa;
    }
    .pom-info-card h4 {
      font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px;
      font-weight: 700; color: #aaa; margin: 0 0 10px;
    }
    .pom-info-row {
      font-size: 13px; color: #333; margin: 5px 0; display: flex; gap: 6px;
    }
    .pom-info-row span:first-child { color: #888; min-width: 90px; font-size: 12px; }

    .pom-items-heading {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.5px; color: #555; margin-bottom: 12px;
    }
    .pom-item {
      display: grid; grid-template-columns: 60px 1fr auto;
      gap: 14px; align-items: center;
      padding: 12px 0; border-bottom: 1px solid #f5f5f5;
    }
    .pom-item:last-child { border-bottom: none; }
    .pom-item img {
      width: 60px; height: 75px; object-fit: cover;
      border-radius: 2px; background: #f0f0f0;
    }
    .pom-item-name { font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
    .pom-item-meta { font-size: 11px; color: #999; }
    .pom-item-total { font-size: 14px; font-weight: 700; white-space: nowrap; }

    .pom-totals {
      margin-top: 16px; padding-top: 14px;
      border-top: 1px dashed #eee;
    }
    .pom-total-row {
      display: flex; justify-content: space-between;
      font-size: 13px; color: #666; padding: 5px 0;
    }
    .pom-total-row.grand {
      font-size: 16px; font-weight: 800; color: #1a1a1a;
      border-top: 1px solid #1a1a1a; margin-top: 8px; padding-top: 14px;
    }
    .pom-total-row.grand span:last-child { color: #e74c3c; }
    .pom-total-row .pom-discount { color: #27ae60; font-weight: 600; }
    .pom-total-row .pom-voucher { font-size: 11px; font-weight: 700; background: #f0fff4; padding: 2px 8px; border-radius: 2px; color: #27ae60; }

    .pom-footer {
      padding: 14px 26px 20px;
      border-top: 1px solid #f0f0f0;
      display: flex; justify-content: flex-end; gap: 10px;
    }
    .pom-btn-close {
      padding: 11px 28px; background: #1a1a1a; color: #fff;
      border: none; border-radius: 2px; font-size: 12px; font-weight: 700;
      letter-spacing: 1.5px; cursor: pointer; text-transform: uppercase;
      transition: background .2s;
    }
    .pom-btn-close:hover { background: #333; }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'pom-overlay';
  overlay.innerHTML = '<div id="pom-modal"></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closePom(); });
}

function closePom() {
  const ov = document.getElementById('pom-overlay');
  if (ov) { ov.classList.remove('open'); document.body.style.overflow = ''; }
}

function openOrderDetailModal(order) {
  injectProfileOrderModal();
  const overlay = document.getElementById('pom-overlay');
  const modal = document.getElementById('pom-modal');

  const statusMap = {
    Delivered: ['Đã giao xong', 'delivered'],
    Processing: ['Đang xử lý', 'processing'],
    Shipped: ['Được giao đi', 'shipped'],
    Cancelled: ['Đã hủy', 'cancelled'],
  };
  const [statusLabel, statusCls] = statusMap[order.status] || [order.status, 'processing'];
  const addr = order.shippingAddress || {};
  const discount = order.discountPrice || 0;
  const shippingFree = (order.shippingPrice || 0) === 0;

  modal.innerHTML = `
    <div class="pom-header">
      <div>
        <h2>Đơn hàng #${order._id.substring(0,8).toUpperCase()}</h2>
        <div style="display:flex; gap:10px; align-items:center; margin-top:6px;">
          <span style="font-size:12px; color:#aaa;">${new Date(order.createdAt).toLocaleString('vi-VN')}</span>
          <span class="pom-badge ${statusCls}">${statusLabel}</span>
        </div>
      </div>
      <button class="pom-close" id="pom-close-x">×</button>
    </div>

    <div class="pom-body">
      <div class="pom-grid">
        <div class="pom-info-card">
          <h4>Địa chỉ giao hàng</h4>
          <div class="pom-info-row"><span>Số nhà:</span> ${addr.street || '—'}</div>
          <div class="pom-info-row"><span>Quận/Huyện:</span> ${addr.state || '—'}</div>
          <div class="pom-info-row"><span>Thành phố:</span> ${addr.city || '—'}</div>
          <div class="pom-info-row"><span>Quốc gia:</span> ${addr.country || 'Việt Nam'}</div>
        </div>
        <div class="pom-info-card">
          <h4>Thanh toán &amp; Vận chuyển</h4>
          <div class="pom-info-row"><span>Phương thức:</span> ${order.paymentMethod || '—'}</div>
          <div class="pom-info-row"><span>Trạng thái TT:</span> ${order.isPaid ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}</div>
          <div class="pom-info-row"><span>Phí ship:</span> ${shippingFree ? '<span style="color:#27ae60;font-weight:600;">Được miễn phí</span>' : formatVnd(order.shippingPrice)}</div>
          ${order.voucherCode ? `<div class="pom-info-row"><span>Voucher:</span> <b style="color:#27ae60;">${order.voucherCode}</b></div>` : ''}
        </div>
      </div>

      <div class="pom-items-heading">Sản phẩm đã đặt (${order.orderItems.length} mặt hàng)</div>
      ${order.orderItems.map(item => `
        <div class="pom-item">
          <img src="${item.image || ''}" alt="${item.name}" onerror="this.style.background='#f0f0f0'">
          <div>
            <div class="pom-item-name">${item.name}</div>
            <div class="pom-item-meta">${formatVnd(item.price)} / chiếc &nbsp;·&nbsp; Số lượng: ${item.qty}</div>
          </div>
          <div class="pom-item-total">${formatVnd(item.price * item.qty)}</div>
        </div>
      `).join('')}

      <div class="pom-totals">
        <div class="pom-total-row">
          <span>Tạm tính</span>
          <span>${formatVnd(order.itemsPrice || 0)}</span>
        </div>
        ${discount > 0 ? `
        <div class="pom-total-row">
          <span>Giảm giá ${order.voucherCode ? '<span class="pom-voucher">' + order.voucherCode + '</span>' : ''}</span>
          <span class="pom-discount">-${formatVnd(discount)}</span>
        </div>` : ''}
        <div class="pom-total-row">
          <span>Phí vận chuyển</span>
          <span>${shippingFree ? '<span style="color:#27ae60;">Miễn phí</span>' : formatVnd(order.shippingPrice || 0)}</span>
        </div>
        <div class="pom-total-row grand">
          <span>TỔNG THANH TOÁN</span>
          <span>${formatVnd(order.totalPrice)}</span>
        </div>
      </div>
    </div>

    <div class="pom-footer">
      <a href="payment.html?orderId=${order._id}" class="pom-btn-close" style="text-decoration:none; background:#eee; color:#1a1a1a; margin-right:auto;">Theo dõi đơn hàng</a>
      <button class="pom-btn-close" id="pom-close-btn">ĐÓNG</button>
    </div>
  `;

  modal.querySelector('#pom-close-x').addEventListener('click', closePom);
  modal.querySelector('#pom-close-btn').addEventListener('click', closePom);

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

async function loadOrders() {
  const container = document.getElementById('ordersContainer');
  if (!container) return;

  try {
    const orders = await getMyOrders();
    if (!orders || orders.length === 0) {
      const panel = document.querySelector('[data-profile-panel="orders"]');
      if (panel) {
        panel.innerHTML = `
          <h2 class="ivy-main-title">Quản lý đơn hàng</h2>
          <div class="ivy-empty-state">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#eee" stroke-width="1.5" style="margin-bottom: 20px;">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <p style="color: #888; margin-bottom: 25px; font-size: 14px;">Bạn chưa có đơn hàng nào trong lịch sử.</p>
              <a href="shop.html" class="ivy-btn-black" style="display: inline-block; text-decoration: none;">BẮT ĐẦU MUA SẮM</a>
          </div>
        `;
      }
      return;
    }

    const statusTrans = {
      Delivered: 'Đã giao', Processing: 'Đang xử lý',
      Shipped: 'Đang giao', Cancelled: 'Đã hủy',
    };

    container.innerHTML = orders.map(order => `
      <tr>
        <td><strong>#${order._id.substring(0, 8).toUpperCase()}</strong></td>
        <td>${new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
        <td><span class="status-pill ${order.status === 'Delivered' ? 'status-delivered' : order.status === 'Cancelled' ? 'status-cancelled' : 'status-processing'}">${statusTrans[order.status] || order.status}</span></td>
        <td class="text-end">${formatVnd(order.totalPrice)}</td>
        <td class="text-end">
          <button class="pom-open-btn" data-order='${JSON.stringify(order).replace(/'/g, '&apos;')}' style="background:#1a1a1a; color:#fff; border:none; padding:8px 18px; font-size:10px; font-weight:700; letter-spacing:1px; cursor:pointer; border-radius:2px; text-transform:uppercase;">
            CHI TIẾT
          </button>
        </td>
      </tr>
    `).join('');

    container.querySelectorAll('.pom-open-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const order = JSON.parse(btn.getAttribute('data-order'));
        openOrderDetailModal(order);
      });
    });

  } catch (err) {
    container.innerHTML = '<tr><td colspan="5" style="color:red">Không thể tải danh sách đơn hàng.</td></tr>';
  }
}

function setupTabs() {
  const buttons = document.querySelectorAll('[data-profile-tab]');
  const panels = document.querySelectorAll('[data-profile-panel]');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-profile-tab');
      if (target === 'logout' || !target) return;

      // Update active state on buttons
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Toggle panels
      panels.forEach(p => {
        p.hidden = p.getAttribute('data-profile-panel') !== target;
      });
      
      // Logic for specific tabs
      if (target === 'orders') {
        loadOrders();
      } else if (target === 'wishlist') {
        loadWishlist();
      } else if (target === 'login-history') {
         getUserProfile().then(user => renderLoginHistory(user.loginHistory));
      } else if (target === 'viewed') {
         getUserProfile().then(user => renderViewedProducts(user.viewedProducts));
      } else if (target === 'wishlist') {
         getUserProfile().then(user => renderWishlist(user.wishlist));
      }
    });
  });
}

async function loadWishlist() {
    // Note: renderWishlist(user.wishlist) is already called in initProfile
    // This function can be used to re-fetch if needed
    const container = document.getElementById('wishlistContainer');
    if (!container) return;
    
    try {
        const user = await getUserProfile();
        renderWishlist(user.wishlist);
    } catch (err) {
        console.error('Error reloading wishlist:', err);
    }
}

function setupForm(user) {
  const form = document.getElementById('settingsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = form.querySelector('button[type="submit"]');
    const originalText = saveBtn.textContent;

    const lastName = document.getElementById('settingLastName')?.value || '';
    const firstName = document.getElementById('settingFirstName')?.value || '';
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    
    const updatedData = {
      name: `${lastName} ${firstName}`.trim(),
      phone: document.getElementById('settingPhone').value,
      dob: document.getElementById('settingDob').value,
      gender: gender,
    };

    try {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Đang lưu...';
      
      const updatedUser = await updateUserProfile(updatedData);
      alert('Cập nhật hồ sơ thành công!');
      
      // Re-populate everything with updated data
      const freshUser = await getUserProfile();
      renderUserInfo(freshUser);
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = originalText;
    }
  });
}

function setupLogout() {
  const btn = document.getElementById('signOutBtnSide');
  const modal = document.getElementById('logoutModal');
  const confirmBtn = document.getElementById('confirmLogout');
  const cancelBtn = document.getElementById('cancelLogout');

  if (btn && modal) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex';
    });
    
    cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    confirmBtn.addEventListener('click', () => {
      logoutUser();
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if(e.target === modal) modal.style.display = 'none';
    });
  }
}

document.addEventListener('DOMContentLoaded', initProfile);
