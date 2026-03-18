import { products } from './data.js';
import { createProductCard } from './common.js';

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
    filtered = filtered.filter((p) => p.category === category);
  }
  filtered = filtered.filter((p) => p.price <= maxPrice);

  if (sortBy === 'priceAsc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'priceDesc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'newest') {
    filtered.sort((a, b) => b.id - a.id);
  }

  renderProducts(filtered);
  const count = document.getElementById('result-count');
  if (count) count.textContent = String(filtered.length);
}

function initShop() {
  if (!document.getElementById('shop-grid')) return;
  renderProducts(products);
  ['shop-search', 'filter-category', 'filter-price', 'sort-by'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', applyFilters);
    if (el && el.tagName === 'SELECT') el.addEventListener('change', applyFilters);
  });

  applyFilters();
}

document.addEventListener('DOMContentLoaded', initShop);
