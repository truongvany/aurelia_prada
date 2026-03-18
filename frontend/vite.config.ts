import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: 'index.html',
        shop: 'pages/shop.html',
        productDetail: 'pages/product-detail.html',
        cart: 'pages/cart.html',
        login: 'pages/login.html',
        register: 'pages/register.html',
        about: 'pages/about.html',
        profile: 'pages/profile.html',
        contact: 'pages/contact.html',
        adminDashboard: 'pages/admin/dashboard.html',
        adminProducts: 'pages/admin/products.html',
        adminOrders: 'pages/admin/orders.html',
        adminCustomers: 'pages/admin/customers.html',
        adminSettings: 'pages/admin/settings.html'
      }
    }
  },
  server: {
    hmr: true
  }
});
