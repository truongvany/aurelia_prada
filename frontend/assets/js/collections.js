import { fetchCategories, fetchProducts } from './api.js';
import { createProductCard, syncWishlistVisuals } from './common.js';

const COLLECTION_GROUPS = ['THEO DỊP', 'SẢN PHẨM ĐẶC TRƯNG', 'THEO MÙA'];
const PRODUCTS_PER_PAGE = 24;

let allProducts = [];
let allCategories = [];
let activeGroup = 'ALL';
let categoryPageMap = {}; // Track current page for each category

function normalizeCategoryName(product) {
  if (!product) return '';
  return product.category?.name || product.category || '';
}

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
}

function setStats() {
  const productsNode = document.getElementById('stat-total-products');
  const categoriesNode = document.getElementById('stat-total-categories');
  const groupsNode = document.getElementById('stat-total-groups');
  const collectionCategories = allCategories.filter((category) =>
    COLLECTION_GROUPS.includes(category.group)
  );

  if (productsNode) productsNode.textContent = String(allProducts.length);
  if (categoriesNode) categoriesNode.textContent = String(collectionCategories.length);
  if (groupsNode) {
    const existingGroups = new Set(
      collectionCategories
        .map((category) => category.group)
        .filter((group) => COLLECTION_GROUPS.includes(group))
    );
    groupsNode.textContent = String(existingGroups.size || COLLECTION_GROUPS.length);
  }
}

function getAvailableGroups() {
  return COLLECTION_GROUPS.filter((groupName) =>
    allCategories.some((category) => category.group === groupName)
  );
}

function renderGroupTabs() {
  const tabsContainer = document.getElementById('collections-tabs');
  if (!tabsContainer) return;

  const availableGroups = getAvailableGroups();

  const tabs = ['ALL', ...availableGroups];

  tabsContainer.innerHTML = tabs
    .map((groupName) => {
      const label = groupName === 'ALL' ? 'TẤT CẢ BỘ SƯU TẬP' : groupName;
      return `
        <button class="collections-tab ${groupName === activeGroup ? 'active' : ''}" data-group="${groupName}">
          ${label}
        </button>
      `;
    })
    .join('');

  tabsContainer.querySelectorAll('.collections-tab').forEach((tabNode) => {
    tabNode.addEventListener('click', () => {
      activeGroup = tabNode.getAttribute('data-group') || 'ALL';
      renderGroupTabs();
      renderSections();
      window.scrollTo({ top: 260, behavior: 'smooth' });
    });
  });
}

function renderSections() {
  const sectionsRoot = document.getElementById('collections-sections');
  if (!sectionsRoot) return;

  const availableGroups = getAvailableGroups();

  const groupsToRender = activeGroup === 'ALL' ? availableGroups : [activeGroup];

  const groupHtml = groupsToRender
    .map((groupName) => {
      const categories = allCategories.filter((category) => category.group === groupName);
      const categoryHtml = categories
        .map((category) => {
          let productsInCategory = allProducts.filter((product) => normalizeCategoryName(product) === category.name);
          
          if (productsInCategory.length === 0) return '';

          const isOverviewPage = activeGroup === 'ALL';
          const catSlug = slugify(category.name);
          
          if (isOverviewPage) {
            // Overview: limit to 12 products, no pagination
            const displayProducts = productsInCategory.slice(0, 12);
            return `
              <article class="collection-category" id="category-${catSlug}">
                <div class="collection-category-head">
                  <h3>${category.name}</h3>
                  <span>${productsInCategory.length} san pham</span>
                </div>
                <div class="collection-grid">
                  ${displayProducts.map(createProductCard).join('')}
                </div>
              </article>
            `;
          } else {
            // Detail page: show 24 per page with pagination
            const currentPage = categoryPageMap[catSlug] || 1;
            const totalPages = Math.ceil(productsInCategory.length / PRODUCTS_PER_PAGE);
            const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
            const endIdx = startIdx + PRODUCTS_PER_PAGE;
            const displayProducts = productsInCategory.slice(startIdx, endIdx);

            let paginationHtml = '';
            if (totalPages > 1) {
              const pageNumbers = [];
              for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
              }

              paginationHtml = `
                <div class="collection-pagination" data-category="${catSlug}">
                  ${currentPage > 1 ? `<button class="pagination-btn pagination-prev" data-page="${currentPage - 1}">← Trước</button>` : ''}
                  <div class="pagination-numbers">
                    ${pageNumbers.map(page => `
                      <button class="pagination-num ${page === currentPage ? 'active' : ''}" data-page="${page}">
                        ${page}
                      </button>
                    `).join('')}
                  </div>
                  ${currentPage < totalPages ? `<button class="pagination-btn pagination-next" data-page="${currentPage + 1}">Sau →</button>` : ''}
                </div>
              `;
            }

            return `
              <article class="collection-category" id="category-${catSlug}">
                <div class="collection-category-head">
                  <h3>${category.name}</h3>
                  <span>${productsInCategory.length} san pham</span>
                </div>
                <div class="collection-grid">
                  ${displayProducts.map(createProductCard).join('')}
                </div>
                ${paginationHtml}
              </article>
            `;
          }
        })
        .join('');

      if (!categoryHtml) return '';

      return `
        <section class="collection-group" id="group-${slugify(groupName)}">
          <div class="collection-group-head">
            <h2>${groupName}</h2>
            <p>Danh muc duoc sap xep ro rang</p>
          </div>
          ${categoryHtml}
        </section>
      `;
    })
    .join('');

  if (!groupHtml) {
    sectionsRoot.innerHTML = '<div class="collections-empty">Chua co du lieu bo suu tap phu hop.</div>';
    return;
  }

  sectionsRoot.innerHTML = groupHtml;
  syncWishlistVisuals();

  // Attach pagination event listeners
  document.querySelectorAll('.collection-pagination button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const catSlug = btn.closest('.collection-pagination')?.getAttribute('data-category');
      const page = parseInt(btn.getAttribute('data-page'));
      if (catSlug) {
        categoryPageMap[catSlug] = page;
        renderSections();
        // Scroll to category
        const target = document.getElementById(`category-${catSlug}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

function applyQueryDefaults() {
  const searchParams = new URLSearchParams(window.location.search);
  const queryGroup = searchParams.get('group');
  const queryCategory = searchParams.get('category');

  if (queryGroup && getAvailableGroups().includes(queryGroup)) {
    activeGroup = queryGroup;
    renderGroupTabs();
    renderSections();
  }

  if (!queryCategory) return;

  const foundCategory = allCategories.find((category) => category.name === queryCategory);
  if (!foundCategory) return;

  activeGroup = foundCategory.group;

  requestAnimationFrame(() => {
    const target = document.getElementById(`category-${slugify(queryCategory)}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

async function initCollectionsPage() {
  const sectionsRoot = document.getElementById('collections-sections');
  if (!sectionsRoot) return;

  try {
    const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
    allCategories = categories;
    allProducts = products;

    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    setStats();
    renderGroupTabs();
    renderSections();
    applyQueryDefaults();
  } catch (error) {
    sectionsRoot.innerHTML = `<div class="collections-empty">Khong the tai du lieu bo suu tap: ${error.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', initCollectionsPage);
