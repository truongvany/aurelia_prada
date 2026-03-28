import { 
  fetchProducts, 
  createProduct,
  updateProduct,
  fetchCategories
} from './api.js';
import { renderAdminLayout } from './admin-layout.js';

let variantCount = 0;

function updateTabs() {
    const tabsContainer = document.getElementById('variant-tabs');
    const cards = document.querySelectorAll('.variant-card');
    
    tabsContainer.innerHTML = Array.from(cards).map((card, i) => {
        const colorName = card.querySelector('.variant-color-name').value || `Màu ${i + 1}`;
        const isActive = card.style.display !== 'none';
        return `
            <button type="button" class="tab-btn variant-tab ${isActive ? 'active' : ''}" 
                    data-index="${i}" 
                    style="padding: 10px 20px; border-radius: 6px; border: 1px solid #ddd; background: ${isActive ? '#2D3748' : '#fff'}; color: ${isActive ? '#fff' : '#444'}; font-size: 11px; font-weight: 800; cursor: pointer; transition: all 0.2s;">
                ${colorName.toUpperCase()}
            </button>
        `;
    }).join('');

    tabsContainer.querySelectorAll('.variant-tab').forEach(btn => {
        btn.onclick = () => {
            const index = parseInt(btn.getAttribute('data-index'));
            showVariant(index);
        };
    });
}

function showVariant(index) {
    const cards = document.querySelectorAll('.variant-card');
    cards.forEach((card, i) => {
        card.style.display = i === index ? 'block' : 'none';
    });
    updateTabs();
}

function createVariantCard(data = { color: '', colorCode: '#000000', stock: 10, images: [''], sizes: ['S', 'M', 'L'] }) {
    const card = document.createElement('div');
    card.className = 'variant-card';
    card.style.cssText = 'background: #fff; border: 1px solid #ddd; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.04);';
    
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
            <span style="font-weight: 800; font-size: 12px; color: #888; text-transform: uppercase;">Chi tiết Biến thể</span>
            <button type="button" class="btn-remove-variant" style="background: none; border: none; color: #C53030; font-weight: 800; cursor: pointer; font-size: 11px;">LOẠI BỎ MÀU NÀY</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 4fr 1fr; gap: 20px; align-items: flex-end; margin-bottom: 20px;">
            <div class="admin-input-group" style="margin-bottom: 0;">
                <label class="admin-label">Tên màu hiển thị</label>
                <input class="admin-input variant-color-name" value="${data.color}" placeholder="Xanh, Be,.." required />
            </div>
            <div class="admin-input-group" style="margin-bottom: 0; display: flex; flex-direction: column; align-items: center;">
                <label class="admin-label">Mã màu</label>
                <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; border: 2px solid #eee; display: flex; align-items: center; justify-content: center; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <input type="color" class="variant-color-code" value="${data.colorCode}" style="width: 150%; height: 150%; cursor: pointer; border: none; padding: 0; background: none;" />
                </div>
            </div>
        </div>

        <div class="admin-input-group">
            <label class="admin-label">Kích cỡ có sẵn (Tick để chọn)</label>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;" class="variant-sizes">
                ${['S', 'M', 'L', 'XL', 'XXL'].map(s => `
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; background: #f8f9fa; padding: 8px 12px; border-radius: 6px; border: 1px solid #eee;">
                        <input type="checkbox" value="${s}" ${data.sizes.includes(s) ? 'checked' : ''}> <strong>${s}</strong>
                    </label>
                `).join('')}
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 20px;">
            <div class="admin-input-group">
                <label class="admin-label">Số lượng tồn kho cho riêng màu này</label>
                <input type="number" class="admin-input variant-stock" value="${data.stock}" required />
            </div>
        </div>

        <div class="admin-input-group" style="margin-top: 25px;">
            <label class="admin-label">Link ảnh Sản phẩm (Theo màu này)</label>
            <div class="variant-images-container">
                ${data.images.map(url => `
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <input class="admin-input variant-image-url" value="${url}" placeholder="https://..." required />
                        <button type="button" class="btn-remove-img" style="border:none; background:#f0f0f0; padding:0 15px; border-radius:6px; cursor:pointer;">×</button>
                    </div>
                `).join('')}
            </div>
            <button type="button" class="btn-add-variant-img" style="background:none; border: 1px dashed #bbb; width:100%; padding: 12px; font-size: 11px; font-weight:700; cursor:pointer; margin-top:10px; border-radius: 8px;">+ THÊM LINK ẢNH KHÁC</button>
        </div>
    `;

    // Internal Events
    card.querySelector('.variant-color-name').oninput = updateTabs;
    
    card.querySelector('.btn-remove-variant').onclick = () => {
        if (confirm('Xóa biến thể này?')) {
            card.remove();
            showVariant(0);
        }
    };

    card.querySelector('.btn-add-variant-img').onclick = () => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px;';
        div.innerHTML = `
            <input class="admin-input variant-image-url" placeholder="https://..." required />
            <button type="button" class="btn-remove-img" style="border:none; background:#f0f0f0; padding:0 15px; border-radius:6px; cursor:pointer;">×</button>
        `;
        div.querySelector('.btn-remove-img').onclick = () => div.remove();
        card.querySelector('.variant-images-container').appendChild(div);
    };

    card.querySelectorAll('.btn-remove-img').forEach(btn => {
        btn.onclick = () => btn.parentNode.remove();
    });

    return card;
}

async function initProductForm() {
    const form = document.getElementById('product-page-form');
    const container = document.getElementById('variants-container');
    const addVariantBtn = document.getElementById('add-variant-btn');
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // 1. Categories
    const categorySelect = document.getElementById('prod-category');
    try {
        const cats = await fetchCategories();
        categorySelect.innerHTML = cats.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
    } catch (err) { console.error(err); }

    // 2. Add Variant
    addVariantBtn.onclick = () => {
        const card = createVariantCard();
        container.appendChild(card);
        showVariant(document.querySelectorAll('.variant-card').length - 1);
    };

    // 3. Edit Mode
    if (productId) {
        document.getElementById('page-title').textContent = 'Chỉnh sửa Sản phẩm';
        document.getElementById('btn-submit-top').textContent = 'CẬP NHẬT SẢN PHẨM';
        try {
            const products = await fetchProducts();
            const product = products.find(p => p._id === productId);
            if (product) {
                document.getElementById('edit-product-id').value = product._id;
                document.getElementById('prod-name').value = product.name;
                document.getElementById('prod-desc').value = product.description || '';
                document.getElementById('prod-price').value = product.price;
                document.getElementById('prod-original-price').value = product.originalPrice || '';
                document.getElementById('prod-category').value = product.category?._id || product.category || '';
                document.getElementById('prod-stock').value = product.stock;
                document.getElementById('prod-material').value = product.material || '';
                document.getElementById('prod-badge').value = product.badge || '';
                document.getElementById('prod-size-guide').value = product.sizeGuideImage || '';

                if (product.variants && product.variants.length > 0) {
                    product.variants.forEach(v => container.appendChild(createVariantCard(v)));
                } else {
                    container.appendChild(createVariantCard({ 
                        color: product.color || 'Mặc định', 
                        colorCode: '#000000', 
                        stock: product.stock, 
                        images: product.images || [product.image],
                        sizes: ['S', 'M', 'L']
                    }));
                }
                showVariant(0);
            }
        } catch (err) { console.error(err); }
    } else {
        container.appendChild(createVariantCard());
        showVariant(0);
    }

    // 4. Submit
    form.onsubmit = async (e) => {
        e.preventDefault();
        const cards = document.querySelectorAll('.variant-card');
        const productVariants = Array.from(cards).map(card => {
            return {
                color: card.querySelector('.variant-color-name').value,
                colorCode: card.querySelector('.variant-color-code').value,
                stock: Number(card.querySelector('.variant-stock').value),
                images: Array.from(card.querySelectorAll('.variant-image-url')).map(i => i.value).filter(Boolean),
                sizes: Array.from(card.querySelectorAll('.variant-sizes input:checked')).map(i => i.value)
            };
        });

        const totalStock = productVariants.reduce((sum, v) => sum + v.stock, 0);
        const allImages = productVariants.flatMap(v => v.images);

        const data = {
            name: document.getElementById('prod-name').value,
            description: document.getElementById('prod-desc').value,
            price: Number(document.getElementById('prod-price').value),
            originalPrice: Number(document.getElementById('prod-original-price').value) || undefined,
            category: document.getElementById('prod-category').value,
            stock: totalStock,
            variants: productVariants,
            images: allImages,
            image: allImages[0] || '',
            material: document.getElementById('prod-material').value,
            badge: document.getElementById('prod-badge').value,
            sizeGuideImage: document.getElementById('prod-size-guide').value,
        };

        try {
            if (productId) {
                await updateProduct(productId, data);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await createProduct(data);
                alert('Thêm sản phẩm thành công!');
            }
            window.location.href = 'products.html';
        } catch (err) {
            alert(err.message);
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    renderAdminLayout();
    initProductForm();
});
