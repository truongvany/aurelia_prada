import { fetchProducts } from './api.js';
import { createProductCard } from './common.js';

let products = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 20;

function renderProducts() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedList = filteredProducts.slice(startIndex, endIndex);

  grid.innerHTML = paginatedList.map(createProductCard).join('');
  renderPaginationUI();
}

function renderPaginationUI() {
    const paginationContainer = document.querySelector('.shop-pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = `
        <a href="#" class="btn-pagination ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}">Trước</a>
    `;

    for (let i = 1; i <= totalPages; i++) {
        html += `<a href="#" class="btn-pagination ${currentPage === i ? 'active' : ''}" data-page="${i}">${i}</a>`;
    }

    html += `
        <a href="#" class="btn-pagination ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}">Sau</a>
    `;

    paginationContainer.innerHTML = html;

    // Add click listeners
    paginationContainer.querySelectorAll('.btn-pagination').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(btn.getAttribute('data-page'));
            if (page >= 1 && page <= totalPages && page !== currentPage) {
                currentPage = page;
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

function applyFilters() {
  const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(el => el.value);
  const selectedPrices = Array.from(document.querySelectorAll('input[name="price"]:checked')).map(el => el.value);
  const selectedMaterials = Array.from(document.querySelectorAll('input[name="material"]:checked')).map(el => el.value);
  const selectedCollections = Array.from(document.querySelectorAll('input[name="collection"]:checked')).map(el => el.value);

  filteredProducts = [...products];

  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter(p => selectedCategories.includes(p.category?.name || p.category));
  }

  if (selectedPrices.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      return selectedPrices.some(range => {
        if (range === '2000000+') return p.price >= 2000000;
        const [min, max] = range.split('-').map(Number);
        return p.price >= min && p.price <= max;
      });
    });
  }

  if (selectedMaterials.length > 0) {
    filteredProducts = filteredProducts.filter(p => selectedMaterials.includes(p.material));
  }

  if (selectedCollections.length > 0) {
    filteredProducts = filteredProducts.filter(p => selectedCollections.includes(p.collectionName));
  }

  currentPage = 1; // Reset to first page on filter change
  renderProducts();
}

async function initShop() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  grid.innerHTML = '<p>Loading products...</p>';

  try {
    const { fetchCategories } = await import('./api.js');
    const categories = await fetchCategories();
    products = await fetchProducts();
    
    // 1. Populate Categories
    const catFilter = document.getElementById('cat-filter');
    if (catFilter) {
      catFilter.innerHTML = categories.map(c => `
        <label class="filter-item">
          <input type="checkbox" name="category" value="${c.name}" hidden>
          <div class="filter-checkbox"></div>
          <span>${c.name}</span>
        </label>
      `).join('');
    }

    // 2. Populate Materials
    const materials = [...new Set(products.map(p => p.material).filter(Boolean))];
    const matFilter = document.querySelector('.filter-group:nth-of-type(3) .filter-group-content');
    if (matFilter) {
      matFilter.innerHTML = materials.map(m => `
        <label class="filter-item">
          <input type="checkbox" name="material" value="${m}" hidden>
          <div class="filter-checkbox"></div>
          <span>${m}</span>
        </label>
      `).join('');
    }

    // 3. Populate Collections
    const collections = [...new Set(products.map(p => p.collectionName).filter(Boolean))];
    const colFilter = document.querySelector('.filter-group:last-of-type .filter-group-content');
    if (colFilter) {
      colFilter.innerHTML = collections.map(c => `
        <label class="filter-item">
          <input type="checkbox" name="collection" value="${c}" hidden>
          <div class="filter-checkbox"></div>
          <span>${c}</span>
        </label>
      `).join('');
    }

    // Parse URL params for initial category
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');
    if (urlCategory) {
        const checkbox = Array.from(document.querySelectorAll('input[name="category"]'))
                             .find(el => el.value === urlCategory);
        if (checkbox) {
            checkbox.checked = true;
            checkbox.closest('.filter-item').classList.add('active');
        }
    }

    // Add event listeners to all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const filterItem = cb.closest('.filter-item');
        if (filterItem) filterItem.classList.toggle('active', cb.checked);
        applyFilters();
      });
    });

    // Expand/Collapse logic
    document.querySelectorAll('.filter-group-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            if (content && content.classList.contains('filter-group-content')) {
                const isCollapsed = content.classList.toggle('collapsed');
                const svg = header.querySelector('svg');
                if (svg) svg.style.transform = isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
            }
        });
    });

    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    applyFilters();
  } catch (error) {
    grid.innerHTML = `<p style="color:red">Failed to load products: ${error.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', initShop);
