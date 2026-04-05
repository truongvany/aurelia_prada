// Lớp API hỗ trợ giao tiếp với backend
export const API_URL = '/api';

function getApiOrigin() {
  if (typeof window === 'undefined') return '';

  if (/^https?:\/\//i.test(API_URL)) {
    try {
      return new URL(API_URL).origin;
    } catch {
      return window.location.origin;
    }
  }

  // Vite dev server usually runs on :3000 while backend serves uploads on :5000.
  if (window.location.port === '3000') {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }

  return window.location.origin;
}

function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  const origin = getApiOrigin();
  if (!origin) return url;

  if (url.startsWith('/')) {
    return `${origin}${url}`;
  }
  return `${origin}/${url}`;
}

function normalizeProductMedia(product) {
  if (!product || typeof product !== 'object') return product;

  const normalized = { ...product };
  normalized.image = resolveMediaUrl(normalized.image);

  if (Array.isArray(normalized.images)) {
    normalized.images = normalized.images.map((img) => resolveMediaUrl(img));
  }

  if (Array.isArray(normalized.variants)) {
    normalized.variants = normalized.variants.map((variant) => ({
      ...variant,
      images: Array.isArray(variant.images)
        ? variant.images.map((img) => resolveMediaUrl(img))
        : variant.images,
    }));
  }

  if (normalized.sizeGuideImage) {
    normalized.sizeGuideImage = resolveMediaUrl(normalized.sizeGuideImage);
  }

  return normalized;
}

function normalizeCartMedia(cart) {
  if (!cart || !Array.isArray(cart.items)) return cart;

  return {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      product: normalizeProductMedia(item.product),
    })),
  };
}

function normalizeOrderMedia(order) {
  if (!order || typeof order !== 'object') return order;

  const normalized = {
    ...order,
    orderItems: Array.isArray(order.orderItems)
      ? order.orderItems.map((item) => ({
      ...item,
      image: resolveMediaUrl(item.image),
      }))
      : order.orderItems,
  };

  if (normalized.paymentResult && typeof normalized.paymentResult === 'object') {
    normalized.paymentResult = {
      ...normalized.paymentResult,
      proofImageUrl: resolveMediaUrl(normalized.paymentResult.proofImageUrl),
    };
  }

  return normalized;
}

function normalizeTryOnJobMedia(job) {
  if (!job || typeof job !== 'object') return job;

  return {
    ...job,
    garmentImageUrl: resolveMediaUrl(job.garmentImageUrl),
    modelImageUrl: resolveMediaUrl(job.modelImageUrl),
    resultImageUrl: resolveMediaUrl(job.resultImageUrl),
  };
}

function parseUserInfo() {
  const userInfoStr = localStorage.getItem('userInfo');
  if (!userInfoStr) return null;

  try {
    return JSON.parse(userInfoStr);
  } catch {
    localStorage.removeItem('userInfo');
    return null;
  }
}

function redirectToLoginWithReturnUrl() {
  const redirectTo = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/pages/login.html?redirect=${encodeURIComponent(redirectTo)}`;
}

async function buildApiError(res, fallbackMessage) {
  let message = fallbackMessage;
  try {
    const data = await res.json();
    message = data?.message || data?.error || fallbackMessage;
  } catch {
    // Keep fallback message when response body is empty or invalid JSON.
  }

  const err = new Error(message);
  err.status = res.status;
  return err;
}

function getAuthHeaders() {
  const userInfo = parseUserInfo();
  let headers = {
    'Content-Type': 'application/json',
  };

  if (userInfo?.token) {
    headers['Authorization'] = `Bearer ${userInfo.token}`;
  }

  return headers;
}

function getAuthHeadersWithoutContentType() {
  const userInfo = parseUserInfo();
  const headers = {};

  if (userInfo?.token) {
    headers['Authorization'] = `Bearer ${userInfo.token}`;
  }

  return headers;
}

export async function ensureAdminSession() {
  const userInfo = parseUserInfo();

  if (!userInfo?.token || userInfo.role !== 'admin') {
    localStorage.removeItem('userInfo');
    redirectToLoginWithReturnUrl();
    return false;
  }

  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: getAuthHeaders(),
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('userInfo');
    redirectToLoginWithReturnUrl();
    return false;
  }

  if (!res.ok) {
    throw await buildApiError(res, 'Không thể xác thực phiên đăng nhập.');
  }

  const profile = await res.json();
  if (profile?.role !== 'admin') {
    localStorage.removeItem('userInfo');
    redirectToLoginWithReturnUrl();
    return false;
  }

  return true;
}

export async function fetchProducts() {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const products = await res.json();
  return Array.isArray(products)
    ? products.map((product) => normalizeProductMedia(product))
    : [];
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_URL}/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  const product = await res.json();
  return normalizeProductMedia(product);
}

/**
 * Send user image and product to AI backend
 * @param {string} productId 
 * @param {string} userImageBase64 
 */
export async function generateVirtualTryOn(productId, userImageBase64) {
  const res = await fetch(`${API_URL}/tryon/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      productId, 
      userImage: userImageBase64 
    }),
  });

  if (!res.ok) {
    const errObj = await res.json().catch(() => ({}));
    throw new Error(errObj.message || 'Lỗi server khi render ảnh.');
  }

  return res.json();
}

export async function getVoucherByCode(code) {
  const res = await fetch(`${API_URL}/vouchers/code/${code}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to fetch voucher');
  }
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Login failed');
  }
  const data = await res.json();
  localStorage.setItem('userInfo', JSON.stringify(data));
  return data;
}

export async function registerUser(name, email, password, phone, address, dob, gender) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone, address, dob, gender }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  const data = await res.json();
  localStorage.setItem('userInfo', JSON.stringify(data));
  return data;
}

export function logoutUser() {
  localStorage.removeItem('userInfo');
  window.location.href = '/pages/login.html';
}

export function getUserInfo() {
  return parseUserInfo();
}

// AI Try-on
export async function createTryOnJob({ garmentImage, modelImage, productId = '' }) {
  const formData = new FormData();
  formData.append('garmentImage', garmentImage);
  formData.append('modelImage', modelImage);
  if (productId) formData.append('productId', productId);

  const res = await fetch(`${API_URL}/tryon/jobs`, {
    method: 'POST',
    headers: getAuthHeadersWithoutContentType(),
    body: formData,
  });

  if (!res.ok) throw await buildApiError(res, 'Failed to create try-on job');

  const data = await res.json();
  return {
    ...data,
    job: normalizeTryOnJobMedia(data.job),
  };
}

export async function fetchTryOnJob(jobId) {
  const res = await fetch(`${API_URL}/tryon/jobs/${jobId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw await buildApiError(res, 'Failed to fetch try-on job');

  const data = await res.json();
  return {
    ...data,
    job: normalizeTryOnJobMedia(data.job),
  };
}

export async function fetchMyTryOnJobs(limit = 10) {
  const res = await fetch(`${API_URL}/tryon/jobs/my?limit=${encodeURIComponent(limit)}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw await buildApiError(res, 'Failed to fetch try-on jobs');

  const data = await res.json();
  return {
    ...data,
    jobs: Array.isArray(data.jobs) ? data.jobs.map((job) => normalizeTryOnJobMedia(job)) : [],
  };
}

// Giỏ hàng (Cart)
export async function fetchCart() {
  const res = await fetch(`${API_URL}/cart`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load cart');
  const cart = await res.json();
  return normalizeCartMedia(cart);
}

export async function addToCart(productId, quantity, size, color = '', colorCode = '') {
  const res = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, quantity, size, color, colorCode }),
  });
  if (!res.ok) throw await buildApiError(res, 'Failed to add to cart');
  const cart = await res.json();
  return normalizeCartMedia(cart);
}

export async function removeFromCart(itemId) {
  const res = await fetch(`${API_URL}/cart/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to remove from cart');
  const cart = await res.json();
  return normalizeCartMedia(cart);
}

export async function clearCart() {
  const res = await fetch(`${API_URL}/cart`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to clear cart');
  return res.json();
}

export async function updateCartItemQuantity(itemId, quantity) {
  const res = await fetch(`${API_URL}/cart/${itemId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw await buildApiError(res, 'Failed to update cart item quantity');
  const cart = await res.json();
  return normalizeCartMedia(cart);
}

// User Profile
export async function getUserProfile() {
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: getAuthHeaders(),
  });
  
  if (res.status === 401) {
    localStorage.removeItem('userInfo');
    throw new Error('Unauthorized');
  }
  
  if (!res.ok) throw new Error('Failed to load profile');
  const data = await res.json();
  return data;
}

export async function updateUserProfile(userData) {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

// Orders
export async function createOrder(orderData) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Server error ${res.status}`);
  }
  return res.json();
}

export async function updateOrderToDelivered(id) {
  const res = await fetch(`${API_URL}/orders/${id}/deliver`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to update order to delivered');
  return res.json();
}

export async function updateOrderStatus(id, status) {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export async function updateOrderToPaid(id, paymentPayload = {}) {
  const res = await fetch(`${API_URL}/orders/${id}/pay`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(paymentPayload),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'Failed to update order to paid');
  }
  const order = await res.json();
  return normalizeOrderMedia(order);
}

export async function uploadOrderPaymentProof(id, imageFile) {
  if (!imageFile) {
    throw new Error('Vui lòng chọn ảnh chứng minh thanh toán');
  }

  const formData = new FormData();
  formData.append('paymentProof', imageFile);

  const res = await fetch(`${API_URL}/orders/${id}/payment-proof`, {
    method: 'PUT',
    headers: getAuthHeadersWithoutContentType(),
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'Không thể upload ảnh thanh toán');
  }

  const order = await res.json();
  return normalizeOrderMedia(order);
}

export async function confirmOrderCod(id) {
  const res = await fetch(`${API_URL}/orders/${id}/confirm-cod`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'Failed to confirm COD order');
  }
  const order = await res.json();
  return normalizeOrderMedia(order);
}

export async function getOrderById(id) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch order');
  const order = await res.json();
  return normalizeOrderMedia(order);
}


export async function getMyOrders() {
  const res = await fetch(`${API_URL}/orders/myorders`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load orders');
  const orders = await res.json();
  return Array.isArray(orders)
    ? orders.map((order) => normalizeOrderMedia(order))
    : [];
}

// Admin APIs
export async function fetchAllOrders() {
  const res = await fetch(`${API_URL}/orders`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load orders');
  const orders = await res.json();
  return Array.isArray(orders)
    ? orders.map((order) => normalizeOrderMedia(order))
    : [];
}

export async function fetchAllUsers() {
  const res = await fetch(`${API_URL}/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_URL}/dashboard/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load dashboard stats');
  const data = await res.json();

  if (!data || !Array.isArray(data.recentSales)) {
    return data;
  }

  return {
    ...data,
    recentSales: data.recentSales.map((sale) => ({
      ...sale,
      orderItems: Array.isArray(sale.orderItems)
        ? sale.orderItems.map((item) => ({
            ...item,
            image: resolveMediaUrl(item.image),
          }))
        : sale.orderItems,
    })),
  };
}

export async function fetchAdminSettings() {
  const res = await fetch(`${API_URL}/settings/admin`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateAdminSettings(settingsData) {
  const res = await fetch(`${API_URL}/settings/admin`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settingsData),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'Failed to update settings');
  }
  return res.json();
}

export async function fetchPublicPaymentSettings() {
  const res = await fetch(`${API_URL}/settings/payment`);
  if (!res.ok) throw new Error('Failed to load payment settings');
  return res.json();
}

// Product CRUD
export async function createProduct(productData) {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw await buildApiError(res, 'Failed to create product');
  return res.json();
}

export async function updateProduct(id, productData) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw await buildApiError(res, 'Failed to update product');
  return res.json();
}

export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_URL}/products/upload`, {
    method: 'POST',
    headers: getAuthHeadersWithoutContentType(),
    body: formData,
  });

  if (!res.ok) throw await buildApiError(res, 'Failed to upload image');
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function toggleWishlist(productId) {
  const res = await fetch(`${API_URL}/auth/wishlist`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error('Failed to update wishlist');
  return res.json();
}

export async function trackViewedProduct(productId) {
  const res = await fetch(`${API_URL}/auth/viewed`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error('Failed to track viewed product');
  return res.json();
}

// Voucher CRUD
export async function fetchAllVouchers() {
  const res = await fetch(`${API_URL}/vouchers`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load vouchers');
  return res.json();
}

export async function createVoucher(voucherData) {
  const res = await fetch(`${API_URL}/vouchers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(voucherData),
  });
  if (!res.ok) throw new Error('Failed to create voucher');
  return res.json();
}

export async function updateVoucher(id, voucherData) {
  const res = await fetch(`${API_URL}/vouchers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(voucherData),
  });
  if (!res.ok) throw new Error('Failed to update voucher');
  return res.json();
}

export async function deleteVoucher(id) {
  const res = await fetch(`${API_URL}/vouchers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete voucher');
  return res.json();
}

export async function fetchRewardVouchers() {
  const res = await fetch(`${API_URL}/vouchers/rewards`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
     const errorData = await res.json();
     throw new Error(errorData.message || 'Failed to fetch rewards');
  }
  return res.json();
}

export async function redeemVoucher(voucherId) {
  const res = await fetch(`${API_URL}/vouchers/redeem`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ voucherId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Redemption failed');
  }
  return res.json();
}

// Promotions CRUD
export async function fetchAllPromotions() {
  const res = await fetch(`${API_URL}/promotions`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load promotions');
  return res.json();
}

export async function fetchActivePromotions() {
  const res = await fetch(`${API_URL}/promotions/active`);
  if (!res.ok) throw new Error('Failed to load active promotions');
  return res.json();
}

export async function createPromotion(promoData) {
  const res = await fetch(`${API_URL}/promotions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(promoData),
  });
  if (!res.ok) throw new Error('Failed to create promotion');
  return res.json();
}

export async function updatePromotion(id, promoData) {
  const res = await fetch(`${API_URL}/promotions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(promoData),
  });
  if (!res.ok) throw new Error('Failed to update promotion');
  return res.json();
}

export async function deletePromotion(id) {
  const res = await fetch(`${API_URL}/promotions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete promotion');
  return res.json();
}
