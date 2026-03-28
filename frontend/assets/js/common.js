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
  
  return `
    <article class="aura-product-card">
      <div class="aura-product-media">
        ${hasSale ? `<div class="aura-sale-tag">-${salePercent}%</div>` : ''}
        ${product.badge ? `<div class="aura-top-badge">${product.badge}</div>` : ''}
        <a href="${detailHref}" class="aura-image-link">
          <img src="${product.image}" alt="${product.name}" loading="lazy" 
               onerror="this.closest('.aura-product-media').classList.add('img-error')">
          <div class="aura-card-action">THÊM VÀO GIỎ</div>
        </a>
      </div>
      <div class="aura-product-info">
        <div class="aura-brand">AURELIA <span class="aura-ref">#${String(productId).substring(0, 6).toUpperCase()}</span></div>
        <h4 class="aura-product-title"><a href="${detailHref}">${product.name}</a></h4>
        <div class="aura-price-row">
            <strong class="aura-current-price">${formatVnd(product.price)}</strong>
            ${oldPrice}
        </div>
        <div class="aura-card-footer">
          <div class="aura-card-colors">
            <span class="dot active" style="background:#242424;"></span>
            <span class="dot" style="background:#E8D8D0;"></span>
            <span class="dot" style="background:#C5A89E;"></span>
          </div>
          <button class="aura-card-wishlist" aria-label="Add to wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
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
  const loginHref = inPagesFolder ? 'login.html' : 'pages/login.html';
  const registerHref = inPagesFolder ? 'register.html' : 'pages/register.html';
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
            <a class="aura-action-item" href="${profileHref}">
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
            <a href="${shopHref}?sale=true" class="aura-nav-link-new sale-hl" data-nav-link>SALE ĐỒNG GIÁ</a>
            
            <div class="aura-nav-item-new mega-dropdown">
              <a href="${womenHref}" class="aura-nav-link-new" data-nav-link>THỜI TRANG</a>
              <div class="aura-mega-menu">
                <div class="container aura-mega-grid" id="mega-menu-categories">
                   <!-- Dynamically populated -->
                   <div class="mega-column"><h5>ĐANG TẢI...</h5></div>
                </div>
              </div>
            </div>

            <div class="aura-nav-item-new mega-dropdown">
              <a href="#" class="aura-nav-link-new" data-nav-link>BỘ SƯU TẬP</a>
              <div class="aura-mega-menu">
                <div class="container aura-mega-grid">
                  <div class="mega-column">
                    <h5>THEO MÙA</h5>
                    <a href="#">Xuân Hè 2026</a>
                    <a href="#">Thu Đông 2025</a>
                    <a href="#">Pre-Fall Collection</a>
                  </div>
                  <div class="mega-column">
                    <h5>CONCEPT</h5>
                    <a href="#">Minimalist Muse</a>
                    <a href="#">Urban Chic</a>
                    <a href="#">Classic Elegance</a>
                  </div>
                </div>
              </div>
            </div>

            <div class="aura-nav-item-new mega-dropdown">
              <a href="${shopHref}?category=accessories" class="aura-nav-link-new" data-nav-link>PHỤ KIỆN</a>
              <div class="aura-mega-menu">
                <div class="container aura-mega-grid">
                  <div class="mega-column">
                    <h5>HÀNG MỚI VỀ</h5>
                    <a href="#">Trang sức cao cấp</a>
                    <a href="#">Khăn lụa</a>
                    <a href="#">Mũ thời trang</a>
                  </div>
                </div>
              </div>
            </div>

            <a href="${shopHref}?promo=true" class="aura-nav-link-new" data-nav-link>ƯU ĐÃI</a>
            <a href="${shopHref}" class="aura-nav-link-new" data-nav-link>CỬA HÀNG</a>
            <a href="#" class="aura-nav-link-new" data-nav-link>TRA CỨU ĐƠN HÀNG</a>
          </nav>
        </div>
      </div>
    </header>
  `;

  const footer = `
    <footer class="site-footer aura-footer">
      <div class="container aura-footer-grid">
        <section>
          <h3>AURELIA</h3>
          <p>Empowering women through minimalist, elegant and sustainable fashion for the modern muse.</p>
          <div class="aura-socials">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="Twitter">TW</a>
          </div>
        </section>
        <section>
          <h5>Shop</h5>
          <a href="${shopHref}">New Arrivals</a>
          <a href="${shopHref}">Dresses</a>
          <a href="${shopHref}">Accessories</a>
          <a href="${shopHref}">Sale</a>
        </section>
        <section>
          <h5>Help</h5>
          <a href="${contactHref}">Contact Us</a>
          <a href="#">FAQ</a>
          <a href="#">Shipping & Returns</a>
          <a href="#">Size Guide</a>
        </section>
        <section>
          <h5>Newsletter</h5>
          <p>Subscribe to receive updates and exclusive drops.</p>
          <form class="aura-news-form" onsubmit="return false;">
            <input type="email" placeholder="Enter your email" aria-label="Email" />
            <button type="button">Join</button>
          </form>
          <p class="aura-auth-links"><a href="${loginHref}">Login</a> · <a href="${registerHref}">Register</a></p>
        </section>
      </div>
      <div class="container aura-footer-bottom">
        <span>&copy; <span id="current-year"></span> Aurelia. All rights reserved.</span>
        <span><a href="#">Privacy</a> · <a href="#">Terms</a></span>
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

    // Grouping by "group" field from Database
    const groups = ['ÁO', 'ÁO KHOÁC', 'QUẦN & VÁY', 'PHỤ KIỆN'];

    let html = '';
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
