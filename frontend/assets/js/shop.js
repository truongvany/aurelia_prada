import { fetchProducts } from './api.js';
import { createProductCard } from './common.js';

let products = [];

function renderProducts(list) {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  grid.innerHTML = list.map(createProductCard).join('');
}

function readFilters() {
  const query = (document.getElementById('shop-search')?.value || '').toLowerCase().trim();
  const category = document.getElementById('filter-category')?.value || 'all';
  const maxPrice = Number(document.getElementById('filter-price')?.value || 9999999);
  const sortBy = document.getElementById('sort-by')?.value || 'featured';

  return { query, category, maxPrice, sortBy };
}

function applyFilters() {
  const { query, category, maxPrice, sortBy } = readFilters();
  let filtered = [...products];

  if (query) {
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(query));
  }
  if (category !== 'all') {
    // category object format depends on response, we assume p.category.slug or similar
    filtered = filtered.filter((p) => (p.category?.slug || p.category) === category);
  }
  if (maxPrice) {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }

  if (sortBy === 'priceAsc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'priceDesc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  renderProducts(filtered);
  const count = document.getElementById('result-count');
  if (count) count.textContent = String(filtered.length);
}

async function initShop() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  grid.innerHTML = '<p>Loading products...</p>';

  try {
    products = await fetchProducts();
    
    ['shop-search', 'filter-category', 'filter-price', 'sort-by'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', applyFilters);
      if (el && el.tagName === 'SELECT') el.addEventListener('change', applyFilters);
    });

    applyFilters();
  } catch (error) {
    grid.innerHTML = `<p style="color:red">Failed to load products: ${error.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', initShop);
