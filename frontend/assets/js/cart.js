import { fetchCart, removeFromCart } from './api.js';
import { formatVnd } from './common.js';

let cartGlobal = null;

function totals(cartItems) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  return { subtotal, tax, total: subtotal + tax };
}

function render(cartItems) {
  const list = document.getElementById('cart-list');
  if (!list) return;

  if (cartItems.length === 0) {
      list.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    list.innerHTML = cartItems.map((item, idx) => `
        <div class="cart-row" data-index="${idx}" data-item-id="${item._id}">
        <img src="${item.product?.image || ''}" alt="${item.product?.name || 'Invalid'}" style="border-radius: 12px; width: 100%; height: 110px; object-fit: cover;">
        <div>
            <h4 style="margin:0 0 6px;font-family:Manrope,sans-serif;">${item.product?.name || 'Product Not Found'}</h4>
            <p style="margin:0 0 10px;">Size: ${item.size || 'Default'}</p>
            <div class="qty">
            <button data-action="minus" disabled>-</button><span>${item.quantity}</span><button data-action="plus" disabled>+</button>
            </div>
        </div>
        <div style="display:flex;flex-direction:column;justify-content:space-between;align-items:flex-end;">
            <strong>${formatVnd((item.product?.price || 0) * item.quantity)}</strong>
            <button class="btn btn-outline" data-action="remove" style="padding:6px 12px;font-size:12px;">Remove</button>
        </div>
        </div>
    `).join('');
  }

  const calc = totals(cartItems);
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');
  if (subtotalEl) subtotalEl.textContent = formatVnd(calc.subtotal);
  if (taxEl) taxEl.textContent = formatVnd(calc.tax);
  if (totalEl) totalEl.textContent = formatVnd(calc.total);
}

async function initCart() {
  const list = document.getElementById('cart-list');
  if (!list) return;

  list.innerHTML = '<p>Loading your cart...</p>';

  try {
    cartGlobal = await fetchCart();
    render(cartGlobal.items);
  } catch (err) {
    list.innerHTML = `<p>Please <a href="login.html">login</a> to view your cart.</p>`;
    return;
  }

  list.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.getAttribute('data-action');
    const row = target.closest('[data-index]');
    if (!action || !row) return;

    if (action === 'remove') {
        const itemId = row.getAttribute('data-item-id');
        target.textContent = 'Removing...';
        target.disabled = true;
        try {
            cartGlobal = await removeFromCart(itemId);
            render(cartGlobal.items);
        } catch (error) {
            alert('Failed to remove item');
            target.textContent = 'Remove';
            target.disabled = false;
        }
    }
  });
}

document.addEventListener('DOMContentLoaded', initCart);
