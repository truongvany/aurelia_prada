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
  updateOrderStatus,
  deleteUser,
  fetchAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher
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

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function injectOrderModal() {
  if (document.getElementById('admin-order-modal')) return;
  const style = document.createElement('style');
  style.textContent = `
    #admin-order-modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.55);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity .25s;
    }
    #admin-order-modal-overlay.open { opacity: 1; pointer-events: auto; }
    #admin-order-modal {
      background: var(--admin-card, #fff); border-radius: 0;
      width: 94%; max-width: 780px; max-height: 90vh; overflow-y: auto;
      transform: translateY(24px); transition: transform .25s;
      box-shadow: 0 24px 80px rgba(0,0,0,.25);
    }
    #admin-order-modal-overlay.open #admin-order-modal { transform: translateY(0); }

    .aom-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 22px 28px 16px;
      border-bottom: 1px solid var(--admin-border, #eee);
    }
    .aom-header h2 { font-size: 16px; font-weight: 800; margin: 0; letter-spacing: .5px; }
    .aom-close {
      background: none; border: none; cursor: pointer; font-size: 22px;
      color: var(--admin-text-muted, #999); line-height: 1; padding: 0 4px;
    }
    .aom-close:hover { color: #e74c3c; }
    .aom-body { padding: 26px 28px; }
    .aom-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .aom-meta-card {
      background: var(--admin-sidebar, #fafafa);
      border: 1px solid var(--admin-border, #eee);
      border-radius: 2px; padding: 16px 18px;
    }
    .aom-meta-card h4 {
      font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px;
      font-weight: 700; color: var(--admin-text-muted, #999);
      margin: 0 0 12px;
    }
    .aom-meta-row { font-size: 13px; margin: 6px 0; color: var(--admin-text-main, #1a1a1a); display: flex; gap: 8px; }
    .aom-meta-row strong { min-width: 110px; flex-shrink: 0; font-weight: 600; color: var(--admin-text-muted, #777); }
    .aom-items-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
    .aom-item {
      display: grid; grid-template-columns: 56px 1fr auto;
      gap: 14px; align-items: center;
      padding: 12px 0; border-bottom: 1px solid var(--admin-border, #eee);
    }
    .aom-item:last-child { border-bottom: none; }
    .aom-item img { width: 56px; height: 70px; object-fit: cover; border-radius: 2px; background: #f5f5f5; }
    .aom-item-name { font-size: 13px; font-weight: 600; }
    .aom-item-sub { font-size: 11px; color: var(--admin-text-muted, #888); margin-top: 3px; }
    .aom-item-price { font-size: 14px; font-weight: 700; text-align: right; white-space: nowrap; }
    .aom-totals { margin-top: 18px; border-top: 2px solid var(--admin-border, #eee); padding-top: 14px; }
    .aom-total-row {
      display: flex; justify-content: space-between;
      font-size: 13px; padding: 5px 0; color: var(--admin-text-main, #555);
    }
    .aom-total-row.grand {
      font-size: 16px; font-weight: 800;
      border-top: 1px solid var(--admin-border, #eee);
      margin-top: 8px; padding-top: 12px;
    }
    .aom-total-row.grand span:last-child { color: #e74c3c; }
    .aom-total-row .discount { color: #27ae60; }
    .aom-footer {
      padding: 16px 28px 22px; border-top: 1px solid var(--admin-border, #eee);
      display: flex; justify-content: flex-end; gap: 10px;
    }
    .aom-btn {
      padding: 10px 22px; border-radius: 2px; font-size: 12px;
      font-weight: 700; cursor: pointer; letter-spacing: 1px;
      text-transform: uppercase; border: 1.5px solid;
      transition: all .2s;
    }
    .aom-btn.primary { background: var(--admin-text-main, #1a1a1a); color: #fff; border-color: var(--admin-text-main, #1a1a1a); }
    .aom-btn.primary:hover { opacity: .85; }
    .aom-btn.secondary { background: transparent; color: var(--admin-text-muted, #555); border-color: var(--admin-border, #ddd); }
    .aom-btn.secondary:hover { background: var(--admin-sidebar, #f5f5f5); }
    .status-badge {
      display: inline-block; padding: 3px 10px; border-radius: 2px;
      font-size: 11px; font-weight: 700; letter-spacing: .5px;
    }
    .sb-delivered { background: #e8f8f0; color: #27ae60; }
    .sb-processing { background: #fff8e1; color: #f39c12; }
    .sb-shipped { background: #e8f0ff; color: #2980b9; }
    .sb-cancelled { background: #fde8e8; color: #e74c3c; }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'admin-order-modal-overlay';
  overlay.innerHTML = `<div id="admin-order-modal"></div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => { if (e.target === overlay) closeOrderModal(); });
}

function closeOrderModal() {
  const overlay = document.getElementById('admin-order-modal-overlay');
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}

function openOrderModal(order) {
  injectOrderModal();
  const overlay = document.getElementById('admin-order-modal-overlay');
  const modal = document.getElementById('admin-order-modal');

  const statusMap = {
    Processing: ['Đang xử lý', 'sb-processing'],
    Confirmed: ['Đã xác nhận', 'sb-confirmed'],
    Shipped: ['Đang giao', 'sb-shipped'],
    Delivered: ['Đã giao', 'sb-delivered'],
    Cancelled: ['Đã hủy', 'sb-cancelled'],
  };
  const [statusLabel, statusClass] = statusMap[order.status] || [order.status, 'sb-processing'];

  const shipping = order.shippingAddress || {};
  const discount = order.discountPrice || 0;

  modal.innerHTML = `
    <div class="aom-header">
      <div>
        <h2>Chi tiết đơn hàng #${order._id.substring(0, 8).toUpperCase()}</h2>
        <div style="margin-top:6px; display:flex; gap:10px; align-items:center; font-size:12px; color:var(--admin-text-muted,#888);">
          <span>${new Date(order.createdAt).toLocaleString('vi-VN')}</span>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <a href="../payment.html?orderId=${order._id}" target="_blank" class="aom-btn secondary" style="text-decoration:none; padding: 6px 12px; font-size: 10px;">Trang thanh toán</a>
        <button class="aom-close" id="aom-close-btn">✕</button>
      </div>
    </div>

    <div class="aom-body">
      <div class="aom-meta-grid">
        <div class="aom-meta-card">
          <h4>Thông tin khách hàng</h4>
          <div class="aom-meta-row"><strong>Tên:</strong> ${order.user?.name || 'Khách vãng lai'}</div>
          <div class="aom-meta-row"><strong>Email:</strong> ${order.user?.email || '—'}</div>
        </div>
        <div class="aom-meta-card">
          <h4>Địa chỉ giao hàng</h4>
          <div class="aom-meta-row"><strong>Đường:</strong> ${shipping.street || '—'}</div>
          <div class="aom-meta-row"><strong>Khu vực:</strong> ${shipping.state || '—'}, ${shipping.city || '—'}</div>
          <div class="aom-meta-row"><strong>Quốc gia:</strong> ${shipping.country || 'Việt Nam'}</div>
        </div>
        <div class="aom-meta-card">
          <h4>Thanh toán</h4>
          <div class="aom-meta-row"><strong>Phương thức:</strong> ${order.paymentMethod || '—'}</div>
          <div class="aom-meta-row"><strong>Trạng thái:</strong> ${order.isPaid ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}</div>
          ${order.isPaid ? `<div class="aom-meta-row"><strong>Ngày TT:</strong> ${new Date(order.paidAt).toLocaleDateString('vi-VN')}</div>` : ''}
        </div>
        <div class="aom-meta-card">
          <h4>Quản lý Trạng thái</h4>
          <div style="margin-top:8px;">
            <select id="aom-status-select" class="aom-btn secondary" style="width:100%; text-transform:none; font-weight:400;">
              ${Object.keys(statusMap).map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${statusMap[s][0]}</option>`).join('')}
            </select>
          </div>
          <p style="font-size:10px; color:#999; margin-top:8px;">Thay đổi trạng thái sẽ cập nhật timeline của khách hàng.</p>
        </div>
      </div>

      <div class="aom-items-title">Danh sách sản phẩm (${order.orderItems.length} mặt hàng)</div>
      ${order.orderItems.map(item => `
        <div class="aom-item">
          <img src="${item.image || ''}" alt="${item.name}" onerror="this.style.background='#f0f0f0'">
          <div>
            <div class="aom-item-name">${item.name}</div>
            <div class="aom-item-sub">${formatVnd(item.price)} / chiếc &nbsp;·&nbsp; SL: ${item.qty}</div>
          </div>
          <div class="aom-item-price">${formatVnd(item.price * item.qty)}</div>
        </div>
      `).join('')}

      <div class="aom-totals">
        <div class="aom-total-row"><span>Tạm tính</span><span>${formatVnd(order.itemsPrice || 0)}</span></div>
        ${discount > 0 ? `<div class="aom-total-row"><span>Giảm giá${order.voucherCode ? ' (' + order.voucherCode + ')' : ''}</span><span class="discount">-${formatVnd(discount)}</span></div>` : ''}
        <div class="aom-total-row"><span>Phí vận chuyển</span><span>${formatVnd(order.shippingPrice || 0)}</span></div>
        <div class="aom-total-row grand"><span>TỔNG CỘNG</span><span>${formatVnd(order.totalPrice)}</span></div>
      </div>
    </div>

    <div class="aom-footer">
      <button class="aom-btn secondary" id="aom-cancel-btn">Đóng</button>
      <button class="aom-btn primary" id="aom-save-status" data-id="${order._id}">Cập nhật trạng thái</button>
    </div>
  `;

  modal.querySelector('#aom-close-btn').addEventListener('click', closeOrderModal);
  modal.querySelector('#aom-cancel-btn').addEventListener('click', closeOrderModal);

  const saveBtn = modal.querySelector('#aom-save-status');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const newStatus = modal.querySelector('#aom-status-select').value;
      try {
        await updateOrderStatus(saveBtn.dataset.id, newStatus);
        closeOrderModal();
        renderOrders();
      } catch (err) { alert(err.message); }
    });
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

async function renderOrders() {
  const body = document.getElementById('admin-orders-body');
  if (!body) return;

  try {
    const orders = await fetchAllOrders();
    const statusMap = {
      Processing: ['Đang xử lý', 'warning'],
      Confirmed: ['Đã xác nhận', 'info'],
      Shipped: ['Đang giao', 'primary'],
      Delivered: ['Đã giao', 'success'],
      Cancelled: ['Đã hủy', 'danger'],
    };

    body.innerHTML = orders.map((o) => {
      const [label, cls] = statusMap[o.status] || [o.status, 'danger'];
      return `
        <tr>
          <td><strong>#${o._id.substring(0, 8).toUpperCase()}</strong></td>
          <td>${o.user?.name || 'Khách vãng lai'}</td>
          <td>${new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
          <td>${o.orderItems?.length || 0} mục</td>
          <td>${formatVnd(o.totalPrice)}</td>
          <td><span class="status-pill ${cls}">${label}</span></td>
          <td>
            <button class="btn-admin-action edit view-details" data-order='${JSON.stringify(o).replace(/'/g, "&apos;")}'  data-id="${o._id}">CHI TIẾT</button>
          </td>
        </tr>
      `;
    }).join('');

    body.querySelectorAll('.view-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const order = JSON.parse(btn.getAttribute('data-order'));
        openOrderModal(order);
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
  if (path.includes('vouchers.html')) {
    renderVouchers();
    setupVoucherModal();
  }
  
  setupSettings();
});

async function renderVouchers() {
  const body = document.getElementById('admin-vouchers-body');
  if (!body) return;
  
  try {
    const vouchers = await fetchAllVouchers();
    body.innerHTML = vouchers.map(v => `
      <tr>
        <td><strong>${v.code}</strong></td>
        <td>${v.description || '—'}</td>
        <td>${v.discountType === 'percent' ? 'Giảm %' : 'Cố định (đ)'}</td>
        <td>${v.discountType === 'percent' ? v.discountAmount + '%' : formatVnd(v.discountAmount)}</td>
        <td>${formatVnd(v.minOrderValue)}</td>
        <td>${new Date(v.expirationDate).toLocaleDateString('vi-VN')}</td>
        <td><span class="status-pill ${v.isActive ? 'success' : 'danger'}">${v.isActive ? 'Hoạt động' : 'Tạm ngưng'}</span></td>
        <td>
          <button class="btn-admin-action edit edit-voucher" data-id="${v._id}" data-v='${JSON.stringify(v).replace(/'/g, "&apos;")}'>SỬA</button>
          <button class="btn-admin-action delete delete-voucher" data-id="${v._id}">XÓA</button>
        </td>
      </tr>
    `).join('');

    body.querySelectorAll('.edit-voucher').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = JSON.parse(btn.getAttribute('data-v'));
        openVoucherModal(v);
      });
    });

    body.querySelectorAll('.delete-voucher').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Bạn có chắc chắn muốn xóa Voucher này?')) {
          try {
            await deleteVoucher(btn.getAttribute('data-id'));
            renderVouchers();
          } catch (err) { alert(err.message); }
        }
      });
    });
  } catch (err) {
    body.innerHTML = `<tr><td colspan="8">Lỗi tải danh sách mã giảm giá</td></tr>`;
  }
}

function setupVoucherModal() {
  const modal = document.getElementById('voucher-modal');
  const addBtn = document.getElementById('add-voucher-btn');
  const closeBtn = document.getElementById('close-modal');
  const form = document.getElementById('voucher-form');

  if (addBtn) addBtn.onclick = () => openVoucherModal();
  if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
  
  window.addEventListener('click', (e) => {
    if (e.target == modal) modal.style.display = 'none';
  });

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-voucher-id').value;
      const data = {
        code: document.getElementById('v-code').value.toUpperCase(),
        discountType: document.getElementById('v-type').value,
        discountAmount: Number(document.getElementById('v-amount').value),
        description: document.getElementById('v-desc').value,
        minOrderValue: Number(document.getElementById('v-min').value),
        maxUsage: Number(document.getElementById('v-max').value) || undefined,
        expirationDate: document.getElementById('v-expiry').value,
        isActive: document.getElementById('v-active').checked,
      };

      try {
        if (id) {
          await updateVoucher(id, data);
        } else {
          await createVoucher(data);
        }
        modal.style.display = 'none';
        renderVouchers();
      } catch (err) { alert(err.message); }
    };
  }
}

function openVoucherModal(v = null) {
  const modal = document.getElementById('voucher-modal');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('voucher-form');
  
  if (v) {
    title.textContent = 'Cập nhật Voucher';
    document.getElementById('edit-voucher-id').value = v._id;
    document.getElementById('v-code').value = v.code;
    document.getElementById('v-type').value = v.discountType;
    document.getElementById('v-amount').value = v.discountAmount;
    document.getElementById('v-desc').value = v.description;
    document.getElementById('v-min').value = v.minOrderValue;
    document.getElementById('v-max').value = v.maxUsage || '';
    document.getElementById('v-expiry').value = v.expirationDate.split('T')[0];
    document.getElementById('v-active').checked = v.isActive;
  } else {
    title.textContent = 'Thêm Voucher mới';
    form.reset();
    document.getElementById('edit-voucher-id').value = '';
    document.getElementById('v-expiry').value = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  }
  modal.style.display = 'flex';
}
