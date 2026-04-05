import { fetchProducts, fetchProductById, addToCart, createOrder, getUserInfo } from './api.js';
import { formatVnd, updateCartBadge, createProductCard, syncWishlistVisuals } from './common.js';

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

  // NEW: Rating and Sold stats
  const ratingVal = document.getElementById('product-rating-val');
  const soldVal = document.getElementById('product-sold-val');
  if (ratingVal) ratingVal.textContent = `(${product.rating?.toFixed(1) || '5.0'})`;
  if (soldVal) soldVal.textContent = (product.totalSold || 0).toLocaleString();

  // Handle Original Price & Discount Badge
  const originalPriceElem = document.getElementById('product-original-price');
  const discountBadge = document.getElementById('product-discount-badge');
  if (product.originalPrice && product.originalPrice > product.price) {
      if (originalPriceElem) {
          originalPriceElem.textContent = formatVnd(product.originalPrice);
          originalPriceElem.style.display = 'block';
      }
      if (discountBadge) {
          const pct = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
          discountBadge.textContent = `Giam ${pct}%`;
          discountBadge.style.display = 'block';
      }
  } else {
      if (originalPriceElem) originalPriceElem.style.display = 'none';
      if (discountBadge) discountBadge.style.display = 'none';
  }

  // 3. Dynamic Variant Handling (Colors & Sizes)
  const colorContainer = document.querySelector('.color-list');
  const sizeContainer = document.querySelector('.size-grid');
  const thumbContainer = document.getElementById('product-thumbnails');
  const selectedColorText = document.getElementById('selected-color');
  const selectedSizeText = document.getElementById('selected-size');

  let currentVariant = product.variants?.[0] || { 
    color: product.color || 'Mặc định', 
    colorCode: '#000000', 
    images: product.images && product.images.length > 0 ? product.images : [product.image],
    sizes: ['S', 'M', 'L'] 
  };

  let selectedVariant = currentVariant;

  const qtyInput = document.getElementById('qty-value');
  const qtyPlus = document.getElementById('qty-plus');
  const qtyMinus = document.getElementById('qty-minus');
  const addCartBtn = document.getElementById('add-to-cart-btn');
  const buyNowBtn = document.getElementById('btn-buy-now-main');
  const stockState = document.getElementById('product-stock-state');

  const allImages = Array.from(new Set([
    product.image,
    ...(product.images || []),
    ...(product.variants ? product.variants.flatMap(v => v.images) : [])
  ])).filter(Boolean);

  function renderGallery(images, activeUrl) {
    if (!thumbContainer) return;
    thumbContainer.innerHTML = images.map((url, i) => `
      <div class="thumb-item ${url === activeUrl ? 'active' : ''}" data-url="${url}">
        <img src="${url}" alt="Thumbnail ${i + 1}" />
      </div>
    `).join('');
    if (activeUrl && heroElem) heroElem.src = activeUrl;
  }

  function renderSizes(sizes) {
    if (!sizeContainer) return;
    sizeContainer.innerHTML = sizes.map((s, i) => `
      <div class="size-option ${i === 0 ? 'active' : ''}" data-size="${s}">${s}</div>
    `).join('');
    if (selectedSizeText) selectedSizeText.textContent = sizes[0] || 'N/A';
  }

  function getAvailableStock() {
    if (product.variants && product.variants.length > 0) {
      return Math.max(0, Number(selectedVariant?.stock || 0));
    }
    return Math.max(0, Number(product.stock || 0));
  }

  function updateStockUI() {
    const availableStock = getAvailableStock();

    if (stockState) {
      stockState.classList.toggle('out', availableStock <= 0);
      stockState.textContent = availableStock <= 0
        ? 'San pham da het hang'
        : `Con lai: ${availableStock} san pham`;
    }

    if (qtyInput) {
      const currentQty = Number(qtyInput.value || 1);
      const safeQty = availableStock <= 0
        ? 0
        : Math.min(Math.max(currentQty, 1), availableStock);
      qtyInput.value = String(safeQty);
    }

    if (qtyPlus && qtyInput) {
      const currentQty = Number(qtyInput.value || 0);
      qtyPlus.disabled = availableStock <= 0 || currentQty >= availableStock;
    }

    if (qtyMinus && qtyInput) {
      const currentQty = Number(qtyInput.value || 0);
      qtyMinus.disabled = availableStock <= 0 || currentQty <= 1;
    }

    if (addCartBtn) addCartBtn.disabled = availableStock <= 0;
    if (buyNowBtn) buyNowBtn.disabled = availableStock <= 0;
  }

  // Initial Render
  renderGallery(allImages, currentVariant.images[0] || product.image);
  renderSizes(currentVariant.sizes);
  updateStockUI();

  if (product.variants && product.variants.length > 0) {
    colorContainer.innerHTML = product.variants.map((v, i) => `
      <div class="color-dot ${i === 0 ? 'active' : ''}" 
           data-color="${v.color}" 
           style="background: ${v.colorCode || '#eee'};" 
           title="${v.color}">
      </div>
    `).join('');
  }

  // Color Selection Logic
  document.querySelectorAll('.color-dot').forEach((dot, index) => {
    dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        
        const variant = product.variants ? product.variants[index] : currentVariant;
        selectedVariant = variant;
        if (selectedColorText) selectedColorText.textContent = variant.color;
        
        const firstVariantImg = (variant.images && variant.images.length > 0) ? variant.images[0] : product.image;
        if (heroElem) heroElem.src = firstVariantImg;
        
        document.querySelectorAll('.thumb-item').forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-url') === firstVariantImg);
        });

        renderSizes(variant.sizes);
        updateStockUI();
    });
  });

  // Size Selection Logic
  sizeContainer.onclick = (e) => {
    const opt = e.target.closest('.size-option');
    if (opt) {
        document.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        if (selectedSizeText) selectedSizeText.textContent = opt.getAttribute('data-size');
      updateStockUI();
    }
  };

  // Gallery Click Logic
  thumbContainer.onclick = (e) => {
    const item = e.target.closest('.thumb-item');
    if (item) {
        document.querySelectorAll('.thumb-item').forEach(li => li.classList.remove('active'));
        item.classList.add('active');
        const newSrc = item.querySelector('img').src;
        if (heroElem) heroElem.src = newSrc;
    }
  };

  if (qtyPlus && qtyMinus && qtyInput) {
    qtyPlus.onclick = () => {
        const next = Number(qtyInput.value || 0) + 1;
        const maxQty = getAvailableStock();
        qtyInput.value = String(Math.min(next, maxQty));
        updateStockUI();
    };
    qtyMinus.onclick = () => {
        let val = Number(qtyInput.value || 0);
        if (val > 1) qtyInput.value = String(val - 1);
        updateStockUI();
    };
  }

  // ─── Buy Now (Mua ngay) - Save product & redirect checkout ───────────────────────
  async function buyNowProduct() {
    // 1. Check login
    const user = getUserInfo();
    if (!user) {
      window.location.href = 'login.html?redirect=product-detail.html?id=' + getProductId();
      return;
    }

    // 2. Get selected size and quantity
    const selectedSize = document.querySelector('.size-option.active')?.getAttribute('data-size') || 'M';
    const selectedQty = Number(qtyInput?.value || '1');
    const selectedColor = selectedVariant?.color || 'Mac dinh';
    const selectedColorCode = selectedVariant?.colorCode || '';
    const availableStock = getAvailableStock();

    if (selectedQty < 1) {
      alert('Vui lòng chọn số lượng');
      return;
    }

    if (selectedQty > availableStock) {
      alert(`So luong toi da co the mua la ${availableStock}.`);
      return;
    }

    // 3. Save to sessionStorage + redirect checkout with buyNow param
    sessionStorage.setItem('buyNow_product', JSON.stringify({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: availableStock,
      quantity: selectedQty,
      size: selectedSize,
      color: selectedColor,
      colorCode: selectedColorCode,
    }));

    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? 'checkout.html?buyNow=1' : 'pages/checkout.html?buyNow=1';
  }

  // Buy now click
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', buyNowProduct);
  }

  const tryOnBtn = document.getElementById('btn-try-on-main');
  if (tryOnBtn) {
    tryOnBtn.addEventListener('click', () => {
      const inPages = window.location.pathname.includes('/pages/');
      const targetBase = inPages ? 'phong-thu-do.html' : 'pages/phong-thu-do.html';
      const query = new URLSearchParams();
      query.set('id', product._id);
      if (product.image) query.set('garmentImage', product.image);
      window.location.href = `${targetBase}?${query.toString()}`;
    });
  }

  // NEW: Redesigned Description Section
  function renderStructuredDescription() {
    const container = document.getElementById('product-desc-structured');
    if (!container) return;

    const sizesAvail = product.variants?.[0]?.sizes?.join(', ') || 'S, M, L, XL';
    container.innerHTML = `
      <div class="desc-structured-item">
          <h4>1. Thông tin sản phẩm</h4>
          <ul>
              <li>Kích thước: ${sizesAvail}</li>
              <li>Kiểu dáng: Form rộng unisex, phù hợp cả nam và nữ.</li>
              <li>Màu sắc: Đa dạng – dễ phối với mọi phong cách.</li>
              <li>Nơi sản xuất: Việt Nam.</li>
          </ul>
      </div>
      <div class="desc-structured-item">
          <h4>2. Chất vải</h4>
          <ul>
              <li>Basic: Vải được làm từ 35% cotton tự nhiên và 65% sợi polyester, thân thiện và an toàn cho làn da.</li>
              <li>Premium: 100% cotton tự nhiên chọn lọc, dệt mật độ cao, xử lý công nghệ kháng khuẩn tiên tiến.</li>
          </ul>
      </div>
      <div class="desc-structured-item">
          <h4>3. Ưu điểm nổi bật</h4>
          <ul>
              <li>Chất vải dầy vừa, co giãn tốt, giữ form chuẩn sau nhiều lần giặt.</li>
              <li>Không nhăn, không co rút, không xù lông – bền đẹp lâu dài.</li>
              <li>Giữ màu bền, hình in True HD rõ nét, không bong tróc.</li>
              <li>Dễ phối cùng quần jean, short, jogger hoặc layer với sơ mi.</li>
          </ul>
      </div>
      <div class="desc-structured-item">
          <h4>4. Hướng dẫn chọn size</h4>
          <p>Bạn tham khảo bảng dưới để chọn size phù hợp nhé:</p>
          <ul>
              <li>M: Cao <165cm, nặng <55kg</li>
              <li>L: Cao <170cm, nặng <65kg</li>
              <li>XL: Cao <180cm, nặng <90kg</li>
          </ul>
      </div>
    `;
  }
  renderStructuredDescription();

  const toggleBtn = document.getElementById('toggle-desc-btn');
  const descWrapper = document.getElementById('desc-wrapper');
  if (toggleBtn && descWrapper) {
      toggleBtn.onclick = () => {
          descWrapper.classList.toggle('collapsed');
          toggleBtn.textContent = descWrapper.classList.contains('collapsed') ? 'Xem thêm' : 'Ẩn bớt';
      };
  }

  // NEW: Classic Tab switching
  const classicTabs = document.querySelectorAll('.classic-tab');
  const panels = document.querySelectorAll('.tab-content-classic');

  classicTabs.forEach(tab => {
    tab.onclick = () => {
        classicTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const target = tab.getAttribute('data-tab');
        panels.forEach(p => p.style.display = 'none');
        document.getElementById(`tab-panel-${target}`).style.display = 'block';
    };
  });

  // NEW: Review logic
  const openReviewBtn = document.getElementById('open-review-form');
  const reviewFormBox = document.getElementById('review-form-box');
  const cancelReviewBtn = document.getElementById('cancel-review');
  const emptyReviewMsg = document.getElementById('no-reviews-msg');

  if (openReviewBtn && reviewFormBox) {
      openReviewBtn.onclick = () => {
          reviewFormBox.style.display = 'block';
          emptyReviewMsg.style.display = 'none';
      };
  }

  if (cancelReviewBtn) {
      cancelReviewBtn.onclick = () => {
          reviewFormBox.style.display = 'none';
          emptyReviewMsg.style.display = 'block';
      };
  }

  // Star rating
  const stars = document.querySelectorAll('.star-rating-input .star');
  stars.forEach(star => {
      star.onclick = () => {
          const val = parseInt(star.getAttribute('data-val'));
          stars.forEach(s => s.classList.remove('selected'));
          for (let i = 0; i < val; i++) {
              stars[i].classList.add('selected');
          }
      };
  });

  // NEW: Suggestions & Recently Viewed Logic
  async function initSuggestions() {
      const relatedGrid = document.getElementById('related-products-grid');
      const recentlyGrid = document.getElementById('recently-viewed-grid');
      const suggestTabs = document.querySelectorAll('.suggest-tab');
      const suggestPanels = document.querySelectorAll('.suggest-panel');

      // 1. Fetch Related Products
      try {
          const allProducts = await fetchProducts();
          const pId = productId;
          const currentCatId = product.category?._id || product.category;
          
          let related = allProducts.filter(p => (p._id || p.id) !== pId && ((p.category?._id || p.category) === currentCatId));
          if (related.length < 10) {
              related = [...related, ...allProducts.filter(p => (p._id || p.id) !== pId && !related.find(r => (r._id || r.id) === (p._id || p.id)))];
          }
          
          relatedGrid.innerHTML = related.slice(0, 10).map(createProductCard).join('');
          syncWishlistVisuals();
      } catch (err) {
          console.error('Suggestions error:', err);
      }

      // 2. Track recently viewed
      let recently = JSON.parse(localStorage.getItem('aura_recently_viewed') || '[]');
      // Add current product
      recently = recently.filter(p => (p._id || p.id) !== productId);
      recently.unshift(product);
      recently = recently.slice(0, 12); // Keep up to 12
      localStorage.setItem('aura_recently_viewed', JSON.stringify(recently));

      // 3. Tab switching
      suggestTabs.forEach(tab => {
          tab.onclick = () => {
              suggestTabs.forEach(t => t.classList.remove('active'));
              tab.classList.add('active');
              
              const target = tab.getAttribute('data-tab');
              suggestPanels.forEach(p => p.style.display = 'none');
              const targetPanel = document.getElementById(`panel-${target}`);
              if (targetPanel) targetPanel.style.display = 'block';

              if (target === 'recently') {
                  const items = JSON.parse(localStorage.getItem('aura_recently_viewed') || '[]');
                  recentlyGrid.innerHTML = items.map(createProductCard).join('');
                  syncWishlistVisuals();
              }
          };
      });
  }
  initSuggestions();

  // 7. Size Guide Modal
  const sizeGuideLink = document.querySelector('.size-guide-link');
  const sizeModal = document.getElementById('size-guide-modal');
  const sizeModalImg = document.getElementById('size-guide-img');

  if (sizeGuideLink) {
    if (product.sizeGuideImage) {
        sizeGuideLink.onclick = (e) => {
            e.preventDefault();
            sizeModalImg.src = product.sizeGuideImage;
            sizeModal.style.display = 'flex';
        };
    } else {
        sizeGuideLink.style.display = 'none';
    }
  }

  if (sizeModal) {
    sizeModal.onclick = (e) => {
        if (e.target === sizeModal || e.target.closest('.close-modal-btn')) {
            sizeModal.style.display = 'none';
        }
    };
  }

  // Add to cart
  if (addCartBtn) {
    addCartBtn.onclick = async () => {
      const activeSize = document.querySelector('.size-option.active')?.getAttribute('data-size') || 'L';
      const activeColor = selectedVariant?.color || document.querySelector('.color-dot.active')?.getAttribute('data-color') || 'Mac dinh';
      const activeColorCode = selectedVariant?.colorCode || '';
      const qtyStr = qtyInput ? qtyInput.value : '1';
      const qty = Number(qtyStr);
      const availableStock = getAvailableStock();

      if (qty > availableStock) {
        const { showToast } = await import('./common.js');
        showToast('Thong bao', `Chi con ${availableStock} san pham cho lua chon nay.`, 'error');
        return;
      }
      
      addCartBtn.disabled = true;
      const originalText = addCartBtn.textContent;
      addCartBtn.textContent = 'Đang xử lý...';

      try {
        await addToCart(product._id, qty, activeSize, activeColor, activeColorCode);
        updateCartBadge();
        const { showToast } = await import('./common.js');
        showToast('Thành công', `Đã thêm ${qtyStr} sản phẩm (${activeColor} - Size ${activeSize}) vào giỏ hàng!`);
      } catch (error) {
        const { showToast } = await import('./common.js');
        showToast('Lỗi', error.message || 'Khong the them san pham vao gio.', 'error');
      } finally {
        addCartBtn.disabled = false;
        addCartBtn.textContent = originalText;
        updateStockUI();
      }
    };
  }

  // 8. Wishlist & Share Logic
  const wishBtn = document.getElementById('detail-wishlist-btn');
  const shareBtn = document.getElementById('detail-share-btn');

  if (wishBtn) {
    wishBtn.onclick = async () => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            const { showToast } = await import('./common.js');
            showToast('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để lưu sản phẩm yêu thích', 'error');
            return;
        }

        try {
            const { toggleWishlist } = await import('./api.js');
            const { showToast } = await import('./common.js');
            const res = await toggleWishlist(productId);
            window.AURELIA_WISH_LIST = res.wishlist;
            wishBtn.classList.toggle('active');
            showToast('Thành công', 'Đã cập nhật danh sách yêu thích');
        } catch (error) {
            console.error(error);
        }
    };
    
    if (window.AURELIA_WISH_LIST) {
        if (window.AURELIA_WISH_LIST.some(id => (id._id || id) === productId)) {
            wishBtn.classList.add('active');
        }
    }
  }

  if (shareBtn) {
    shareBtn.onclick = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            const { showToast } = await import('./common.js');
            showToast('Thành công', 'Đã sao chép liên kết sản phẩm vào bộ nhớ tạm!');
        } catch (err) {
            alert('Không thể sao chép liên kết.');
        }
    };
  }
}

document.addEventListener('DOMContentLoaded', initDetail);
