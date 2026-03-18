export function formatVnd(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export function createProductCard(product) {
  const badgeType = product.originalPrice ? 'sale' : 'new';
  const oldPrice = product.originalPrice ? `<span class="old-price">${formatVnd(product.originalPrice)}</span>` : '';
  const inPagesFolder = window.location.pathname.includes('/pages/');
  const detailHref = inPagesFolder ? `product-detail.html?id=${product.id}` : `pages/product-detail.html?id=${product.id}`;

  return `
    <article class="product-card">
      <div class="product-media">
        <span class="badge ${badgeType}" style="position:absolute;top:12px;left:12px;z-index:3;">${product.badge}</span>
        <a href="${detailHref}"><img src="${product.image}" alt="${product.name}"></a>
        <button class="quick-add" data-product-id="${product.id}">Quick Add +</button>
      </div>
      <div class="product-meta">
        <h4><a href="${detailHref}">${product.name}</a></h4>
        <div class="price-row">
          <strong>${formatVnd(product.price)}</strong>
          ${oldPrice}
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

  const header = `
    <header class="aura-topbar top-nav">
      <div class="container aura-nav-row">
        <button class="aura-menu-btn" data-menu-toggle aria-label="Toggle menu">Menu</button>
        <a class="aura-logo" href="${homeHref}" aria-label="Aurelia home">
          <span class="aura-logo-monogram" aria-hidden="true">A</span>
          <span class="aura-logo-text">
            <strong>AURELIA</strong>
            <small>LUXURY FASHION</small>
          </span>
        </a>
        <nav class="aura-nav-links" data-nav-links>
          <a href="${homeHref}" data-nav-link>Home</a>
          <a href="${shopHref}" data-nav-link>Shop</a>
          <a href="${aboutHref}" data-nav-link>About</a>
          <a href="${contactHref}" data-nav-link>Contact</a>
        </nav>
        <div class="aura-nav-actions">
          <a class="aura-nav-icon" href="${profileHref}" aria-label="Profile">U</a>
          <a class="aura-nav-icon aura-cart" href="${cartHref}" aria-label="Cart">B<span>3</span></a>
        </div>
      </div>
      <div class="aura-announcement">
        <div class="container aura-announcement-shell">
          <div class="aura-announcement-track">
            <span>Free shipping over 2.000.000đ</span>
            <span>New collection every Friday</span>
            <span>Secure checkout with premium support</span>
            <span>Easy 30-day returns on all orders</span>
            <span>Member-only drops and weekly offers</span>
            <span>Free styling consultation for VIP customers</span>
          </div>
          <div class="aura-announcement-track" aria-hidden="true">
            <span>Free shipping over 2.000.000đ</span>
            <span>New collection every Friday</span>
            <span>Secure checkout with premium support</span>
            <span>Easy 30-day returns on all orders</span>
            <span>Member-only drops and weekly offers</span>
            <span>Free styling consultation for VIP customers</span>
          </div>
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

  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-link]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (href === path || href === `pages/${path}` || (path === '' && href === 'index.html')) {
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

  // Infinite scroll gallery track duplication
  const galleryTrack = document.querySelector('.gallery-track');
  if (galleryTrack) {
    galleryTrack.innerHTML += galleryTrack.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', initBaseUI);
