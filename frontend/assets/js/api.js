// Lớp API hỗ trợ giao tiếp với backend
export const API_URL = '/api';

function getAuthHeaders() {
  const userInfoStr = localStorage.getItem('userInfo');
  let headers = {
    'Content-Type': 'application/json',
  };
  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr);
    if (userInfo.token) {
      headers['Authorization'] = `Bearer ${userInfo.token}`;
    }
  }
  return headers;
}

export async function fetchProducts() {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_URL}/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
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
  const str = localStorage.getItem('userInfo');
  return str ? JSON.parse(str) : null;
}

// Giỏ hàng (Cart)
export async function fetchCart() {
  const res = await fetch(`${API_URL}/cart`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load cart');
  return res.json();
}

export async function addToCart(productId, quantity, size) {
  const res = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, quantity, size }),
  });
  if (!res.ok) throw new Error('Failed to add to cart');
  return res.json();
}

export async function removeFromCart(itemId) {
  const res = await fetch(`${API_URL}/cart/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to remove from cart');
  return res.json();
}

export async function clearCart() {
  const res = await fetch(`${API_URL}/cart`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to clear cart');
  return res.json();
}

// User Profile
export async function getUserProfile() {
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: getAuthHeaders(),
  });
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
  if (!res.ok) throw new Error('Failed to create order');
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

export async function getOrderById(id) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}


export async function getMyOrders() {
  const res = await fetch(`${API_URL}/orders/myorders`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
}

// Admin APIs
export async function fetchAllOrders() {
  const res = await fetch(`${API_URL}/orders`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
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
  return res.json();
}

// Product CRUD
export async function createProduct(productData) {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
}

export async function updateProduct(id, productData) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error('Failed to update product');
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
