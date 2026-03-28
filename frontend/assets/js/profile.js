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
        <div class="orders-empty">
          <p>Bạn chưa có đơn hàng nào.</p>
          <a href="shop.html" class="btn btn-outline" style="margin-top: 15px; display: inline-block;">Bắt Đầu Mua Sắm</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="orders-list">
        ${orders.map(order => `
          <div class="order-card card" style="margin-bottom: 15px; padding: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
              <div>
                <strong>Mã Đơn: #${order._id.substring(0, 8)}</strong>
                <p style="margin: 5px 0 0; font-size: 13px; color: #999;">Ngày đặt: ${new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span class="status ${order.status === 'Delivered' ? 'success' : 'warning'}" style="padding: 4px 10px; border-radius: 4px; font-size: 12px;">
                ${order.status}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Số lượng: ${order.orderItems.length} sản phẩm</span>
              <strong>Tổng thanh toán: ${formatVnd(order.totalPrice)}</strong>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = '<p style="color:red">Không thể tải danh sách đơn hàng.</p>';
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
  const btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        logoutUser();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initProfile);
