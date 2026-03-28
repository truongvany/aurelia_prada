import { logoutUser } from './api.js';

export function renderAdminLayout() {
  const activePage = window.location.pathname.split('/').pop() || 'dashboard.html';

  const layoutHTML = `
    <!-- Sidebar -->
    <aside class="admin-sidebar" id="adminSidebar">
      <div class="admin-logo">
        <h1>AURELIA</h1>
        <small>Hệ thống Quản trị</small>
      </div>

      <nav class="admin-nav">
        <a href="dashboard.html" class="admin-nav-item ${activePage === 'dashboard.html' || activePage === '' ? 'active' : ''}">
          Tổng quan
        </a>
        <a href="products.html" class="admin-nav-item ${activePage === 'products.html' ? 'active' : ''}">
          Sản phẩm
        </a>
        <a href="orders.html" class="admin-nav-item ${activePage === 'orders.html' ? 'active' : ''}">
          Đơn hàng
        </a>
        <a href="customers.html" class="admin-nav-item ${activePage === 'customers.html' ? 'active' : ''}">
          Khách hàng
        </a>
        <a href="vouchers.html" class="admin-nav-item ${activePage === 'vouchers.html' ? 'active' : ''}">
          Mã giảm giá
        </a>
        <a href="settings.html" class="admin-nav-item ${activePage === 'settings.html' ? 'active' : ''}">
          Cài đặt
        </a>
      </nav>

      <div class="admin-sidebar-footer">
        <div class="upgrade-card">
          <button id="upgrade-btn">NÂNG CẤP GÓI</button>
        </div>
        <a href="#" class="admin-nav-item" id="admin-logout">
          Đăng xuất
        </a>
      </div>
    </aside>

    <!-- Main Content wrapper -->
    <div class="admin-content" id="adminContent">
      <!-- Header -->
      <header class="admin-header">
        <div class="admin-header-left">
          <span class="admin-header-title" id="adminHeaderTitle">AURELIA Admin</span>
          <div class="admin-search-box">
             <input type="text" placeholder="Tìm kiếm hệ thống..." id="adminSearchInput" />
          </div>
        </div>
        <div class="admin-header-right">
          <a href="../../index.html" class="btn-view-store">Vào cửa hàng</a>
          <button class="btn-icon mode-toggle" id="themeToggle" title="Chuyển chế độ Sáng/Tối">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="moon-icon" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </button>
          <button class="btn-icon" title="Thông báo">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
             <span class="notif-dot"></span>
          </button>
          <div class="admin-user-pill">
            <span id="admin-name" style="margin-left:5px;">Admin</span>
          </div>
        </div>
      </header>

      <!-- Main Section Container (Inject page content here) -->
      <main class="dashboard-main" id="adminMainContent">
      </main>
    </div>
  `;

  const appContainer = document.getElementById('admin-app');
  if (!appContainer) return;

  const originalContent = appContainer.innerHTML;
  appContainer.innerHTML = layoutHTML;

  const mainContentContainer = document.getElementById('adminMainContent');
  mainContentContainer.innerHTML = originalContent;

  const userInfoStr = localStorage.getItem('userInfo');
  if(userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      const nameEl = document.getElementById('admin-name');
      if (nameEl && userInfo.name) nameEl.textContent = userInfo.name;
  }

  const logoutBtn = document.getElementById('admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser();
    });
  }

  const titleMap = {
      'dashboard.html': 'Tổng quan',
      'products.html': 'Quản lý Sản phẩm',
      'orders.html': 'Quản lý Đơn hàng',
      'customers.html': 'Quản lý Khách hàng',
      'vouchers.html': 'Quản lý Mã giảm giá',
      'settings.html': 'Cài đặt Hệ thống'
  };
  const titleEl = document.getElementById('adminHeaderTitle');
  if (titleEl) titleEl.textContent = titleMap[activePage] || 'Hệ thống Quản trị';

  setupThemeToggle();
}

function setupThemeToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;
    
    const savedTheme = localStorage.getItem('adminTheme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('adminTheme', isDark ? 'dark' : 'light');
    });
}
