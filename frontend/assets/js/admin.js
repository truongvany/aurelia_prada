import { 
  fetchProducts, 
  fetchAllOrders, 
  fetchAllUsers, 
  fetchDashboardStats, 
  logoutUser,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories
} from './api.js';
import { formatVnd } from './common.js';

async function initDashboard() {
  const chartEl = document.getElementById('dashboard-chart');
  const recentSalesEl = document.getElementById('recent-sales-list');
  if (!chartEl || !recentSalesEl) return;

  try {
    const data = await fetchDashboardStats();
    if (!data.success) throw new Error('API Error');

    const { stats, recentSales, monthlySales } = data;

    // 1. Update KPI Cards
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
                <span class="bar-label">${s.month}</span>
            </div>
        `;
    }).join('');

    // 3. Render Recent Sales
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
                <div class="sale-amount" style="color: ${sale.status === 'Cancelled' ? '#be3f3f' : '#1A1A1A'}">
                    ${sale.status === 'Cancelled' ? '-' : '+'}${formatVnd(sale.totalPrice)}
                </div>
            </div>
        `;
    }).join('');

  } catch (err) {
    console.error('Error loading dashboard stats:', err);
  }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " secs ago";
}

async function renderProducts() {
  const body = document.getElementById('admin-products-body');
  if (!body) return;
  
  try {
    const products = await fetchProducts();
    body.innerHTML = products.map((p) => `
      <tr>
        <td>${p.name}</td>
        <td>${p.category?.name || 'Unknown'}</td>
        <td>${formatVnd(p.price)}</td>
        <td><span class="status-pill ${p.stock <= 0 ? 'danger' : p.stock <= 20 ? 'warning' : 'success'}">${p.stock <= 0 ? 'Out of Stock' : 'Active'}</span></td>
        <td>
          <button class="btn-admin-action edit" data-id="${p._id}" data-prod='${JSON.stringify(p).replace(/'/g, "&apos;")}'>EDIT</button>
          <button class="btn-admin-action delete" data-id="${p._id}">DEL</button>
        </td>
      </tr>
    `).join('');

    // Attach row events
    body.querySelectorAll('.edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const prod = JSON.parse(btn.getAttribute('data-prod'));
        openProductModal(prod);
      });
    });

    body.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this product?')) {
          try {
            await deleteProduct(btn.getAttribute('data-id'));
            renderProducts();
          } catch (err) { alert(err.message); }
        }
      });
    });

  } catch (err) {
    body.innerHTML = `<tr><td colspan="5">Error loading products</td></tr>`;
  }
}

async function renderOrders() {
  const body = document.getElementById('admin-orders-body');
  if (!body) return;
  
  try {
    const orders = await fetchAllOrders();
    body.innerHTML = orders.map((o) => `
      <tr>
        <td>${o._id.substring(0, 8).toUpperCase()}</td>
        <td>${o.user?.name || 'Guest'}</td>
        <td>${new Date(o.createdAt).toLocaleDateString()}</td>
        <td>${o.orderItems?.length || 0}</td>
        <td>${formatVnd(o.totalPrice)}</td>
        <td><span class="status-pill ${o.status === 'Delivered' ? 'success' : o.status === 'Processing' ? 'warning' : o.status === 'Shipped' ? 'info' : 'danger'}">${o.status}</span></td>
        <td><button class="btn-admin-action edit view-details" data-id="${o._id}">Chi tiết</button></td>
      </tr>
      <tr class="order-details-row" id="details-${o._id}" style="display:none; background: #fafafa;">
        <td colspan="7" style="padding: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 30px;">
            <div>
              <h5 style="margin-top:0">Thông tin giao hàng</h5>
              <p style="font-size:13px; margin:5px 0;"><strong>Địa chỉ:</strong> ${o.shippingAddress?.street}, ${o.shippingAddress?.city}</p>
              <p style="font-size:13px; margin:5px 0;"><strong>Thanh toán:</strong> ${o.paymentMethod}</p>
              <p style="font-size:13px; margin:5px 0;"><strong>Phí ship:</strong> ${formatVnd(o.shippingPrice)}</p>
            </div>
            <div>
              <h5 style="margin-top:0">Sản phẩm</h5>
              <table style="width:100%; font-size: 13px; border-collapse: collapse;">
                ${o.orderItems.map(item => `
                  <tr>
                    <td style="padding: 5px 0; border-bottom: 1px solid #eee;">${item.name} x ${item.qty}</td>
                    <td style="padding: 5px 0; border-bottom: 1px solid #eee; text-align:right;">${formatVnd(item.price * item.qty)}</td>
                  </tr>
                `).join('')}
              </table>
              <div style="text-align:right; font-weight:800; margin-top:10px;">Tổng: ${formatVnd(o.totalPrice)}</div>
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

  } catch (err) {
    body.innerHTML = `<tr><td colspan="7">Error loading orders</td></tr>`;
  }
}

async function renderCustomers() {
  const body = document.getElementById('admin-customers-body');
  if (!body) return;
  
  try {
    const users = await fetchAllUsers();
    body.innerHTML = users.map((c) => `
      <tr>
        <td>${c.name}</td>
        <td>${c.email}<br><small>${c.phone || 'N/A'}</small></td>
        <td>Admin: ${c.role === 'admin' ? 'Yes' : 'No'}</td>
        <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</td>
        <td><span class="status-pill ${c.role === 'admin' ? 'info' : 'success'}">${c.role}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    body.innerHTML = `<tr><td colspan="5">Error loading customers</td></tr>`;
  }
}

// Modal Logic
async function openProductModal(product = null) {
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('product-form');
  
  // Fill Categories
  const categorySelect = document.getElementById('prod-category');
  try {
    const cats = await fetchCategories();
    categorySelect.innerHTML = cats.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
  } catch (err) { console.error(err); }

  if (product) {
    title.textContent = 'Edit Product';
    document.getElementById('edit-product-id').value = product._id;
    document.getElementById('prod-name').value = product.name;
    document.getElementById('prod-price').value = product.price;
    document.getElementById('prod-category').value = product.category?._id || product.category || '';
    document.getElementById('prod-stock').value = product.stock;
    document.getElementById('prod-image').value = product.image;
    document.getElementById('prod-desc').value = product.description || '';
  } else {
    title.textContent = 'Add New Product';
    form.reset();
    document.getElementById('edit-product-id').value = '';
  }
  
  modal.style.display = 'flex';
}

function setupProductModal() {
  const modal = document.getElementById('product-modal');
  const addBtn = document.getElementById('add-product-btn');
  const closeBtn = document.getElementById('close-modal');
  const form = document.getElementById('product-form');

  if (addBtn) addBtn.onclick = () => openProductModal();
  if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
  
  window.onclick = (e) => {
    if (e.target == modal) modal.style.display = 'none';
  };

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-product-id').value;
      const data = {
        name: document.getElementById('prod-name').value,
        price: document.getElementById('prod-price').value,
        category: document.getElementById('prod-category').value,
        stock: document.getElementById('prod-stock').value,
        image: document.getElementById('prod-image').value,
        description: document.getElementById('prod-desc').value,
      };

      try {
        if (id) {
          await updateProduct(id, data);
        } else {
          await createProduct(data);
        }
        modal.style.display = 'none';
        renderProducts();
      } catch (err) {
        alert(err.message);
      }
    };
  }
}

function setupSettings() {
    const form = document.getElementById('settings-form');
    const notice = document.getElementById('settings-notice');
    if (form && notice) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            notice.textContent = 'Configuration saved successfully (Simulated)';
            setTimeout(() => { notice.textContent = ''; }, 3000);
        });
    }
}

function setupLogout() {
    const btn = document.getElementById('admin-logout');
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  
  if (path.includes('dashboard.html')) initDashboard();
  if (path.includes('products.html')) {
    renderProducts();
    setupProductModal();
  }
  if (path.includes('orders.html')) renderOrders();
  if (path.includes('customers.html')) renderCustomers();
  
  setupSettings();
  setupLogout();

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
