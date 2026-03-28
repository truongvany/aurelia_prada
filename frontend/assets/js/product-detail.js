import { fetchProductById, addToCart } from './api.js';
import { formatVnd, updateCartBadge } from './common.js';

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function initDetail() {
  const productId = getProductId();
  if (!productId) {
    document.body.innerHTML = '<h2>Product ID missing</h2>';
    return;
  }

  let product;
  try {
    product = await fetchProductById(productId);
  } catch (error) {
    document.body.innerHTML = '<h2>Product not found</h2>';
    return;
  }

  const title = document.getElementById('product-title');
  const titleCrumb = document.getElementById('product-title-crumb');
  const price = document.getElementById('product-price');
  const priceCta = document.getElementById('product-price-cta');
  const hero = document.getElementById('product-hero');
  const thumb = document.getElementById('product-thumb');

  if (title) title.textContent = product.name;
  if (titleCrumb) titleCrumb.textContent = product.name;
  if (price) price.textContent = formatVnd(product.price);
  if (priceCta) priceCta.textContent = formatVnd(product.price);
  if (hero) hero.src = product.image;
  if (thumb) thumb.src = product.image;

  const galleryTrack = document.querySelector('.product-gallery-track');
  if (galleryTrack) {
    // Duplicate gallery content so animation can loop seamlessly
    galleryTrack.innerHTML += galleryTrack.innerHTML;
  }

  document.querySelectorAll('[data-size]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-size]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const selected = document.getElementById('selected-size');
      if (selected) selected.textContent = btn.getAttribute('data-size') || '';
    });
  });

  document.querySelectorAll('[data-color]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-color]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const selected = document.getElementById('selected-color');
      if (selected) selected.textContent = btn.getAttribute('data-color') || '';
    });
  });

  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      document.querySelectorAll('[data-tab]').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('[data-tab-panel]').forEach((p) => p.hidden = true);
      btn.classList.add('active');
      const panel = document.querySelector(`[data-tab-panel="${tab}"]`);
      if (panel) panel.hidden = false;
    });
  });

  // Handle Add to Cart
  const addBtn = document.querySelector('.btn-primary'); // Assuming this is Add to Cart
  if (addBtn) {
    addBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const activeSize = document.querySelector('[data-size].active')?.getAttribute('data-size') || 'L';
        const qtyStr = document.querySelector('.qty span')?.textContent || '1';
        
        try {
            await addToCart(product._id, Number(qtyStr), activeSize);
            updateCartBadge();
            alert('Added to cart!');
        } catch (error) {
            alert('You must be logged in to add items to cart.');
        }
    });
  }
}

document.addEventListener('DOMContentLoaded', initDetail);
