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
  
  return `
    <article class="aura-product-card">
      <div class="aura-product-media">
        ${badgeContent}
        ${hasSale ? `<div class="aura-sale-bubble">-${salePercent}%</div>` : ''}
        <a href="${detailHref}" class="aura-image-link">
          <img src="${product.image}" alt="${product.name}" loading="lazy" 
               onerror="this.closest('.aura-product-media').classList.add('img-error')">
        </a>
      </div>
      <div class="aura-product-info">
        <div class="aura-card-meta">
          <div class="aura-card-dots">
            <span class="aura-dot has-check" style="background:#ddd;"></span>
            <span class="aura-dot" style="background:#555;"></span>
            <span class="aura-dot" style="background:#8b0000;"></span>
            <span class="aura-dot" style="background:#ccac00;"></span>
          </div>
          <button class="aura-card-wishlist" aria-label="Add to wishlist">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <h4 class="aura-product-title-sm"><a href="${detailHref}">${product.name}</a></h4>
        <div class="aura-card-buy-row">
            <div class="aura-price-stack">
                <strong class="aura-price-bold">${formatVnd(product.price)}</strong>
                ${hasSale ? `<span class="aura-price-old-sm">${formatVnd(product.originalPrice)}</span>` : ''}
            </div>
            <button class="aura-mini-cart-btn ivy-cart-btn" data-product-id="${productId}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg>
            </button>
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
  const aboutHref = inPagesFolder ? 'about.html' : 'pages/about.html';
  const contactHref = inPagesFolder ? 'contact.html' : 'pages/contact.html';
  const profileHref = inPagesFolder ? 'profile.html' : 'pages/profile.html';
  const cartHref = inPagesFolder ? 'cart.html' : 'pages/cart.html';
  const favHref = inPagesFolder ? 'favorites.html' : 'pages/favorites.html';
  const loginHref = inPagesFolder ? 'login.html' : 'pages/login.html';
  const registerHref = inPagesFolder ? 'register.html' : 'pages/register.html';
  const offersHref = inPagesFolder ? 'offers.html' : 'pages/offers.html';
  const salePageHref = inPagesFolder ? 'sale.html' : 'pages/sale.html';
  const logoSrc = inPagesFolder ? '../assets/images/logo/logo.png' : 'assets/images/logo/logo.png';

  const womenHref = `${shopHref}?gender=women`;
  const menHref = `${shopHref}?gender=men`;
  const storeHref = shopHref;

  const header = `
    <header class="aura-topbar top-nav">
      <!-- Top Row: Search, Logo, Actions -->
      <div class="aura-header-top">
        <div class="container aura-header-top-inner">
          <div class="aura-search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="TÌM KIẾM" aria-label="Search" />
          </div>
          
          <a class="aura-logo" href="${homeHref}" aria-label="Aurelia home">
            <img src="${logoSrc}" alt="AURELIA" class="aura-logo-img">
          </a>
          
          <div class="aura-nav-actions">
            <a class="aura-action-item" href="${shopHref}">
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
              <a href="#" class="aura-nav-link-new" data-nav-link>BỘ SƯU TẬP</a>
              <div class="aura-mega-menu">
                <div class="aura-mega-main">
                  <div class="aura-mega-content">
                    <div class="aura-mega-left">
                        <div class="container-fluid aura-mega-grid">
                            <div class="mega-column">
                                <h5>THEO MÙA</h5>
                                <a href="#">Xuân Hè 2026</a>
                                <a href="#">Thu Đông 2025</a>
                                <a href="#">Pre-Fall Collection</a>
                                <a href="#">Holiday Capsule</a>
                            </div>
                            <div class="mega-column">
                                <h5>CONCEPT</h5>
                                <a href="#">Minimalist Muse</a>
                                <a href="#">Urban Chic</a>
                                <a href="#">Classic Elegance</a>
                                <a href="#">Evening Glamour</a>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="aura-nav-item-new mega-dropdown">
              <a href="${shopHref}?category=accessories" class="aura-nav-link-new" data-nav-link>PHỤ KIỆN</a>
              <div class="aura-mega-menu">
                <div class="aura-mega-main">
                  <div class="aura-mega-content">
                    <div class="aura-mega-left">
                        <div class="container-fluid aura-mega-grid">
                            <div class="mega-column">
                                <h5>HÀNG MỚI VỀ</h5>
                                <a href="#">Trang sức cao cấp</a>
                                <a href="#">Khăn lụa</a>
                                <a href="#">Mũ thời trang</a>
                                <a href="#">Kính mát Heritage</a>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a href="${offersHref}" class="aura-nav-link-new" data-nav-link>ƯU ĐÃI</a>
            <a href="${aboutHref}" class="aura-nav-link-new" data-nav-link>GIỚI THIỆU</a>
            <a href="${contactHref}" class="aura-nav-link-new" data-nav-link>LIÊN HỆ</a>
          </nav>
        </div>
      </div>
    </header>
  `;

  const footer = `
    <footer class="site-footer ivy-footer">
      <div class="container ivy-footer-grid">
        <!-- Column 1: Brand & Socials -->
        <div class="ivy-footer-col brand-col">
          <div class="ivy-footer-logo-wrap">
            <img src="${logoSrc}" alt="AURELIA" class="footer-logo">
            <div class="cert-badges">
                <img src="https://pub-83c51323386e4176a95383562629e46a.r2.dev/dmca.png" alt="DMCA" style="height:20px;">
                <img src="https://pub-83c51323386e4176a95383562629e46a.r2.dev/bct.png" alt="BCT" style="height:20px;">
            </div>
          </div>
          <div class="ivy-footer-socials">
            <a href="#" class="social-icon fb"></a>
            <a href="#" class="social-icon gg"></a>
            <a href="#" class="social-icon ig"></a>
            <a href="#" class="social-icon zl"></a>
            <a href="#" class="social-icon yt"></a>
          </div>
          <div class="ivy-footer-hotline">
            HOTLINE: 0246 662 3434
          </div>
        </div>

        <!-- Column 2: Intro -->
        <div class="ivy-footer-col">
          <h5>Giới thiệu</h5>
          <ul>
            <li><a href="#">Về AURELIA</a></li>
            <li><a href="#">Tuyển dụng</a></li>
            <li><a href="#">Hệ thống cửa hàng</a></li>
          </ul>
        </div>

        <!-- Column 3: Customer Service -->
        <div class="ivy-footer-col">
          <h5>Dịch vụ khách hàng</h5>
          <ul>
            <li><a href="#">Chính sách điều khoản</a></li>
            <li><a href="#">Hướng dẫn mua hàng</a></li>
            <li><a href="#">Chính sách thanh toán</a></li>
            <li><a href="#">Chính sách đổi trả</a></li>
            <li><a href="#">Chính sách bảo hành</a></li>
            <li><a href="#">Chính sách giao nhận</a></li>
            <li><a href="#">Thẻ thành viên</a></li>
            <li><a href="#">Q&A</a></li>
          </ul>
        </div>

        <!-- Column 4: Contact -->
        <div class="ivy-footer-col">
          <h5>Liên hệ</h5>
          <ul>
            <li><a href="#">Hotline</a></li>
            <li><a href="#">Email</a></li>
            <li><a href="#">Live Chat</a></li>
            <li><a href="#">Messenger</a></li>
            <li><a href="${contactHref}">Liên hệ</a></li>
          </ul>
        </div>

        <!-- Column 5: Subscribe & App -->
        <div class="ivy-footer-col side-col">
          <div class="newsletter-box">
            <h6>Nhận thông tin các chương trình của AURELIA</h6>
            <form class="newsletter-form-minimal">
                <input type="email" placeholder="Nhập địa chỉ email">
                <button type="button">Đăng ký</button>
            </form>
          </div>
          <div class="app-download-wrap">
            <h5>Download App</h5>
            <div class="app-links">
                <a href="#"><img src="https://pub-83c51323386e4176a95383562629e46a.r2.dev/appstore.png" alt="App Store"></a>
                <a href="#"><img src="https://pub-83c51323386e4176a95383562629e46a.r2.dev/googleplay.png" alt="Google Play"></a>
            </div>
          </div>
        </div>
      </div>
      <div class="container ivy-footer-bottom">
        <p>©AURELIA All rights reserved</p>
      </div>
    </footer>
  `;

  return { header, footer };
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

  // Global "Add to Cart" Handling (Event Delegation)
  document.addEventListener('click', async (e) => {
    const cartBtn = e.target.closest('.ivy-cart-btn');
    if (cartBtn) {
        e.preventDefault();
        const productId = cartBtn.getAttribute('data-product-id');
        if (!productId) return;

        const { addToCart } = await import('./api.js');
        
        cartBtn.disabled = true;
        const originalContent = cartBtn.innerHTML;
        cartBtn.innerHTML = '...';

        try {
            await addToCart(productId, 1, 'L'); // Default size L
            updateCartBadge();
            // Show a simple alert for now
            alert('Added to cart!');
        } catch (error) {
            alert('Please login to add to cart.');
        } finally {
            cartBtn.disabled = false;
            cartBtn.innerHTML = originalContent;
        }
    }
  });

  // Infinite scroll gallery track duplication
  const galleryTrack = document.querySelector('.gallery-track');
  if (galleryTrack) {
    galleryTrack.innerHTML += galleryTrack.innerHTML;
  }
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
  const megaContainer = document.getElementById('mega-menu-categories');
  if (!megaContainer) return;

  try {
    const { fetchCategories } = await import('./api.js');
    const categories = await fetchCategories();
    const pathname = window.location.pathname;
    const inPagesFolder = pathname.includes('/pages/');
    const shopHref = inPagesFolder ? 'shop.html' : 'pages/shop.html';

    // Grouping by "group" field from Database accurately
    const groups = ['ÁO', 'ÁO KHOÁC', 'QUẦN & VÁY', 'PHỤ KIỆN'];
    
    // First column: Static links (TẤT CẢ SẢN PHẨM)
    let html = `
      <div class="mega-column">
        <h5>TẤT CẢ SẢN PHẨM</h5>
        <a href="${shopHref}?isNew=true">Sản phẩm mới</a>
        <a href="${shopHref}?isBestSeller=true">Bán chạy nhất</a>
        <a href="${shopHref}?promo=true">Siêu Ưu đãi</a>
        <a href="${shopHref}">Khám phá toàn bộ</a>
      </div>
    `;

    groups.forEach(groupName => {
        const groupCats = categories.filter(c => c.group === groupName);
        if (groupCats.length === 0) return;
        
        html += `<div class="mega-column"><h5>${groupName}</h5>`;
        groupCats.forEach(c => {
            html += `<a href="${shopHref}?category=${c.name}">${c.name}</a>`;
        });
        html += `</div>`;
    });

    megaContainer.innerHTML = html;
  } catch (error) {
    console.warn('MegaMenu loading error:', error);
    megaContainer.innerHTML = '<div class="mega-column"><h5>Lỗi tải dữ liệu</h5></div>';
  }
}

document.addEventListener('DOMContentLoaded', initBaseUI);
