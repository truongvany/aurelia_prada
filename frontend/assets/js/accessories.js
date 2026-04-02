import { fetchProducts, fetchCategories } from './api.js';
import { createProductCard, syncWishlistVisuals } from './common.js';

const ACC_GROUP = 'PHỤ KIỆN';

let allProducts = [];       // All accessories products (group=PHỤ KIỆN)
let filteredProducts = [];  // After filter applied
let currentPage = 1;
const ITEMS_PER_PAGE = 20;

/* ============================================
   RENDER
   ============================================ */
function renderProducts() {
  const grid = document.getElementById('acc-grid');
  if (!grid) return;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredProducts.slice(start, start + ITEMS_PER_PAGE);

  if (pageItems.length === 0) {
    grid.innerHTML = `
      <div class="acc-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <h4>Không tìm thấy sản phẩm</h4>
        <p>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khoá khác.</p>
      </div>
    `;
  } else {
    grid.innerHTML = pageItems.map(createProductCard).join('');
    syncWishlistVisuals();
  }

  updateResultCount();
  renderPagination();
}

function updateResultCount() {
  const el = document.getElementById('acc-result-count');
  if (el) {
    el.innerHTML = `Hiển thị <strong>${filteredProducts.length}</strong> sản phẩm`;
  }
}

/* ============================================
   SKELETON LOADING
   ============================================ */
function showSkeleton() {
  const grid = document.getElementById('acc-grid');
  if (!grid) return;
  grid.innerHTML = Array(8).fill(0).map(() => `
    <div class="acc-skeleton-card">
      <div class="acc-skeleton-img"></div>
      <div class="acc-skeleton-line"></div>
      <div class="acc-skeleton-line short"></div>
      <div class="acc-skeleton-line price"></div>
    </div>
  `).join('');
}

/* ============================================
   FILTERS
   ============================================ */
function applyFilters() {
  const selectedCategories = Array.from(
    document.querySelectorAll('input[name="acc-category"]:checked')
  ).map(el => el.value);

  const priceSlider = document.getElementById('acc-price-slider');
  const maxPrice = priceSlider ? parseInt(priceSlider.value) : Infinity;

  const sortSelect = document.getElementById('acc-sort');
  const sort = sortSelect ? sortSelect.value : 'default';

  filteredProducts = [...allProducts];

  // Category filter
  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const catName = p.category?.name || (typeof p.category === 'string' ? p.category : '');
      return selectedCategories.includes(catName);
    });
  }

  // Price filter
  filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);

  // Sort
  if (sort === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    filteredProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  currentPage = 1;
  renderProducts();
}

/* ============================================
   PAGINATION
   ============================================ */
function renderPagination() {
  const nav = document.getElementById('acc-pagination');
  if (!nav) return;

  const total = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  if (total <= 1) { nav.innerHTML = ''; return; }

  let html = `<a href="#" class="btn-pagination ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}">Trước</a>`;
  for (let i = 1; i <= total; i++) {
    html += `<a href="#" class="btn-pagination ${currentPage === i ? 'active' : ''}" data-page="${i}">${i}</a>`;
  }
  html += `<a href="#" class="btn-pagination ${currentPage === total ? 'disabled' : ''}" data-page="${currentPage + 1}">Sau</a>`;

  nav.innerHTML = html;
  nav.querySelectorAll('.btn-pagination').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const page = parseInt(btn.getAttribute('data-page'));
      if (page >= 1 && page <= total && page !== currentPage) {
        currentPage = page;
        renderProducts();
        window.scrollTo({ top: 320, behavior: 'smooth' });
      }
    });
  });
}

/* ============================================
   INIT
   ============================================ */
async function initAccessories() {
  showSkeleton();

  try {
    const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);

    // Build category lookup map
    const categoryMap = {};
    categories.forEach(cat => { categoryMap[cat._id] = cat; });

    // Filter accessories products only (group = PHỤ KIỆN)
    allProducts = products.filter(p => {
      const catId = p.category?._id || p.category;
      const cat = categoryMap[catId];
      return cat && cat.group === ACC_GROUP;
    });

    filteredProducts = [...allProducts];

    // Populate category sidebar filters
    const catFilterEl = document.getElementById('acc-cat-filter');
    if (catFilterEl) {
      // Lấy tất cả danh mục thuộc nhóm PHỤ KIỆN từ DB
      const accCatsFromDB = categories.filter(c => c.group === ACC_GROUP);

      const makeItem = (name, id) => `
        <label class="acc-filter-item" id="acc-cat-${id || name.replace(/\s+/g, '-')}">
          <input type="checkbox" name="acc-category" value="${name}" hidden>
          <div class="acc-filter-box">
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1.5 6.5 4.5 9.5 10.5 3"/>
            </svg>
          </div>
          <span class="acc-filter-item-label">${name}</span>
        </label>
      `;

      if (accCatsFromDB.length > 0) {
        catFilterEl.innerHTML = accCatsFromDB.map(c => makeItem(c.name, c._id)).join('');
      } else {
        catFilterEl.innerHTML = '<p style="font-size:12px;color:#999;padding:10px 0;">Đang cập nhật danh mục...</p>';
      }

      // Checkbox listeners
      catFilterEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          const item = cb.closest('.acc-filter-item');
          if (item) item.classList.toggle('is-active', cb.checked);
          applyFilters();
        });
      });
    }

    // Init price slider
    const prices = allProducts.map(p => p.price).filter(n => !isNaN(n));
    const rawMax = prices.length > 0 ? Math.max(...prices) : 10000000;
    const maxPriceRounded = Math.ceil(rawMax / 100000) * 100000;

    const slider = document.getElementById('acc-price-slider');
    const maxDisplay = document.getElementById('acc-price-max');
    const currentDisplay = document.getElementById('acc-price-current');

    const fmt = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

    if (slider) {
      slider.max = maxPriceRounded;
      slider.value = maxPriceRounded;
      if (maxDisplay) maxDisplay.textContent = fmt(maxPriceRounded);
      if (currentDisplay) currentDisplay.textContent = `0 đ - ${fmt(maxPriceRounded)}`;

      slider.addEventListener('input', () => {
        if (currentDisplay) currentDisplay.textContent = `0 đ - ${fmt(slider.value)}`;
        applyFilters();
      });
    }

    // Sort listener
    const sortEl = document.getElementById('acc-sort');
    if (sortEl) sortEl.addEventListener('change', applyFilters);

    // URL param: ?category=xxx pre-select
    const urlParams = new URLSearchParams(window.location.search);
    const urlCat = urlParams.get('category');
    if (urlCat) {
      const checkbox = document.querySelector(`input[name="acc-category"][value="${urlCat}"]`);
      if (checkbox) {
        checkbox.checked = true;
        checkbox.closest('.acc-filter-item')?.classList.add('is-active');
        applyFilters();
      }
    }

    // Filter group expand/collapse logic (Sync with HTML script)
    document.querySelectorAll('.acc-filter-toggle').forEach(btn => {
      btn.onclick = () => {
        const section = btn.closest('.acc-filter-section');
        section.classList.toggle('open');
      };
    });

    // Scroll-to-top button
    const scrollBtn = document.getElementById('acc-scroll-top');
    if (scrollBtn) scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Initial render
    applyFilters();

  } catch (err) {
    const grid = document.getElementById('acc-grid');
    if (grid) grid.innerHTML = `<div class="acc-empty-state"><h4>Lỗi tải dữ liệu</h4><p>${err.message}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', initAccessories);
