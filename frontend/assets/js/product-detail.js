import { products } from './data.js';
import { formatVnd } from './common.js';

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get('id') || '1');
}

function initDetail() {
  const product = products.find((p) => p.id === getProductId()) || products[0];
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
}

document.addEventListener('DOMContentLoaded', initDetail);
