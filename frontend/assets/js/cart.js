import { formatVnd } from './common.js';

function getCartItems() {
    return JSON.parse(localStorage.getItem('cartItems')) || [];
}

function saveCartItems(items) {
    localStorage.setItem('cartItems', JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
}

function renderCart() {
    const items = getCartItems();
    const container = document.getElementById('cartItemsContainer');
    const emptyMsg = document.getElementById('emptyCartMessage');
    const countLabel = document.getElementById('cartCountLabel');
    
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = '';
        emptyMsg.style.display = 'block';
        countLabel.textContent = '0 Sản Phẩm';
        updateSummary(0, 0);
        return;
    }

    emptyMsg.style.display = 'none';
    countLabel.innerHTML = `<span class="text-danger">${items.length} Sản Phẩm</span>`;

    let html = '';
    let totalRaw = 0;

    items.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        totalRaw += itemTotal;
        
        // Mock discount for UI demo as in screenshot
        const discountVal = 540000;
        const discountPercent = 68.35;

        html += `
            <div class="cart-item-row" data-index="${index}">
                <div class="cart-item-media">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>Màu sắc: Trắng  Size: M</p>
                    </div>
                </div>
                <div class="cart-item-disc">
                    -${formatVnd(discountVal)}
                    <span class="percent">(-${discountPercent}%)</span>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn minus" data-index="${index}">-</button>
                    <span class="qty-val">${item.qty}</span>
                    <button class="qty-btn plus" data-index="${index}">+</button>
                </div>
                <div class="cart-item-total">
                    ${formatVnd(itemTotal)}
                    <button class="cart-btn-del" data-index="${index}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    updateSummary(items.length, totalRaw);
    setupListeners();
}

function updateSummary(count, total) {
    const sCount = document.getElementById('summaryCount');
    const sRaw = document.getElementById('summaryRawTotal');
    const sFinal = document.getElementById('summaryFinalTotal');
    const sSub = document.getElementById('summarySubtotal');

    if (sCount) sCount.textContent = count;
    if (sRaw) sRaw.textContent = formatVnd(total + (count > 0 ? 540000 : 0)); // Hack to match "790.000" vs "250.000" logic in img
    if (sFinal) sFinal.textContent = formatVnd(total);
    if (sSub) sSub.textContent = formatVnd(total);
}

function setupListeners() {
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = btn.dataset.index;
            const items = getCartItems();
            if (btn.classList.contains('plus')) {
                items[index].qty++;
            } else {
                if (items[index].qty > 1) items[index].qty--;
            }
            saveCartItems(items);
            renderCart();
        });
    });

    document.querySelectorAll('.cart-btn-del').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = btn.dataset.index;
            const items = getCartItems();
            items.splice(index, 1);
            saveCartItems(items);
            renderCart();
        });
    });

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            alert('Chức năng đặt hàng đang được xử lý...');
        });
    }
}

document.addEventListener('DOMContentLoaded', renderCart);
