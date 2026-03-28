import { fetchCart, removeFromCart, createOrder, clearCart, getUserInfo } from './api.js';
import { formatVnd, updateCartBadge } from './common.js';

let cartGlobal = null;

function totals(cartItems) {
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 2000000 ? 0 : 30000;
  return { subtotal, tax, shipping, total: subtotal + tax + shipping };
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

  // Update Checkout Button state
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
      if (cartItems.length === 0) {
          checkoutBtn.classList.add('disabled');
          checkoutBtn.style.opacity = '0.5';
          checkoutBtn.style.pointerEvents = 'none';
      } else {
          checkoutBtn.classList.remove('disabled');
          checkoutBtn.style.opacity = '1';
          checkoutBtn.style.pointerEvents = 'auto';
      }
  }
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
            updateCartBadge();
        } catch (error) {
            alert('Failed to remove item');
            target.textContent = 'Remove';
            target.disabled = false;
        }
    }
  });

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
      checkoutBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          if (cartGlobal.items.length === 0) return;

          const user = getUserInfo();
          if (!user) {
              alert('Please login to checkout.');
              return;
          }

          const calc = totals(cartGlobal.items);
          const orderData = {
              orderItems: cartGlobal.items.map(item => ({
                  name: item.product.name,
                  qty: item.quantity,
                  image: item.product.image,
                  price: item.product.price,
                  product: item.product._id
              })),
              shippingAddress: user.address || {
                  street: '123 Default St',
                  city: 'HCM',
                  state: 'SG',
                  zipCode: '70000',
                  country: 'VN'
              },
              itemsPrice: calc.subtotal,
              taxPrice: calc.tax,
              shippingPrice: calc.shipping,
              totalPrice: calc.total
          };

          checkoutBtn.textContent = 'Processing...';
          checkoutBtn.style.pointerEvents = 'none';

          try {
              await createOrder(orderData);
              await clearCart();
              updateCartBadge();
              alert('Order placed successfully!');
              window.location.href = 'profile.html';
          } catch (error) {
              alert('Failed to place order: ' + error.message);
              checkoutBtn.textContent = 'Thanh Toán';
              checkoutBtn.style.pointerEvents = 'auto';
          }
      });
  }
}

document.addEventListener('DOMContentLoaded', initCart);
