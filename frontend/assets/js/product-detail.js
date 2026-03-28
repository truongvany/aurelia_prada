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

  // Update text content
  const titleElem = document.getElementById('product-title');
  const titleCrumb = document.getElementById('product-title-crumb');
  const priceElem = document.getElementById('product-price');
  const heroElem = document.getElementById('product-hero');

  if (titleElem) titleElem.textContent = product.name;
  if (titleCrumb) titleCrumb.textContent = product.name;
  if (priceElem) priceElem.textContent = formatVnd(product.price);
  if (heroElem) heroElem.src = product.image;

  // Update thumbnails
  for (let i = 0; i < 4; i++) {
    const thumb = document.getElementById(`product-thumb-${i}`);
    if (thumb) {
        // For demo, we use the main image for all thumbs or placeholders
        thumb.src = i === 0 ? product.image : thumb.src || product.image;
    }
  }

  // Color selection
  const colorDots = document.querySelectorAll('.color-dot');
  colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      colorDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      const selectedColor = document.getElementById('selected-color');
      if (selectedColor) selectedColor.textContent = dot.getAttribute('data-color');
    });
  });

  // Size selection
  const sizeOptions = document.querySelectorAll('.size-option');
  sizeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      sizeOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const selectedSize = document.getElementById('selected-size');
      if (selectedSize) selectedSize.textContent = opt.getAttribute('data-size');
    });
  });

  // Quantity control
  const qtyValue = document.getElementById('qty-value');
  const qtyPlus = document.getElementById('qty-plus');
  const qtyMinus = document.getElementById('qty-minus');

  if (qtyPlus && qtyMinus && qtyValue) {
    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyValue.textContent);
      qtyValue.textContent = val + 1;
    });
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyValue.textContent);
      if (val > 1) qtyValue.textContent = val - 1;
    });
  }

  // Thumbnail click to change main image
  const thumbItems = document.querySelectorAll('.thumb-item');
  thumbItems.forEach(item => {
    item.addEventListener('click', () => {
      thumbItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const img = item.querySelector('img');
      if (img && heroElem) {
        heroElem.src = img.src;
      }
    });
  });

  // Buy now click
  const buyNowBtn = document.querySelector('.btn-buy-now');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', async () => {
      // For now, Buy Now does the same as Add to Cart but could redirect to checkout
      await addCartBtn.click();
      window.location.href = 'cart.html';
    });
  }

  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.style.fontWeight = '500';
        b.style.color = '#666';
        b.style.borderBottom = 'none';
      });
      btn.classList.add('active');
      btn.style.fontWeight = '700';
      btn.style.color = '#000';
      btn.style.borderBottom = '2px solid #000';
      
      // Note: In this simple version, we only have one panel being updated
      // If we had multiple panels, we'd toggle their hidden attribute here.
    });
  });

  // Add to cart click
  const addCartBtn = document.getElementById('add-to-cart-btn');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', async () => {
      const activeSize = document.querySelector('.size-option.active')?.getAttribute('data-size') || 'L';
      const qtyStr = qtyValue ? qtyValue.textContent : '1';
      
      addCartBtn.disabled = true;
      const originalText = addCartBtn.textContent;
      addCartBtn.textContent = 'Đang xử lý...';

      try {
        await addToCart(product._id, Number(qtyStr), activeSize);
        updateCartBadge();
        alert('Đã thêm sản phẩm vào giỏ hàng!');
      } catch (error) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      } finally {
        addCartBtn.disabled = false;
        addCartBtn.textContent = originalText;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initDetail);
