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

export async function fetchProductById(id) {
  const res = await fetch(`${API_URL}/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
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

export async function registerUser(name, email, password, phone, address) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone, address }),
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
