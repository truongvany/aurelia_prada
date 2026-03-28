import { 
    fetchCart, 
    removeFromCart, 
    updateCartItemQuantity, 
    getUserInfo 
} from './api.js';
import { formatVnd, updateCartBadge } from './common.js';

async function initCartPage() {
    const user = getUserInfo();
    if (!user) {
        window.location.href = '../pages/login.html';
        return;
    }

    await renderCart();
}

async function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const emptyMsg = document.getElementById('emptyCartMessage');
    const countLabel = document.getElementById('cartCountLabel');
    
    if (!container) return;

    try {
        const cart = await fetchCart();
        const items = cart.items || [];

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

        items.forEach((item) => {
            const product = item.product;
            if (!product) return; // Case where product might be deleted

            const itemTotal = product.price * item.quantity;
            totalRaw += itemTotal;
            
            // UI Mock discounts based on price high (>1.5M for demo)
            const hasDiscount = product.originalPrice && product.originalPrice > product.price;
            const discountVal = hasDiscount ? (product.originalPrice - product.price) : 0;
            const discountPercent = hasDiscount ? Math.round((discountVal / product.originalPrice) * 100) : 0;

            html += `
                <div class="cart-item-row" data-id="${item._id}">
                    <div class="cart-item-media">
                        <img src="${product.image}" alt="${product.name}" class="cart-item-img" 
                             onerror="this.src='https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200'">
                        <div class="cart-item-info">
                            <h4>${product.name}</h4>
                            <p>Màu sắc: ${product.color || 'N/A'}  Size: ${item.size || 'Free'}</p>
                        </div>
                    </div>
                    <div class="cart-item-disc">
                        ${discountVal > 0 ? `-${formatVnd(discountVal)} <span class="percent">(-${discountPercent}%)</span>` : '0đ'}
                    </div>
                    <div class="cart-item-qty">
                        <button class="qty-btn minus" data-id="${item._id}" data-qty="${item.quantity}">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn plus" data-id="${item._id}" data-qty="${item.quantity}">+</button>
                    </div>
                    <div class="cart-item-total">
                        ${formatVnd(itemTotal)}
                        <button class="cart-btn-del" data-id="${item._id}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        updateSummary(items.length, totalRaw);
        setupListeners();
    } catch (error) {
        console.error('Lỗi khi tải giỏ hàng:', error);
        container.innerHTML = `<p class="text-danger">Không thể tải giỏ hàng. Vui lòng thử lại sau.</p>`;
    }
}

function updateSummary(count, total) {
    const sCount = document.getElementById('summaryCount');
    const sRaw = document.getElementById('summaryRawTotal');
    const sFinal = document.getElementById('summaryFinalTotal');
    const sSub = document.getElementById('summarySubtotal');

    if (sCount) sCount.textContent = count;
    // Estimated total price (before discounts) - using 20% flat markup for demo if originalPrice missing
    if (sRaw) sRaw.textContent = formatVnd(total * 1.25); 
    if (sFinal) sFinal.textContent = formatVnd(total);
    if (sSub) sSub.textContent = formatVnd(total);
}

function setupListeners() {
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.onclick = async () => {
            const itemId = btn.dataset.id;
            let currentQty = parseInt(btn.dataset.qty);
            const newQty = btn.classList.contains('plus') ? currentQty + 1 : currentQty - 1;

            if (newQty < 1) return;

            try {
                await updateCartItemQuantity(itemId, newQty);
                renderCart();
                updateCartBadge();
            } catch (err) {
                alert('Không thể cập nhật số lượng');
            }
        };
    });

    document.querySelectorAll('.cart-btn-del').forEach(btn => {
        btn.onclick = async () => {
            const itemId = btn.dataset.id;
            if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                try {
                    await removeFromCart(itemId);
                    renderCart();
                    updateCartBadge();
                } catch (err) {
                    alert('Không thể xóa sản phẩm');
                }
            }
        };
    });

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            alert('Cảm ơn bạn! Chức năng đặt hàng sẽ chuyển đến trang thanh toán.');
        };
    }
}

document.addEventListener('DOMContentLoaded', initCartPage);
