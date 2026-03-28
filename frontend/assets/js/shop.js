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
  const selectedCollections = Array.from(document.querySelectorAll('input[name="collection"]:checked')).map(el => el.value);
  const priceSlider = document.getElementById('price-slider');
  const maxPrice = priceSlider ? parseInt(priceSlider.value) : Infinity;

  filteredProducts = [...products];

  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter(p => selectedCategories.includes(p.category?.name || p.category));
  }

  // Price Range filtering
  filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);

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

    // 2. Initialize Price Slider
    const productPrices = products.map(p => p.price).filter(p => !isNaN(p));
    const rawMaxPrice = productPrices.length > 0 ? Math.max(...productPrices) : 10000000;
    // Round up to nearest 100,000 for clean UI (e.g., 1,177,685 -> 1,200,000)
    const shopMaxPrice = Math.ceil(rawMaxPrice / 100000) * 100000;
    
    const priceSlider = document.getElementById('price-slider');
    const priceMaxDisplay = document.getElementById('price-max-display');
    const priceCurrentDisplay = document.getElementById('price-current-display');

    if (priceSlider) {
      priceSlider.max = shopMaxPrice;
      priceSlider.value = shopMaxPrice;
      
      const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p).replace('₫', 'đ');
      
      if (priceMaxDisplay) priceMaxDisplay.innerText = formatPrice(shopMaxPrice);
      if (priceCurrentDisplay) priceCurrentDisplay.innerText = `0 đ - ${formatPrice(shopMaxPrice)}`;

      priceSlider.addEventListener('input', () => {
        if (priceCurrentDisplay) priceCurrentDisplay.innerText = `0 đ - ${formatPrice(priceSlider.value)}`;
        applyFilters();
      });
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
