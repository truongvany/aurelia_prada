import { logoutUser } from './api.js';

export function renderAdminLayout() {
  const userInfoStr = localStorage.getItem('userInfo');
  const isInAdmin = window.location.pathname.includes('/admin/');
  const isInPages = window.location.pathname.includes('/pages/');
  const loginPath = isInAdmin ? '../login.html' : (isInPages ? 'login.html' : 'pages/login.html');

  if (!userInfoStr) {
     window.location.href = loginPath;
     return;
  }

  const user = JSON.parse(userInfoStr);
  if (user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang quản trị!');
      window.location.href = loginPath;
      return;
  }

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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Tổng quan
        </a>
        <a href="products.html" class="admin-nav-item ${activePage === 'products.html' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          Sản phẩm
        </a>
        <a href="orders.html" class="admin-nav-item ${activePage === 'orders.html' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          Đơn hàng
        </a>
        <a href="customers.html" class="admin-nav-item ${activePage === 'customers.html' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Khách hàng
        </a>
        <a href="vouchers.html" class="admin-nav-item ${activePage === 'vouchers.html' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7z"></path><path d="M13 5v14"></path><path d="M9 9h.01"></path><path d="M9 15h.01"></path></svg>
          Mã giảm giá
        </a>
        <a href="sales.html" class="admin-nav-item ${activePage === 'sales.html' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"></path><path d="M2 7h20v5H2z"></path><path d="M12 22V7"></path><path d="M12 7c0-2.5 1.8-4.5 4-4.5 1.8 0 3 1.4 3 3 0 2.8-3 4-7 4z"></path><path d="M12 7c0-2.5-1.8-4.5-4-4.5-1.8 0-3 1.4-3 3 0 2.8 3 4 7 4z"></path></svg>
          Khuyến mãi & Combo
        </a>
        <a href="settings.html" class="admin-nav-item ${activePage === 'settings.html' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          Cài đặt
        </a>
      </nav>

      <div class="admin-sidebar-footer">
        <a href="#" class="admin-nav-item" id="admin-logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
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
             <input type="text" placeholder="Tìm kiếm hệ thống..." id="adminSearchInput" title="Tìm nhanh (Ctrl + K)"/>
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
            <img src="https://ui-avatars.com/api/?name=Admin&background=000&color=fff" alt="Avatar">
            <span id="admin-name">Admin</span>
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
      'sales.html': 'Quản lý Khuyến mãi & Combo',
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
