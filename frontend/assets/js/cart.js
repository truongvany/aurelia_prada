import { products, cartSeed } from './data.js';
import { formatVnd } from './common.js';

function hydrateCart() {
  const map = new Map(products.map((p) => [p.id, p]));
  return cartSeed.map((entry) => ({ ...entry, product: map.get(entry.id) })).filter((i) => i.product);
}

function totals(cart) {
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  return { subtotal, tax, total: subtotal + tax };
}

function render(cart) {
  const list = document.getElementById('cart-list');
  if (!list) return;

  list.innerHTML = cart.map((item, idx) => `
    <div class="cart-row" data-index="${idx}">
      <img src="${item.product.image}" alt="${item.product.name}" style="border-radius: 12px; width: 100%; height: 110px; object-fit: cover;">
      <div>
        <h4 style="margin:0 0 6px;font-family:Manrope,sans-serif;">${item.product.name}</h4>
        <p style="margin:0 0 10px;">Size: ${item.size}</p>
        <div class="qty">
          <button data-action="minus">-</button><span>${item.quantity}</span><button data-action="plus">+</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;justify-content:space-between;align-items:flex-end;">
        <strong>${formatVnd(item.product.price * item.quantity)}</strong>
        <button class="btn btn-outline" data-action="remove" style="padding:6px 12px;font-size:12px;">Remove</button>
      </div>
    </div>
  `).join('');

  const calc = totals(cart);
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');
  if (subtotalEl) subtotalEl.textContent = formatVnd(calc.subtotal);
  if (taxEl) taxEl.textContent = formatVnd(calc.tax);
  if (totalEl) totalEl.textContent = formatVnd(calc.total);
}

function initCart() {
  if (!document.getElementById('cart-list')) return;
  const cart = hydrateCart();
  render(cart);

  document.getElementById('cart-list').addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.getAttribute('data-action');
    const row = target.closest('[data-index]');
    if (!action || !row) return;

    const index = Number(row.getAttribute('data-index'));
    if (Number.isNaN(index) || !cart[index]) return;

    if (action === 'plus') cart[index].quantity += 1;
    if (action === 'minus') cart[index].quantity = Math.max(1, cart[index].quantity - 1);
    if (action === 'remove') cart.splice(index, 1);
    render(cart);
  });
}

document.addEventListener('DOMContentLoaded', initCart);
