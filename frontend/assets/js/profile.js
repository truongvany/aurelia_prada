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
    
    profileContent.style.display = 'block';
    if (loadingSpinner) loadingSpinner.style.display = 'none';

    // Load orders
    await loadOrders();

    setupTabs();
    setupForm(user);
    setupLogout();
    
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

function renderSettingsForm(user) {
  const nameInput = document.getElementById('settingName');
  const emailInput = document.getElementById('settingEmail');
  const phoneInput = document.getElementById('settingPhone');
  const streetInput = document.getElementById('settingStreet');
  const cityInput = document.getElementById('settingCity');
  const countryInput = document.getElementById('settingCountry');

  if (nameInput) nameInput.value = user.name || '';
  if (emailInput) emailInput.value = user.email || '';
  if (phoneInput) phoneInput.value = user.phone || '';
  if (streetInput) streetInput.value = user.address?.street || '';
  if (cityInput) cityInput.value = user.address?.city || '';
  if (countryInput) countryInput.value = user.address?.country || '';
}

async function loadOrders() {
  const container = document.getElementById('ordersContainer');
  if (!container) return;

  try {
    const orders = await getMyOrders();
    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" class="orders-empty">Bạn chưa có đơn hàng nào. <a href="shop.html" class="btn btn-outline" style="margin-left: 12px;">Bắt Đầu Mua Sắm</a></td>
        </tr>
      `;
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
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      panels.forEach(p => p.hidden = p.getAttribute('data-profile-panel') !== target);
    });
  });
}

function setupForm(user) {
  const form = document.getElementById('settingsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = form.querySelector('button[type="submit"]');
    const originalText = saveBtn.textContent;

    const updatedData = {
      name: document.getElementById('settingName').value,
      phone: document.getElementById('settingPhone').value,
      address: {
        street: document.getElementById('settingStreet')?.value || '',
        city: document.getElementById('settingCity').value,
        country: document.getElementById('settingCountry').value,
      }
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
  const btn = document.getElementById('signOutBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        logoutUser();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initProfile);
