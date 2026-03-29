import { fetchAllPromotions, createPromotion, updatePromotion, deletePromotion, fetchProducts } from './api.js';
import { renderAdminLayout } from './admin-layout.js';
import { formatVnd } from './common.js';

let allProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
  renderAdminLayout();
  await loadProducts();
  await renderPromotions();
  setupModal();
});

async function loadProducts() {
  try {
    allProducts = await fetchProducts();
    const select = document.getElementById('p-targets');
    if (select) {
      select.innerHTML = allProducts.map(p => `<option value="${p._id}">${p.name} - ${formatVnd(p.price)}</option>`).join('');
    }
  } catch (err) {
    console.error('Lỗi tải sản phẩm:', err);
  }
}

async function renderPromotions() {
  const body = document.getElementById('admin-promotions-body');
  if (!body) return;
  
  try {
    const promotions = await fetchAllPromotions();
    const typeMap = {
      percentage: 'Giảm %',
      fixed_amount: 'Giảm tiền (đ)',
      combo_quantity: 'Combo (Mua X)'
    };

    body.innerHTML = promotions.map(p => {
      const isExpired = new Date(p.endDate) < new Date();
      const isActive = p.isActive && !isExpired;
      const statusClass = isActive ? 'success' : isExpired ? 'danger' : 'warning';
      const statusText = isActive ? 'Đang chạy' : isExpired ? 'Đã kết thúc' : 'Tạm ngưng';

      return `
      <tr>
        <td><strong>${p.name}</strong><br><small style="color:var(--admin-text-muted);">${p.description || ''}</small></td>
        <td>${typeMap[p.type] || p.type}</td>
        <td>${p.type === 'percentage' ? p.discountValue + '%' : formatVnd(p.discountValue)}</td>
        <td>${p.type === 'combo_quantity' ? 'Mua tối thiểu ' + p.minQuantity : (p.applyToAll ? 'Toàn bộ SP' : (p.targetProducts?.length || 0) + ' Sản phẩm')}</td>
        <td><small>${new Date(p.startDate).toLocaleDateString('vi-VN')} - ${new Date(p.endDate).toLocaleDateString('vi-VN')}</small></td>
        <td><span class="status-pill ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn-admin-action edit edit-promo" data-v='${JSON.stringify(p).replace(/'/g, "&apos;")}'>SỬA</button>
          <button class="btn-admin-action delete delete-promo" data-id="${p._id}">XÓA</button>
        </td>
      </tr>
      `;
    }).join('');

    body.querySelectorAll('.edit-promo').forEach(btn => {
      btn.addEventListener('click', () => openModal(JSON.parse(btn.getAttribute('data-v'))));
    });

    body.querySelectorAll('.delete-promo').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Bạn có chắc chắn muốn xóa chương trình khuyến mãi này?')) {
          try {
            await deletePromotion(btn.dataset.id);
            renderPromotions();
          } catch (err) { alert(err.message); }
        }
      });
    });
  } catch (err) {
    body.innerHTML = `<tr><td colspan="7">Lỗi tải danh sách khuyến mãi</td></tr>`;
  }
}

function setupModal() {
  const modal = document.getElementById('promotion-modal');
  const addBtn = document.getElementById('add-promotion-btn');
  const closeBtn = document.getElementById('close-modal');
  const form = document.getElementById('promotion-form');
  const typeSelect = document.getElementById('p-type');
  const allProductsCheck = document.getElementById('p-all-products');
  const targetGroup = document.getElementById('target-products-group');
  const minQtyGroup = document.getElementById('p-min').parentElement;

  if (addBtn) addBtn.onclick = () => openModal();
  if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
  window.addEventListener('click', (e) => { if (e.target == modal) modal.style.display = 'none'; });

  typeSelect.addEventListener('change', (e) => {
    minQtyGroup.style.display = e.target.value === 'combo_quantity' ? 'block' : 'none';
  });

  allProductsCheck.addEventListener('change', (e) => {
    targetGroup.style.display = e.target.checked ? 'none' : 'block';
  });

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-promotion-id').value;
      const selectTarget = document.getElementById('p-targets');
      const selectedOptions = Array.from(selectTarget.selectedOptions).map(opt => opt.value);

      const applyToAll = document.getElementById('p-all-products').checked;
      
      if (!applyToAll && selectedOptions.length === 0) {
        alert('Vui lòng chọn ít nhất một sản phẩm hoặc chọn "Áp dụng toàn bộ SP"');
        return;
      }

      const data = {
        name: document.getElementById('p-name').value,
        description: document.getElementById('p-desc').value,
        type: document.getElementById('p-type').value,
        discountValue: Number(document.getElementById('p-amount').value),
        minQuantity: Number(document.getElementById('p-min').value),
        applyToAll: applyToAll,
        targetProducts: applyToAll ? [] : selectedOptions,
        startDate: document.getElementById('p-start').value,
        endDate: document.getElementById('p-end').value,
        isActive: document.getElementById('p-active').checked,
      };

      try {
        if (id) {
          await updatePromotion(id, data);
        } else {
          await createPromotion(data);
        }
        modal.style.display = 'none';
        renderPromotions();
      } catch (err) { alert(err.message); }
    };
  }
}

function openModal(p = null) {
  const modal = document.getElementById('promotion-modal');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('promotion-form');
  const minQtyGroup = document.getElementById('p-min').parentElement;
  const targetGroup = document.getElementById('target-products-group');

  if (p) {
    title.textContent = 'Cập nhật Khuyến Mãi';
    document.getElementById('edit-promotion-id').value = p._id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-desc').value = p.description || '';
    document.getElementById('p-type').value = p.type;
    document.getElementById('p-amount').value = p.discountValue;
    document.getElementById('p-min').value = p.minQuantity || 1;
    document.getElementById('p-all-products').checked = p.applyToAll;
    document.getElementById('p-start').value = new Date(p.startDate).toISOString().slice(0, 16);
    document.getElementById('p-end').value = new Date(p.endDate).toISOString().slice(0, 16);
    document.getElementById('p-active').checked = p.isActive;

    // Select target products
    const select = document.getElementById('p-targets');
    Array.from(select.options).forEach(opt => {
      opt.selected = p.targetProducts.map(t => typeof t === 'string' ? t : t._id).includes(opt.value);
    });

  } else {
    title.textContent = 'Thêm Khuyến Mãi Mới';
    form.reset();
    document.getElementById('edit-promotion-id').value = '';
    
    // Default dates
    const now = new Date();
    document.getElementById('p-start').value = now.toISOString().slice(0, 16);
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
    document.getElementById('p-end').value = end.toISOString().slice(0, 16);
  }

  // Trigger change events to toggle visibility
  document.getElementById('p-type').dispatchEvent(new Event('change'));
  document.getElementById('p-all-products').dispatchEvent(new Event('change'));

  modal.style.display = 'flex';
}
