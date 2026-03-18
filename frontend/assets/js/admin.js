import { adminOrders, adminCustomers, products } from './data.js';
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

function renderProducts() {
  const body = document.getElementById('admin-products-body');
  if (!body) return;
  body.innerHTML = products.map((p) => `
    <tr>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${formatVnd(p.price)}</td>
      <td>${p.originalPrice ? '<span class="status warning">Sale</span>' : '<span class="status success">Active</span>'}</td>
    </tr>
  `).join('');
}

function renderOrders() {
  const body = document.getElementById('admin-orders-body');
  if (!body) return;
  body.innerHTML = adminOrders.map((o) => `
    <tr>
      <td>${o.id}</td>
      <td>${o.customer}</td>
      <td>${o.date}</td>
      <td>${o.items}</td>
      <td>${formatVnd(o.total * 25000)}</td>
      <td><span class="status ${o.status === 'Completed' ? 'success' : o.status === 'Processing' ? 'warning' : o.status === 'Shipped' ? 'info' : 'danger'}">${o.status}</span></td>
    </tr>
  `).join('');
}

function renderCustomers() {
  const body = document.getElementById('admin-customers-body');
  if (!body) return;
  body.innerHTML = adminCustomers.map((c) => `
    <tr>
      <td>${c.name}</td>
      <td>${c.email}<br><small>${c.phone}</small></td>
      <td>${c.orders}</td>
      <td>${formatVnd(c.spent * 25000)}</td>
      <td><span class="status ${c.status === 'VIP' ? 'info' : c.status === 'Active' ? 'success' : c.status === 'New' ? 'warning' : 'danger'}">${c.status}</span></td>
    </tr>
  `).join('');
}

function bindSettings() {
  const form = document.getElementById('settings-form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const note = document.getElementById('settings-notice');
    if (note) note.textContent = 'Settings were saved locally for demo (no backend write).';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  renderProducts();
  renderOrders();
  renderCustomers();
  bindSettings();
});
