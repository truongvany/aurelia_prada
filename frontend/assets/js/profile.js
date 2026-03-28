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
  const emailEl = document.getElementById('userEmail');
  const roleEl = document.getElementById('userRole');
  const phoneEl = document.getElementById('userPhone');
  const cityEl = document.getElementById('userCity');

  if (nameEl) nameEl.textContent = user.name || 'N/A';
  if (emailEl) emailEl.textContent = user.email;
  if (roleEl) roleEl.textContent = user.role === 'admin' ? 'Quản Trị Viên' : 'Khách Hàng';
  if (phoneEl) phoneEl.textContent = user.phone || '---';
  if (cityEl) cityEl.textContent = user.address?.city || '---';
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

    container.innerHTML = orders
      .map(order => `
        <tr>
          <td>${order._id.substring(0, 8)}</td>
          <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          <td><span class="status-pill ${order.status === 'Delivered' ? 'status-delivered' : 'status-processing'}">${order.status}</span></td>
          <td class="text-end">${formatVnd(order.totalPrice)}</td>
          <td class="text-end"><button class="btn btn-light-custom btn-sm" data-order-id="${order._id}">Xem chi tiết</button></td>
        </tr>
        <tr class="order-details-row" id="order-details-${order._id}" style="display:none; background:#fbfaf8;">
          <td colspan="5" style="padding: 14px 12px;">
            <strong>Địa chỉ:</strong> ${order.shippingAddress?.street || '-'}, ${order.shippingAddress?.city || '-'}, ${order.shippingAddress?.state || '-'}, ${order.shippingAddress?.zipCode || '-'}, ${order.shippingAddress?.country || '-'}<br>
            <strong>Thanh toán:</strong> ${order.paymentMethod || '-'}<br>
            <strong>Thuế:</strong> ${formatVnd(order.taxPrice || 0)} • <strong>VC:</strong> ${formatVnd(order.shippingPrice || 0)}<br>
            <div style="margin-top:8px;">
              <table style="width:100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr><th style="text-align:left; border-bottom:1px solid #eee; padding:6px;">Sản phẩm</th><th style="text-align:right; border-bottom:1px solid #eee; padding:6px;">SL</th><th style="text-align:right; border-bottom:1px solid #eee; padding:6px;">Giá</th><th style="text-align:right; border-bottom:1px solid #eee; padding:6px;">Tạm tính</th></tr>
                </thead>
                <tbody>
                  ${order.orderItems.map(item => `
                    <tr>
                      <td style="padding:6px;">${item.name}</td>
                      <td style="text-align:right; padding:6px;">${item.qty}</td>
                      <td style="text-align:right; padding:6px;">${formatVnd(item.price)}</td>
                      <td style="text-align:right; padding:6px;">${formatVnd(item.qty * item.price)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      `)
      .join('');

    document.querySelectorAll('button[data-order-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-order-id');
        const row = document.getElementById(`order-details-${orderId}`);
        if (row) {
          row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
        }
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
