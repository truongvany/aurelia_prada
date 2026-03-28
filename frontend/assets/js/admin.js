import { 
  fetchProducts, 
  fetchAllOrders, 
  fetchAllUsers, 
  fetchDashboardStats, 
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  updateOrderToDelivered,
  deleteUser
} from './api.js';
import { formatVnd } from './common.js';
import { renderAdminLayout } from './admin-layout.js';

async function initDashboard() {
  const chartEl = document.getElementById('dashboard-chart');
  const recentSalesEl = document.getElementById('recent-sales-list');
  if (!chartEl || !recentSalesEl) return;

  try {
    const data = await fetchDashboardStats();
    if (!data.success) throw new Error('Lỗi API');

    const { stats, recentSales, monthlySales } = data;

    // 1. Cập nhật thẻ KPI
    document.getElementById('stat-revenue').textContent = formatVnd(stats.totalRevenue);
    document.getElementById('stat-orders').textContent = stats.totalOrders.toLocaleString();
    document.getElementById('stat-customers').textContent = stats.totalUsers.toLocaleString();
    document.getElementById('stat-products').textContent = stats.totalProducts.toLocaleString();

    // 2. Render Chart
    const maxVal = Math.max(...monthlySales.map(s => s.total || 0), 1);
    
    chartEl.innerHTML = monthlySales.map((s, i) => {
        const height = (s.total / maxVal) * 100;
        const isActive = i === monthlySales.length - 1 ? 'active' : ''; 
        return `
            <div class="bar-item">
                <div class="bar-pillar ${isActive}" style="height: ${height}%"></div>
                <span class="bar-label">Tháng ${s.month.split('-')[1]}</span>
            </div>
        `;
    }).join('');

    // 3. Render Đơn hàng gần đây
    recentSalesEl.innerHTML = recentSales.map(sale => {
        const firstItem = sale.orderItems[0];
        const timeAgo = getTimeAgo(new Date(sale.createdAt));
        return `
            <div class="sale-item">
                <img src="${firstItem.image}" class="sale-img" alt="${firstItem.name}">
                <div class="sale-info">
                    <span class="sale-name">${firstItem.name}</span>
                    <span class="sale-time">${timeAgo}</span>
                </div>
                <div class="sale-amount" style="color: ${sale.status === 'Cancelled' ? '#C53030' : 'var(--admin-text-main)'}">
                    ${sale.status === 'Cancelled' ? '-' : '+'}${formatVnd(sale.totalPrice)}
                </div>
            </div>
        `;
    }).join('');

  } catch (err) {
    console.error('Lỗi tải dữ liệu Tổng quan:', err);
  }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return Math.floor(seconds) + " giây trước";
}

async function renderProducts() {
  const body = document.getElementById('admin-products-body');
  if (!body) return;
  
  try {
    const products = await fetchProducts();
    body.innerHTML = products.map((p) => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${p.image}" alt="${p.name}" style="width: 40px; height: 40px; object-fit: cover; border: 1px solid var(--admin-border);" />
            <span style="font-weight: 700;">${p.name}</span>
          </div>
        </td>
        <td>${p.category?.name || 'Chưa phân loại'}</td>
        <td>${formatVnd(p.price)}</td>
        <td><span class="status-pill ${p.stock <= 0 ? 'danger' : p.stock <= 20 ? 'warning' : 'success'}">${p.stock <= 0 ? 'Hết hàng' : 'Đang bán'}</span></td>
        <td>
          <button class="btn-admin-action edit" data-id="${p._id}" data-prod='${JSON.stringify(p).replace(/'/g, "&apos;")}'>SỬA</button>
          <button class="btn-admin-action delete" data-id="${p._id}">XÓA</button>
        </td>
      </tr>
    `).join('');

    // Redirect to Edit Page
    body.querySelectorAll('.edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.location.href = `product-form.html?id=${id}`;
      });
    });

    body.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
          try {
            await deleteProduct(btn.getAttribute('data-id'));
            renderProducts();
          } catch (err) { alert(err.message); }
        }
      });
    });

  } catch (err) {
    body.innerHTML = `<tr><td colspan="5">Lỗi tải danh sách sản phẩm</td></tr>`;
  }
}

async function renderOrders() {
  const body = document.getElementById('admin-orders-body');
  if (!body) return;
  
  try {
    const orders = await fetchAllOrders();
    body.innerHTML = orders.map((o) => `
      <tr>
        <td><strong>#${o._id.substring(0, 8).toUpperCase()}</strong></td>
        <td>${o.user?.name || 'Khách vãng lai'}</td>
        <td>${new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
        <td>${o.orderItems?.length || 0} mục</td>
        <td>${formatVnd(o.totalPrice)}</td>
        <td><span class="status-pill ${o.status === 'Delivered' ? 'success' : o.status === 'Processing' ? 'warning' : o.status === 'Shipped' ? 'info' : 'danger'}">${o.status === 'Delivered' ? 'Đã giao' : o.status === 'Processing' ? 'Đang xử lý' : o.status === 'Cancelled' ? 'Hủy' : o.status}</span></td>
        <td>
            <button class="btn-admin-action edit view-details" data-id="${o._id}">CHI TIẾT</button>
            ${o.status !== 'Delivered' && o.status !== 'Cancelled' ? `<button class="btn-admin-action mark-delivered" data-id="${o._id}" style="color:var(--success); border-color:var(--success);">ĐÃ GIAO</button>` : ''}
        </td>
      </tr>
      <tr class="order-details-row" id="details-${o._id}" style="display:none; background: var(--admin-sidebar);">
        <td colspan="7" style="padding: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 30px;">
            <div>
              <h5 style="margin-top:0; font-size: 13px; text-transform: uppercase;">Thông tin Giao hàng</h5>
              <p style="font-size:12px; margin:5px 0;"><strong>Địa chỉ:</strong> ${o.shippingAddress?.street}, ${o.shippingAddress?.city}</p>
              <p style="font-size:12px; margin:5px 0;"><strong>Thanh toán:</strong> ${o.paymentMethod}</p>
              <p style="font-size:12px; margin:5px 0;"><strong>Phí Ship:</strong> ${formatVnd(o.shippingPrice)}</p>
            </div>
            <div>
              <h5 style="margin-top:0; font-size: 13px; text-transform: uppercase;">Sản phẩm</h5>
              <table style="width:100%; font-size: 12px; border-collapse: collapse;">
                ${o.orderItems.map(item => `
                  <tr>
                    <td style="padding: 5px 0; border-bottom: 1px dotted var(--admin-border);">${item.name} x ${item.qty}</td>
                    <td style="padding: 5px 0; border-bottom: 1px dotted var(--admin-border); text-align:right;">${formatVnd(item.price * item.qty)}</td>
                  </tr>
                `).join('')}
              </table>
              <div style="text-align:right; font-weight:800; margin-top:10px; font-size: 14px;">Tổng cộng: ${formatVnd(o.totalPrice)}</div>
            </div>
          </div>
        </td>
      </tr>
    `).join('');

    body.querySelectorAll('.view-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const row = document.getElementById(`details-${id}`);
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
      });
    });

    body.querySelectorAll('.mark-delivered').forEach(btn => {
      btn.addEventListener('click', async () => {
         if(confirm('Xác nhận Đơn hàng đã được giao thành công?')) {
             try {
                 await updateOrderToDelivered(btn.getAttribute('data-id'));
                 renderOrders();
             } catch(err) { alert(err.message); }
         }
      });
    });

  } catch (err) {
    body.innerHTML = `<tr><td colspan="7">Lỗi tải danh sách đơn hàng</td></tr>`;
  }
}

async function renderCustomers() {
  const body = document.getElementById('admin-customers-body');
  if (!body) return;
  
  try {
    const users = await fetchAllUsers();
    body.innerHTML = users.map((c) => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${c.email}<br><small style="color:var(--admin-text-muted);">${c.phone || 'Chưa cung cấp SĐT'}</small></td>
        <td><span class="status-pill ${c.role === 'admin' ? 'info' : 'success'}">${c.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'NGƯỜI DÙNG'}</span></td>
        <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
        <td>
           ${c.role !== 'admin' ? `<button class="btn-admin-action delete delete-user" data-id="${c._id}">XÓA</button>` : ''}
        </td>
      </tr>
    `).join('');

    body.querySelectorAll('.delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
         if(confirm('Hành động này không thể hoàn tác. Bạn có chắc chắn xóa tài khoản này?')) {
             try {
                 await deleteUser(btn.getAttribute('data-id'));
                 renderCustomers();
             } catch(err) { alert(err.message); }
         }
      });
    });

  } catch (err) {
    body.innerHTML = `<tr><td colspan="5">Lỗi tải danh sách khách hàng</td></tr>`;
  }
}

function setupProductRedirect() {
  const addBtn = document.getElementById('add-product-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      window.location.href = 'product-form.html';
    };
  }
}

function setupSettings() {
    const form = document.getElementById('settings-form');
    const notice = document.getElementById('settings-notice');
    if (form && notice) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            notice.textContent = 'Đã lưu cấu hình (Mô phỏng)';
            setTimeout(() => { notice.textContent = ''; }, 3000);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dựng Layout chung (Sidebar, Header, Dark Mode...)
  renderAdminLayout();

  const path = window.location.pathname;
  
  // 2. Tải Data tùy theo trang
  if (path.includes('dashboard.html') || path === '/pages/admin/' || path === '/pages/admin') initDashboard();
  if (path.includes('products.html')) {
    renderProducts();
    setupProductRedirect();
  }
  if (path.includes('orders.html')) renderOrders();
  if (path.includes('customers.html')) renderCustomers();
  
  setupSettings();
});
