export function formatVnd(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export function createProductCard(product) {
  const inPagesFolder = window.location.pathname.includes('/pages/');
  const productId = product._id || product.id;
  const detailHref = inPagesFolder ? `product-detail.html?id=${productId}` : `pages/product-detail.html?id=${productId}`;
  
  const hasSale = product.originalPrice && product.originalPrice > product.price;
  const salePercent = hasSale ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
  const oldPrice = hasSale ? `<span class="aura-old-price">${formatVnd(product.originalPrice)}</span>` : '';
  
  const badgeContent = product.isBestSeller ? `<div class="aura-badge-best">Best Seller</div>` : (product.isNew ? `<div class="aura-badge-new">NEW</div>` : '');
  
  const dotsHtml = (product.variants && product.variants.length > 0)
    ? product.variants.slice(0, 5).map((v, i) => `
        <span class="aura-dot ${i === 0 ? 'active' : ''}" 
              style="background: ${v.colorCode || '#ddd'};" 
              data-variant-img="${v.images?.[0] || product.image}"
              title="${v.color}">
        </span>
      `).join('')
    : '<span class="aura-dot active" style="background:#ccc;"></span>';

  const allImgs = Array.from(new Set([
    product.image,
    ...(product.images || []),
    ...(product.variants ? product.variants.flatMap(v => v.images) : [])
  ])).filter(Boolean);

  return `
    <article class="aura-product-card">
      <div class="aura-product-media" data-images='${JSON.stringify(allImgs)}'>
        ${badgeContent}
        ${hasSale ? `<div class="aura-sale-bubble">-${salePercent}%</div>` : ''}
        <a href="${detailHref}" class="aura-image-link">
          <img src="${product.image}" alt="${product.name}" loading="lazy" 
               class="aura-main-img"
               onerror="this.closest('.aura-product-media').classList.add('img-error')">
        </a>
      </div>
      <div class="aura-product-info">
        <div class="aura-card-meta">
          <div class="aura-card-dots">
            ${dotsHtml}
          </div>
          <button class="aura-card-wishlist" data-product-id="${productId}" aria-label="Add to wishlist">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <h4 class="aura-product-title-sm"><a href="${detailHref}">${product.name}</a></h4>
        <div class="aura-card-buy-row" style="gap: 8px;">
            <div class="aura-price-stack">
                <strong class="aura-price-bold">${formatVnd(product.price)}</strong>
                ${hasSale ? `<span class="aura-price-old-sm">${formatVnd(product.originalPrice)}</span>` : ''}
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="aura-mini-cart-btn ivy-cart-btn" data-product-id="${productId}" title="Thêm vào giỏ">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg>
                </button>
                <button class="aura-buy-now-btn ivy-buy-now-btn" data-product-id="${productId}" title="Mua ngay">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
            </div>
        </div>
      </div>
    </article>
  `;
}

function buildUserShell() {
  const pathname = window.location.pathname;
  const inPagesFolder = pathname.includes('/pages/');
  const homeHref = inPagesFolder ? '../index.html' : 'index.html';
  const shopHref = inPagesFolder ? 'shop.html' : 'pages/shop.html';
  const profileHref = inPagesFolder ? 'profile.html' : 'pages/profile.html';
  const cartHref = inPagesFolder ? 'cart.html' : 'pages/cart.html';
  const favHref = `${profileHref}?tab=wishlist`;
  const loginHref = inPagesFolder ? 'login.html' : 'pages/login.html';
  const registerHref = inPagesFolder ? 'register.html' : 'pages/register.html';
  const membershipHref = inPagesFolder ? 'membership.html' : 'pages/membership.html';
  const salePageHref = inPagesFolder ? 'sale.html' : 'pages/sale.html';
  const collectionsHref = inPagesFolder ? 'collections.html' : 'pages/collections.html';
  const logoSrc = inPagesFolder ? '../assets/images/logo/logo.png' : 'assets/images/logo/logo.png';

  const womenHref = `${shopHref}?gender=women`;
  const menHref = `${shopHref}?gender=men`;
  const storesHref = inPagesFolder ? 'stores.html' : 'pages/stores.html';
  const storeHref = shopHref; // Keep for other uses if any
  const accessoriesHref = inPagesFolder ? 'accessories.html' : 'pages/accessories.html';

  const header = `
    <!-- Info Bar -->
    <div class="aura-info-bar">
      <div class="container aura-info-bar-inner">
        <div style="display: flex; gap: 1.2rem; align-items: center;">
          <div class="info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <a href="tel:1900123456">1900 123 456</a>
          </div>
          <div class="info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>09:00 - 22:00 (T2 - CN)</span>
          </div>
        </div>
        
        <!-- Scrolling Promo Text -->
        <div class="aura-promo-scroller">
          <div class="promo-text">
            ✨ Miễn phí ship đơn từ 500k • Sản phẩm mới hôm nay • Giảm giá đến 60% • Đăng ký thành viên nhận ưu đãi • ✨ Miễn phí ship đơn từ 500k • Sản phẩm mới hôm nay • Giảm giá đến 60% • Đăng ký thành viên nhận ưu đãi •
          </div>
        </div>
        
        <div class="info-item highlight">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path></svg>
          <strong>Thành viên</strong>
        </div>
      </div>
    </div>

    <header class="aura-topbar top-nav">
      <!-- Top Row: Search, Logo, Actions -->
      <div class="aura-header-top">
        <div class="container aura-header-top-inner">
          <div class="aura-search-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="aura-search-input" placeholder="Tìm kiếm sản phẩm..." aria-label="Search" />
          </div>
          
          <a class="aura-logo" href="${homeHref}" aria-label="Aurelia home">
            <img src="${logoSrc}" alt="AURELIA" class="aura-logo-img">
          </a>
          
          <div class="aura-nav-actions">
            <a class="aura-action-item" href="${storesHref}" data-nav-link>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>CỬA HÀNG</span>
            </a>
            <a class="aura-action-item" href="${favHref}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span>SẢN PHẨM YÊU THÍCH</span>
            </a>
            <a class="aura-action-item aura-cart" href="${cartHref}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span class="aura-cart-badge" id="cart-badge">0</span>
              <span>GIỎ HÀNG</span>
            </a>
            <a class="aura-action-item" href="${profileHref}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>TÀI KHOẢN</span>
            </a>
          </div>

        </div>
      </div>

      <!-- Bottom Row: Main Navigation -->
      <div class="aura-header-bottom">
        <div class="container">
          <nav class="aura-nav-links-new">
            <a href="${salePageHref}" class="aura-nav-link-new sale-hl" data-nav-link>SALE ĐỒNG GIÁ</a>
            
            <div class="aura-nav-item-new mega-dropdown">
              <a href="${womenHref}" class="aura-nav-link-new" data-nav-link>THỜI TRANG</a>
              <div class="aura-mega-menu">
                <div class="aura-mega-main">
                  <div class="aura-mega-content">
                    <div class="aura-mega-left">
                      <div class="container-fluid aura-mega-grid" id="mega-menu-categories">
                         <!-- Dynamically populated -->
                         <div class="mega-column"><h5>ĐANG TẢI...</h5></div>
                      </div>
                    </div>
                    <div class="aura-mega-right">
                        <div class="mega-promo-card">
                            <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?auto=format&fit=crop&w=400&q=80" alt="New Arrival">
                            <div class="mega-promo-overlay">
                                <span>COLLECTION 2026</span>
                                <h4>XUÂN HÈ MỚI NHẤT</h4>
                            </div>
                        </div>
                        <div class="mega-promo-card">
                            <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80" alt="Sale">
                            <div class="mega-promo-overlay">
                                <span>LIMITED OFFER</span>
                                <h4>QUÀ TẶNG THÀNH VIÊN</h4>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
                <!-- Bottom Bar -->
                <div class="aura-mega-footer">
                    <div class="container-fluid" style="display:flex; align-items:center; gap:40px;">
                        <span>GỢI Ý TÌM KIẾM:</span>
                        <div class="aura-mega-foot-links">
                            <a href="${shopHref}?q=minimalist">Minimalist Muse</a>
                            <a href="${shopHref}?q=urban">Urban Chic</a>
                            <a href="${shopHref}?q=classic">Classic Elegance</a>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            <div class="aura-nav-item-new mega-dropdown">
              <a href="${collectionsHref}" class="aura-nav-link-new" data-nav-link>BỘ SƯU TẬP</a>
              <div class="aura-mega-menu">
                <div class="aura-mega-main">
                  <div class="aura-mega-content">
                    <div class="aura-mega-left">
                        <div id="mega-collections-container" class="container-fluid aura-mega-grid">
                            <!-- Populated dynamically via JS -->
                            <div class="mega-column">
                                <h5 class="skeleton-text">TẢI DỮ LIỆU...</h5>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
                <!-- Optional footer for collections -->
                <div class="aura-mega-footer">
                    <div class="container-fluid" style="display:flex; align-items:center; gap:40px;">
                        <span>GỢI Ý:</span>
                        <div class="aura-mega-foot-links">
                          <a href="${collectionsHref}">BST Mới nhất</a>
                          <a href="${collectionsHref}?group=THEO%20MUA">Lookbook 2026</a>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            <div class="aura-nav-item-new mega-dropdown">
              <a href="${accessoriesHref}" class="aura-nav-link-new" data-nav-link>PHỤ KIỆN</a>
              <div class="aura-mega-menu">
                <div class="aura-mega-main">
                  <div class="aura-mega-content">
                    <div class="aura-mega-left">
                        <div class="container-fluid aura-mega-grid">
                            <div class="mega-column">
                                <h5>TẤT CẢ PHỤ KIỆN</h5>
                                <div class="mega-links-stack">
                                    <a href="${accessoriesHref}" class="mega-item-link">Xem tất cả phụ kiện</a>
                                    <a href="${accessoriesHref}?category=Túi xách" class="mega-item-link">Túi xách</a>
                                    <a href="${accessoriesHref}?category=Trang sức" class="mega-item-link">Trang sức cao cấp</a>
                                    <a href="${accessoriesHref}?category=Khăn" class="mega-item-link">Khăn lụa</a>
                                    <a href="${accessoriesHref}?category=Mũ" class="mega-item-link">Mũ thời trang</a>
                                    <a href="${accessoriesHref}?category=Kính mắt" class="mega-item-link">Kính mắt</a>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a href="${membershipHref}" class="aura-nav-link-new" data-nav-link>THÀNH VIÊN</a>
          </nav>
        </div>
      </div>
    </header>
  `;

  const footer = `
    <footer class="site-footer aura-footer-renewed">
      <!-- Service Bar Section -->
      <div class="aura-footer-service">
        <div class="container aura-service-grid">
          <div class="aura-service-item">
            <div class="service-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="m7 8 3 3 7-7"/></svg>
            </div>
            <div class="service-content">
              <h6>Miễn phí vận chuyển</h6>
              <p>Miễn phí đơn hàng từ 500k</p>
            </div>
          </div>
          <div class="aura-service-item">
            <div class="service-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </div>
            <div class="service-content">
              <h6>Đổi trả dễ dàng</h6>
              <p>Đổi trả hàng trong 60 ngày</p>
            </div>
          </div>
          <div class="aura-service-item">
            <div class="service-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div class="service-content">
              <h6>Hỗ trợ 24/7</h6>
              <p>Gọi hotline để được tư vấn</p>
            </div>
          </div>
          <div class="aura-service-item">
            <div class="service-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <div class="service-content">
              <h6>Thanh toán đa dạng</h6>
              <p>Nhiều phương thức thanh toán online</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Newsletter & Socials Row -->
      <div class="aura-footer-subscriber">
        <div class="container subscriber-grid">
          <div class="sub-form-wrap">
            <h5>ĐĂNG KÍ NHẬN TIN</h5>
            <div class="sub-input-group">
              <input type="email" placeholder="Email" id="footer-sub-email">
              <button type="button" class="sub-btn">Đăng ký</button>
            </div>
          </div>
          <div class="sub-socials">
            <a href="#" aria-label="Zalo" class="social-dot zl"><img src="https://img.icons8.com/color/48/zalo.png" alt="Zalo"></a>
            <a href="#" aria-label="TikTok" class="social-dot tk"><img src="https://img.icons8.com/color/48/tiktok.png" alt="TikTok"></a>
            <a href="#" aria-label="YouTube" class="social-dot yt"><img src="https://img.icons8.com/color/48/youtube-play.png" alt="YouTube"></a>
            <a href="#" aria-label="Instagram" class="social-dot ig"><img src="https://img.icons8.com/color/48/instagram-new.png" alt="Instagram"></a>
            <a href="#" aria-label="Facebook" class="social-dot fb"><img src="https://img.icons8.com/color/48/facebook-new.png" alt="Facebook"></a>
          </div>
        </div>
      </div>

      <!-- Main Footer Columns -->
      <div class="aura-footer-main">
        <div class="container main-grid">
          <!-- Col 1: Intro -->
          <div class="footer-col intro-col">
            <h5>Giới thiệu</h5>
            <p>AURELIA là thương hiệu thời trang thiết kế cao cấp, mang đến phong cách thanh lịch và sang trọng cho phụ nữ hiện đại.</p>
            <div class="footer-contact-stack">
              <p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> 036.8771.773 (8:00AM-22:00PM)</p>
              <p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> info@ptgrow.com</p>
              <p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> 488/30 Phạm Văn Chiêu, HCM</p>
            </div>
            
            <div class="footer-payment-section">
              <h6>PHƯƠNG THỨC THANH TOÁN</h6>
              <div class="payment-flex">
                <img src="https://img.icons8.com/color/48/visa.png" alt="Visa">
                <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard">
                <img src="https://img.icons8.com/color/48/momo.png" alt="MoMo">
                <img src="https://img.icons8.com/color/48/zalo.png" alt="ZaloPay">
              </div>
            </div>
          </div>

          <!-- Col 2: Policies -->
          <div class="footer-col">
            <h5>Chính sách</h5>
            <ul class="footer-links">
              <li><a href="#">Chính sách giao hàng</a></li>
              <li><a href="#">Chính sách hoàn tiền</a></li>
              <li><a href="#">Bảo mật thông tin</a></li>
              <li><a href="#">Điều kiện đổi trả hàng</a></li>
            </ul>
          </div>

          <!-- Col 3: Support -->
          <div class="footer-col">
            <h5>Hỗ trợ</h5>
            <ul class="footer-links">
              <li><a href="#">Hướng dẫn đặt hàng</a></li>
              <li><a href="#">Phương thức thanh toán</a></li>
              <li><a href="#">Blogs thời trang</a></li>
            </ul>
          </div>

          <!-- Col 4: Partnership -->
          <div class="footer-col">
            <h5>Hợp tác</h5>
            <ul class="footer-links">
              <li><a href="#">Affiliate & KOC</a></li>
              <li><a href="#">Cung cấp sỉ</a></li>
              <li><a href="#">Đồng phục doanh nghiệp</a></li>
              <li><a href="#">Hợp tác gia công</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Copyright Bar -->
      <div class="aura-footer-copyright">
        <div class="container copyright-inner">
          <div class="copy-text">
            <p>© CÔNG TY TNHH AURELIA FASHION - Mã số doanh nghiệp: 0315165728</p>
          </div>
          <div class="bct-badge">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5Vo635FJfFpFdFbwT0Qj6L7ryLsb8RCgcpw&s" alt="Đã thông báo Bộ Công Thương">
          </div>
        </div>
      </div>
    </footer>
  `;

  return { header, footer };
}

export function showToast(title, message, type = 'success') {
    let container = document.querySelector('.aura-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'aura-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'aura-toast';
    const icon = type === 'success' ? '✓' : '!';
    
    toast.innerHTML = `
        <div class="aura-toast-icon">${icon}</div>
        <div class="aura-toast-content">
            <h6>${title}</h6>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ─── Buy Now Direct (Mua ngay - bypass cart, go to checkout) ────────────────────────
export async function buyNowDirect(productId) {
  try {
    const { getUserInfo, fetchProductById } = await import('./api.js');
    const user = getUserInfo();
    if (!user) {
      showToast('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để mua sắm', 'error');
      setTimeout(() => {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
      }, 1000);
      return;
    }

    // Fetch product & save to sessionStorage
    const product = await fetchProductById(productId);
    sessionStorage.setItem('buyNow_product', JSON.stringify({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      size: 'M',
    }));

    // Redirect to checkout with buyNow param
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? 'checkout.html?buyNow=1' : 'pages/checkout.html?buyNow=1';
  } catch (err) {
    console.error('Buy now error:', err);
    showToast('Lỗi', 'Không thể xử lý: ' + (err.message || 'Vui lòng thử lại'), 'error');
  }
}

export function initBaseUI() {
  const pathname = window.location.pathname;
  const isAdminPage = pathname.includes('/pages/admin/');

  if (!isAdminPage) {
    const shell = buildUserShell();
    const existingHeader = document.querySelector('header.top-nav');
    const existingFooter = document.querySelector('footer.site-footer');
    if (existingHeader) {
      existingHeader.outerHTML = shell.header;
    }
    if (existingFooter) {
      existingFooter.outerHTML = shell.footer;
    }
  }

  const menuButton = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      navLinks.classList.toggle('aura-open');
    });
  }

  const currentUrl = new URL(window.location.href);
  document.querySelectorAll('[data-nav-link]').forEach((anchor) => {
    const anchorUrl = new URL(anchor.getAttribute('href'), window.location.origin);
    const samePath = anchorUrl.pathname === currentUrl.pathname;
    const searchMatch = !anchorUrl.search || currentUrl.search.startsWith(anchorUrl.search);

    if (samePath && searchMatch) {
      anchor.classList.add('active');
    }
  });

  document.querySelectorAll('[data-admin-link]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (href && path.endsWith(href)) {
      anchor.classList.add('active');
    }
  });

  const year = document.getElementById('current-year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // Update cart badge on load
  updateCartBadge();
  initMegaMenu();

    // Global Event Delegation Handling
  document.addEventListener('click', async (e) => {
    // 1. Color Swatch Handling
    const dot = e.target.closest('.aura-dot');
    if (dot) {
        const card = dot.closest('.aura-product-card');
        const mainImg = card?.querySelector('.aura-main-img');
        const variantImg = dot.getAttribute('data-variant-img');
        
        if (mainImg && variantImg) {
            mainImg.src = variantImg;
            // Update active state
            card.querySelectorAll('.aura-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        }
        return; 
    }

    // 2. Add to Cart & Buy Now Handling
    const cartBtn = e.target.closest('.ivy-cart-btn');
    const buyNowBtn = e.target.closest('.ivy-buy-now-btn');
    
    if (cartBtn || buyNowBtn) {
        e.preventDefault();
        const btn = cartBtn || buyNowBtn;
        const productId = btn.getAttribute('data-product-id');
        if (!productId) return;

        // Buy Now: directly create order, bypass cart
        if (buyNowBtn) {
            await buyNowDirect(productId);
            return;
        }

        // Add to Cart
        const { addToCart } = await import('./api.js');
        
        btn.disabled = true;
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<span style="font-size:10px">...</span>';

        try {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo) {
                showToast('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để tiếp tục mua sắm', 'error');
                return;
            }

            await addToCart(productId, 1, 'M'); 
            updateCartBadge();
            
            showToast('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
        } catch (error) {
            showToast('Lỗi', 'Không thể thêm vào giỏ hàng', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }
    }

    // 3. Wishlist Toggle Handling
    const favBtn = e.target.closest('.aura-card-wishlist');
    if (favBtn) {
        e.preventDefault();
        const productId = favBtn.getAttribute('data-product-id');
        if (!productId) return;

        try {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo) {
                showToast('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để lưu sản phẩm yêu thích', 'error');
                return;
            }

            const { toggleWishlist } = await import('./api.js');
            const res = await toggleWishlist(productId);
            
            // Sync global cache
            window.AURELIA_WISH_LIST = res.wishlist;

            // Toggle visual state
            favBtn.classList.toggle('active');
            
            showToast('Thành công', 'Đã cập nhật danh sách yêu thích');
        } catch (error) {
            showToast('Lỗi', 'Không thể cập nhật danh sách yêu thích', 'error');
        }
        return;
    }
  });

  // Search functionality
  const searchInput = document.getElementById('aura-search-input');
  
  // Sync wishlist visuals if logged in
  const userInfoStr = localStorage.getItem('userInfo');
  if (userInfoStr) {
      import('./api.js').then(({ getUserProfile }) => {
          getUserProfile().then(user => {
              window.AURELIA_WISH_LIST = user.wishlist;
              syncWishlistVisuals(user.wishlist);
          });
      });
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          const pathname = window.location.pathname;
          const inPagesFolder = pathname.includes('/pages/');
          const shopPath = inPagesFolder ? 'shop.html' : 'pages/shop.html';
          window.location.href = `${shopPath}?q=${encodeURIComponent(query)}`;
        }
      }
    });
  }

  // 3. Hover Carousel for Product Media
  let currentCarouselInterval;
  document.addEventListener('mouseover', (e) => {
    const media = e.target.closest('.aura-product-media');
    if (media) {
        const imagesData = media.getAttribute('data-images');
        if (!imagesData) return;
        
        const images = JSON.parse(imagesData);
        if (images.length <= 1) return;
        
        const img = media.querySelector('.aura-main-img');
        const originalSrc = img.src;
        let idx = images.indexOf(originalSrc);
        if (idx === -1) idx = 0;

        clearInterval(currentCarouselInterval);
        currentCarouselInterval = setInterval(() => {
            idx = (idx + 1) % images.length;
            if (img) {
                img.style.transition = 'opacity 0.3s';
                img.style.opacity = '0.5';
                setTimeout(() => {
                    img.src = images[idx];
                    img.style.opacity = '1';
                }, 300);
            }
        }, 1200);

        media.onmouseleave = () => {
            clearInterval(currentCarouselInterval);
            if (img) {
                img.src = originalSrc;
                img.style.opacity = '1';
            }
        };
    }
  });
}

export async function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    try {
        const { fetchCart, getUserInfo } = await import('./api.js');
        if (!getUserInfo()) {
            badge.style.display = 'none';
            return;
        }
        const cart = await fetchCart();
        const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        badge.textContent = String(count);
        badge.style.display = count > 0 ? 'flex' : 'none';
    } catch (error) {
        badge.style.display = 'none';
    }
}

async function initMegaMenu() {
  const fashionContainer = document.getElementById('mega-menu-categories');
  const collectionsContainer = document.getElementById('mega-collections-container');
  
  if (!fashionContainer && !collectionsContainer) return;

  try {
    const { fetchCategories } = await import('./api.js');
    const categories = await fetchCategories();
    const pathname = window.location.pathname;
    const inPagesFolder = pathname.includes('/pages/');
    const shopHref = inPagesFolder ? 'shop.html' : 'pages/shop.html';
    const collectionsHref = inPagesFolder ? 'collections.html' : 'pages/collections.html';

    // 1. Populate Fashion Menu
    if (fashionContainer) {
        const fashionGroups = ['ÁO', 'ÁO KHOÁC', 'QUẦN & VÁY'];
        let fashionHtml = `
          <div class="mega-column">
            <h5>TẤT CẢ SẢN PHẨM</h5>
            <div class="mega-links-stack">
              <a href="${shopHref}?isNew=true" class="mega-item-link">Sản phẩm mới</a>
              <a href="${shopHref}?isBestSeller=true" class="mega-item-link">Bán chạy nhất</a>
              <a href="${shopHref}?promo=true" class="mega-item-link">Siêu Ưu đãi</a>
              <a href="${shopHref}" class="mega-item-link">Khám phá toàn bộ</a>
            </div>
          </div>
        `;

        fashionGroups.forEach(groupName => {
            const groupCats = categories.filter(c => c.group === groupName);
            if (groupCats.length > 0) {
                fashionHtml += `
                  <div class="mega-column">
                    <h5>${groupName}</h5>
                    <div class="mega-links-stack">
                      ${groupCats.map(c => `<a href="${shopHref}?category=${c.name}" class="mega-item-link">${c.name}</a>`).join('')}
                    </div>
                  </div>
                `;
            }
        });
        fashionContainer.innerHTML = fashionHtml;
    }

    // 2. Populate Collections Menu
    if (collectionsContainer) {
        const collectionGroups = ['THEO DỊP', 'SẢN PHẨM ĐẶC TRƯNG', 'THEO MÙA'];
        let collectionsHtml = '';

        collectionGroups.forEach(groupName => {
            const groupCats = categories.filter(c => c.group === groupName);
            if (groupCats.length > 0) {
                collectionsHtml += `
                  <div class="mega-column">
                    <h5>${groupName}</h5>
                    <div class="mega-links-stack">
                      ${groupCats.map(c => `<a href="${collectionsHref}?category=${encodeURIComponent(c.name)}" class="mega-item-link">${c.name}</a>`).join('')}
                    </div>
                  </div>
                `;
            }
        });

        if (!collectionsHtml) collectionsHtml = '<div class="mega-column"><h5>ĐANG CẬP NHẬT...</h5></div>';
        collectionsContainer.innerHTML = collectionsHtml;
    }

  } catch (error) {
    console.warn('MegaMenu loading error:', error);
  }
}

export function syncWishlistVisuals(wishlistIds = null) {
    const list = wishlistIds || window.AURELIA_WISH_LIST || [];
    const cleanIds = list.map(id => id._id || id);
    document.querySelectorAll('.aura-card-wishlist').forEach(btn => {
        const productId = btn.getAttribute('data-product-id');
        if (cleanIds.includes(productId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', initBaseUI);
