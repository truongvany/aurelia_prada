# Aurelia Static Frontend

Frontend da duoc chuyen sang mo hinh multi-page su dung HTML/CSS/JavaScript thuan.
Khong su dung React va khong su dung Bootstrap.

## Cau truc

- `index.html`
- `pages/shop.html`, `pages/product-detail.html`, `pages/cart.html`, `pages/login.html`, `pages/register.html`, `pages/profile.html`
- `pages/admin/dashboard.html`, `pages/admin/products.html`, `pages/admin/orders.html`, `pages/admin/customers.html`, `pages/admin/settings.html`
- `assets/css/styles.css`
- `assets/js/*.js`

## Chay local

Yeu cau: Node.js

1. Cai dependencies:
   `npm install`
2. Chay dev server:
   `npm run dev`
3. Build production:
   `npm run build`
4. Preview ban build:
   `npm run preview`

## Ghi chu

- Du lieu hien tai la mock data hardcode trong `assets/js/data.js`.
- Cac chuc nang tuong tac duoc thuc hien bang JavaScript thuan (filter shop, product options, cart quantity, auth form validation, profile tabs, admin tables/chart).
