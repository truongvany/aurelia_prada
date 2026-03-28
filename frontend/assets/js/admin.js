import { fetchProducts, fetchAllOrders, fetchAllUsers } from './api.js';
import { formatVnd } from './common.js';

function renderDashboard() {
  const sales = [4000, 3000, 5000, 4500, 6000, 5500];
  const max = Math.max(...sales);
  const chart = document.getElementById('sales-chart');
  if (!chart) return;
  chart.innerHTML = sales.map((value, index) => {
    const height = Math.round((value / max) * 180);
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index];
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;"><div style="width:30px;height:${height}px;background:#e8d8d0;border-radius:8px 8px 4px 4px;"></div><small>${month}</small></div>`;
  }).join('');
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
        <td>${p.originalPrice ? '<span class="status warning">Sale</span>' : '<span class="status success">Active</span>'}</td>
      </tr>
    `).join('');
  } catch (err) {
    body.innerHTML = `<tr><td colspan="4">Error loading products</td></tr>`;
  }
}

async function renderOrders() {
  const body = document.getElementById('admin-orders-body');
  if (!body) return;
  
  try {
    const orders = await fetchAllOrders();
    body.innerHTML = orders.map((o) => `
      <tr>
        <td>${o._id.substring(0, 8)}</td>
        <td>${o.user?.name || 'Unknown'}</td>
        <td>${new Date(o.createdAt).toLocaleDateString()}</td>
        <td>${o.orderItems?.length || 0}</td>
        <td>${formatVnd(o.totalPrice)}</td>
        <td><span class="status ${o.status === 'Delivered' ? 'success' : o.status === 'Processing' ? 'warning' : o.status === 'Shipped' ? 'info' : 'danger'}">${o.status}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    body.innerHTML = `<tr><td colspan="6">Error loading orders</td></tr>`;
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
        <td><span class="status ${c.role === 'admin' ? 'info' : 'success'}">${c.role}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    body.innerHTML = `<tr><td colspan="5">Error loading customers</td></tr>`;
  }
}

function bindSettings() {
  const form = document.getElementById('settings-form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const note = document.getElementById('settings-notice');
    if (note) note.textContent = 'Settings saves are simulated.';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  renderProducts();
  renderOrders();
  renderCustomers();
  bindSettings();
});
