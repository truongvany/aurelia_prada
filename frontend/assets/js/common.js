export function formatVnd(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export function createProductCard(product) {
  const badgeType = product.originalPrice ? 'sale' : 'new';
  const oldPrice = product.originalPrice ? `<span class="ivy-old-price">${formatVnd(product.originalPrice)}</span>` : '';
  const inPagesFolder = window.location.pathname.includes('/pages/');
  const productId = product._id || product.id;
  const detailHref = inPagesFolder ? `product-detail.html?id=${productId}` : `pages/product-detail.html?id=${productId}`;

  return `
    <article class="ivy-product-card">
      <div class="ivy-product-media">
        <div class="ivy-badge ${badgeType}"><span>${product.badge}</span></div>
        <a href="${detailHref}"><img src="${product.image}" alt="${product.name}"></a>
      </div>
      <div class="ivy-product-info">
        <div class="ivy-colors-wishlist">
          <div class="ivy-colors">
            <span class="ivy-color active" style="background:#85a195;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" class="check-icon" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
            <span class="ivy-color" style="background:#242424;"></span>
          </div>
          <button class="ivy-wishlist" aria-label="Wishlist"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="heart-icon" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></button>
        </div>
        <h4 class="ivy-product-title"><a href="${detailHref}">${product.name}</a></h4>
        <div class="ivy-price-cart">
          <div class="ivy-price">
            <strong>${formatVnd(product.price)}</strong>
            ${oldPrice}
          </div>
          <button class="ivy-cart-btn" data-product-id="${productId}" aria-label="Add to bag"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg></button>
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
      <div class="container aura-nav-row">
        <button class="aura-menu-btn" data-menu-toggle aria-label="Toggle menu">Menu</button>
        <a class="aura-logo" href="${homeHref}" aria-label="Aurelia home">
          <img class="aura-logo-img" src="${logoSrc}" alt="Aurelia logo" />
        </a>
        <nav class="aura-nav-links" data-nav-links>
          <div class="aura-nav-item aura-dropdown">
            <a href="${womenHref}" data-nav-link>Nữ</a>
            <div class="aura-dropdown-menu" role="menu" aria-label="Nữ">
              <a class="aura-dropdown-item" href="${womenHref}&category=dresses" role="menuitem">Đầm & Váy</a>
              <a class="aura-dropdown-item" href="${womenHref}&category=tops" role="menuitem">Áo & Top</a>
              <a class="aura-dropdown-item" href="${womenHref}&category=bottoms" role="menuitem">Quần & Chân váy</a>
              <a class="aura-dropdown-item" href="${womenHref}&category=accessories" role="menuitem">Phụ kiện</a>
            </div>
          </div>
          <div class="aura-nav-item aura-dropdown">
            <a href="${menHref}" data-nav-link>Nam</a>
            <div class="aura-dropdown-menu" role="menu" aria-label="Nam">
              <a class="aura-dropdown-item" href="${menHref}&category=tops" role="menuitem">Áo</a>
              <a class="aura-dropdown-item" href="${menHref}&category=bottoms" role="menuitem">Quần</a>
              <a class="aura-dropdown-item" href="${menHref}&category=outerwear" role="menuitem">Áo khoác</a>
              <a class="aura-dropdown-item" href="${menHref}&category=accessories" role="menuitem">Phụ kiện</a>
            </div>
          </div>
          <a href="${storeHref}" data-nav-link>Cửa hàng</a>
          <a href="${aboutHref}" data-nav-link>Về chúng tôi</a>
        </nav>
        <div class="aura-nav-actions">
          <a class="aura-nav-icon" href="${profileHref}" aria-label="Profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </a>
          <a class="aura-nav-icon aura-cart" href="${cartHref}" aria-label="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span class="aura-cart-badge" id="cart-badge">0</span>
          </a>
        </div>
      </div>
      <div class="aura-announcement">
        <div class="container aura-announcement-shell">
          <div class="aura-announcement-track">
            <span>Miễn phí vận chuyển cho đơn hàng trên 2.000.000đ</span>
            <span>Bộ sưu tập mới mỗi thứ Sáu</span>
            <span>Thanh toán an toàn với hỗ trợ cao cấp</span>
            <span>Dễ dàng trả hàng trong 30 ngày cho tất cả các đơn hàng</span>
            <span>Ưu đãi độc quyền cho thành viên và ưu đãi hàng tuần</span>
            <span>Tư vấn tạo kiểu miễn phí cho khách hàng VIP</span>
          </div>
          <div class="aura-announcement-track" aria-hidden="true">
            <span>Miễn phí vận chuyển cho đơn hàng trên 2.000.000đ</span>
            <span>Bộ sưu tập mới mỗi thứ Sáu</span>
            <span>Thanh toán an toàn với hỗ trợ cao cấp</span>
            <span>Dễ dàng trả hàng trong 30 ngày cho tất cả các đơn hàng</span>
            <span>Ưu đãi độc quyền cho thành viên và ưu đãi hàng tuần</span>
            <span>Tư vấn tạo kiểu miễn phí cho khách hàng VIP</span>
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
        const { fetchCart } = await import('./api.js');
        const cart = await fetchCart();
        const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        badge.textContent = String(count);
        badge.style.display = count > 0 ? 'flex' : 'none';
    } catch (error) {
        badge.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', initBaseUI);
