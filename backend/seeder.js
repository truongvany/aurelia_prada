const dotenv = require('dotenv');

const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Voucher = require('./models/Voucher');

const connectDB = require('./config/db');

dotenv.config();
connectDB();

function pick(list, index) {
    return list[index % list.length];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sampleUnique(list, count) {
    const cloned = [...list];
    const result = [];
    const take = Math.min(count, cloned.length);

    for (let i = 0; i < take; i++) {
        const idx = randomInt(0, cloned.length - 1);
        result.push(cloned[idx]);
        cloned.splice(idx, 1);
    }

    return result;
}

function randomDateWithinDays(daysBack) {
    const now = Date.now();
    const offset = randomInt(0, daysBack) * 24 * 60 * 60 * 1000;
    return new Date(now - offset);
}

function getStatusByStock(stock) {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= 20) return 'Low Stock';
    return 'Active';
}

const seedData = async () => {
    try {
        await Cart.deleteMany();
        await Order.deleteMany();
        await Product.deleteMany();
        await Category.deleteMany();
        await Voucher.deleteMany();
        await User.deleteMany();

        console.log('🗑️  Data cleared.');

        const cities = ['Hà Nội', 'TP Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
        const districts = ['Ba Đình', 'Cầu Giấy', 'Quận 1', 'Thủ Đức', 'Sơn Trà', 'Ninh Kiều'];
        const userNames = [
            'Nguyễn Minh Anh',
            'Trần Thu Trang',
            'Lê Hoàng Nam',
            'Phạm Quỳnh Chi',
            'Đỗ Khánh Linh',
            'Vũ Tuấn Kiệt',
            'Bùi Phương Thảo',
            'Mai Gia Huy',
            'Phan Ngọc Lan',
            'Đặng Đức Anh',
            'Lý Bảo Trân',
            'Ngô Thành Đạt',
            'Tạ Mỹ Linh',
            'Trịnh Hải Yến',
            'Hoàng Quốc Bảo',
            'Dương Gia Hân',
            'Nguyễn Đức Trí',
            'Lâm Tuệ Nhi'
        ];

        const usersToCreate = [
            {
                name: 'Aurelia Admin',
                email: 'admin@aurelia.com',
                password: 'admin123',
                role: 'admin',
                phone: '+84 898 123 456',
                address: 'Aurelia Prada HQ, Quận 1, TP Hồ Chí Minh',
                gender: 'other',
                membershipLevel: 'VVIP',
                points: 9999
            },
            {
                name: 'Test User',
                email: 'user@example.com',
                password: 'password123',
                role: 'user',
                phone: '+84 123 456 789',
                address: 'Cầu Giấy, Hà Nội',
                gender: 'female',
                membershipLevel: 'Premium',
                points: 350
            }
        ];

        userNames.forEach((name, index) => {
            usersToCreate.push({
                name,
                email: `customer${index + 1}@example.com`,
                password: 'password123',
                role: 'user',
                phone: `+84 90${String(1000000 + index)}`,
                address: `${pick(districts, index)}, ${pick(cities, index)}`,
                gender: pick(['male', 'female', 'other'], index),
                membershipLevel: pick(['Basic', 'Basic', 'Premium', 'VVIP'], index),
                points: randomInt(0, 5000),
                dob: `${randomInt(1988, 2004)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`
            });
        });

        const createdUsers = await User.create(usersToCreate);
        const customerUsers = createdUsers.filter((u) => u.role === 'user');

        const categoriesData = [
            // ÁO & ÁO KHOÁC (Exist)
            { name: 'Áo sơ mi', slug: 'ao-so-mi', group: 'ÁO' },
            { name: 'Áo thun', slug: 'ao-thun', group: 'ÁO' },
            { name: 'Áo len', slug: 'ao-len', group: 'ÁO' },
            { name: 'Áo vest / Blazer', slug: 'ao-vest-blazer', group: 'ÁO' },
            { name: 'Áo khoác dạ', slug: 'ao-khoac-da', group: 'ÁO KHOÁC' },

            // QUẦN
            { name: 'Quần tây', slug: 'quan-tay', group: 'QUẦN' },
            { name: 'Quần jeans', slug: 'quan-jeans', group: 'QUẦN' },
            { name: 'Quần kaki', slug: 'quan-kaki', group: 'QUẦN' },

            // THEO DỊP / SỰ KIỆN
            { name: 'Tết / Holiday Collection', slug: 'holiday-tet', group: 'THEO DỊP' },
            { name: 'Valentine / Noel / Halloween', slug: 'seasonal-events', group: 'THEO DỊP' },
            { name: 'Tiệc cưới & Dạ hội', slug: 'evening-bridal', group: 'THEO DỊP' },
            { name: 'Du lịch & Nghỉ hè', slug: 'resort-collection', group: 'THEO DỊP' },

            // SẢN PHẨM ĐẶC TRƯNG
            { name: 'Đầm & Váy (Dress Edit)', slug: 'dress-edit', group: 'SẢN PHẨM ĐẶC TRƯNG' },
            { name: 'Áo khoác (Outerwear)', slug: 'outerwear', group: 'SẢN PHẨM ĐẶC TRƯNG' },
            { name: 'Đồ Denim', slug: 'denim-wear', group: 'SẢN PHẨM ĐẶC TRƯNG' },
            { name: 'Đồ cơ bản (Essentials)', slug: 'basics-essentials', group: 'SẢN PHẨM ĐẶC TRƯNG' },

            // THEO MÙA
            { name: 'Xuân Hè 2026', slug: 'spring-summer-2026', group: 'THEO MÙA' },
            { name: 'Thu Đông 2025', slug: 'fall-winter-2025', group: 'THEO MÙA' },
            { name: 'Pre-Fall Collection', slug: 'pre-fall', group: 'THEO MÙA' },
            { name: 'Holiday Capsule', slug: 'holiday-capsule', group: 'THEO MÙA' },

            // PHỤ KIỆN
            { name: 'Giày dép', slug: 'giay-dep', group: 'PHỤ KIỆN' },
            { name: 'Túi xách', slug: 'tui-xach', group: 'PHỤ KIỆN' },
            { name: 'Ví', slug: 'vi', group: 'PHỤ KIỆN' },
            { name: 'Thắt lưng', slug: 'that-lung', group: 'PHỤ KIỆN' },
            { name: 'Kính mắt', slug: 'kinh-mat', group: 'PHỤ KIỆN' },
            { name: 'Mũ', slug: 'mu', group: 'PHỤ KIỆN' },
            { name: 'Trang sức', slug: 'trang-suc', group: 'PHỤ KIỆN' },
            { name: 'Khăn', slug: 'khan', group: 'PHỤ KIỆN' }
        ];

        const createdCats = await Category.insertMany(categoriesData);
        const catMap = {};
        createdCats.forEach(c => catMap[c.name] = c._id);

        const materials = ['Silk', 'Linen', 'Wool', 'Cashmere', 'Polyester', 'Soft Cotton'];
        const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];
        const colorOptions = [
            { color: 'Black', colorCode: '#111111' },
            { color: 'White', colorCode: '#F8F8F8' },
            { color: 'Navy', colorCode: '#1C2E4A' },
            { color: 'Beige', colorCode: '#D8C3A5' },
            { color: 'Brown', colorCode: '#8B5E3B' },
            { color: 'Wine', colorCode: '#7C1F3D' },
            { color: 'Olive', colorCode: '#596B3B' }
        ];
        const collections = ['Premium Silk by Format', 'First Class', 'No.11 Etre Douce', 'Urban Glow 2026'];
        const shirtCategories = ['Áo sơ mi', 'Áo thun', 'Áo len', 'Áo vest / Blazer'];
        const pantsCategories = ['Quần tây', 'Quần jeans', 'Quần kaki'];
        const weightedCategoryPool = [
            ...shirtCategories,
            ...shirtCategories,
            ...shirtCategories,
            ...pantsCategories,
            ...pantsCategories,
            'Áo khoác dạ',
            'Tết / Holiday Collection',
            'Valentine / Noel / Halloween',
            'Tiệc cưới & Dạ hội',
            'Du lịch & Nghỉ hè',
            'Đầm & Váy (Dress Edit)',
            'Áo khoác (Outerwear)',
            'Đồ Denim',
            'Đồ cơ bản (Essentials)',
            'Xuân Hè 2026',
            'Thu Đông 2025',
            'Pre-Fall Collection',
            'Holiday Capsule',
            'Giày dép',
            'Túi xách',
            'Ví',
            'Thắt lưng',
            'Kính mắt',
            'Mũ',
            'Trang sức',
            'Khăn'
        ];

        // Luxury Fashion & Accessories Image pool
        const images = [
            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80', // Bag
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', // Bag
            'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80', // Wallet
            'https://images.unsplash.com/photo-1596704017254-9b121067307b?auto=format&fit=crop&w=600&q=80', // Sunglasses
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', // Backpack
            'https://images.unsplash.com/photo-1509191434302-021e9ed736c0?auto=format&fit=crop&w=600&q=80', // Belt
            'https://images.unsplash.com/photo-1521335629791-ce4aec67dd16?auto=format&fit=crop&w=600&q=80', // Hat
            'https://images.unsplash.com/photo-1535633302703-9420414421aa?auto=format&fit=crop&w=600&q=80', // Jewelry
            'https://images.unsplash.com/photo-1590548784585-645d89030875?auto=format&fit=crop&w=600&q=80', // Perfume/Misc
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', // Watch
        ];
        const pantsImages = [
            'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1604176424472-9d4d0f7f6f6f?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&w=600&q=80'
        ];

        const productsToCreate = [];

        // Generate larger catalog with mixed single and variant products.
        for (let i = 0; i < 180; i++) {
            const catName = pick(weightedCategoryPool, i);
            const randomPrice = Math.floor(Math.random() * (1500000 - 350000) + 350000); // 350k - 1.5M
            const randomBadge = Math.random() > 0.5 ? 'Sale' : (Math.random() > 0.5 ? 'New' : 'Best Seller');
            const isShirt = shirtCategories.includes(catName);
            const isPants = pantsCategories.includes(catName);
            const namePrefix = isShirt ? 'Áo' : (isPants ? 'Quần' : catName);

            // Special image selection for accessory categories
            let itemImage = images[i % images.length];
            if (isPants) {
                itemImage = pantsImages[i % pantsImages.length];
            }
            const accImgMap = {
                'Túi xách': 0, 'Ví': 2, 'Kính mắt': 3, 'Thắt lưng': 5, 'Mũ': 6, 'Trang sức': 7, 'Giày dép': 4
            };
            if (accImgMap[catName] !== undefined) {
                itemImage = images[accImgMap[catName]];
            }

            const shouldHaveVariants = i % 3 === 0;
            const variantColors = shouldHaveVariants ? sampleUnique(colorOptions, randomInt(2, 3)) : [];
            const variants = variantColors.map((variantColor, variantIndex) => {
                const sizes = sampleUnique(sizeOptions, randomInt(3, 5));
                const stock = randomInt(8, 35);
                return {
                    color: variantColor.color,
                    colorCode: variantColor.colorCode,
                    images: [
                        images[(i + variantIndex) % images.length],
                        images[(i + variantIndex + 2) % images.length]
                    ],
                    sizes,
                    stock
                };
            });

            const totalVariantStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
            const productStock = shouldHaveVariants ? totalVariantStock : randomInt(15, 120);
            const productStatus = getStatusByStock(productStock);

            productsToCreate.push({
                name: `${namePrefix} ${collections[Math.floor(Math.random() * collections.length)]} ${i + 1}`,
                price: randomPrice,
                originalPrice: Math.random() > 0.7 ? Math.floor(randomPrice * 1.3) : null,
                category: catMap[catName],
                color: ['Black', 'Cream', 'Caramel', 'Midnight', 'Sand'][i % 5],
                image: itemImage,
                images: [itemImage, images[(i + 3) % images.length], images[(i + 6) % images.length]],
                variants,
                badge: randomBadge,
                stock: productStock,
                material: materials[Math.floor(Math.random() * materials.length)],
                collectionName: collections[Math.floor(Math.random() * collections.length)],
                status: productStatus,
                rating: Number((Math.random() * 0.8 + 4.2).toFixed(1)),
                numReviews: randomInt(8, 250),
                totalSold: randomInt(10, 1200)
            });
        }

        // Add dedicated pants products so THỜI TRANG page always has rich QUẦN inventory.
        const pantsNameSeries = ['Tailored Fit', 'Straight Cut', 'Relaxed Wide Leg', 'Slim Tapered'];
        for (let i = 0; i < 24; i++) {
            const catName = pick(pantsCategories, i);
            const mainImage = pantsImages[i % pantsImages.length];
            const accentColor = pick(colorOptions, i);
            const stock = randomInt(18, 90);

            productsToCreate.push({
                name: `Quần ${pick(pantsNameSeries, i)} ${i + 1}`,
                price: Math.floor(Math.random() * (1450000 - 390000) + 390000),
                originalPrice: Math.random() > 0.65 ? Math.floor(Math.random() * (1850000 - 1200000) + 1200000) : null,
                category: catMap[catName],
                color: accentColor.color,
                image: mainImage,
                images: [
                    mainImage,
                    pantsImages[(i + 1) % pantsImages.length],
                    pantsImages[(i + 2) % pantsImages.length]
                ],
                variants: [
                    {
                        color: accentColor.color,
                        colorCode: accentColor.colorCode,
                        images: [mainImage, pantsImages[(i + 1) % pantsImages.length]],
                        sizes: sampleUnique(sizeOptions, randomInt(3, 5)),
                        stock
                    }
                ],
                badge: i % 4 === 0 ? 'Best Seller' : (i % 3 === 0 ? 'Sale' : 'New'),
                stock,
                material: pick(materials, i),
                collectionName: pick(collections, i),
                status: getStatusByStock(stock),
                rating: Number((Math.random() * 0.7 + 4.3).toFixed(1)),
                numReviews: randomInt(20, 260),
                totalSold: randomInt(80, 1600)
            });
        }

        const createdProducts = await Product.insertMany(productsToCreate);

        const createdVouchers = await Voucher.insertMany([
            {
                code: 'AURELIA10',
                description: 'Giảm 10% cho đơn hàng đầu tiên',
                discountType: 'percent',
                discountAmount: 10,
                minOrderValue: 0,
                expirationDate: new Date('2026-12-31'),
                isActive: true
            },
            {
                code: 'LUXURY500K',
                description: 'Giảm 500,000đ cho đơn hàng từ 5,000,000đ',
                discountType: 'fixed',
                discountAmount: 500000,
                minOrderValue: 5000000,
                expirationDate: new Date('2026-12-31'),
                isActive: true
            },
            {
                code: 'FREESHIP',
                description: 'Giảm 30,000đ phí vận chuyển',
                discountType: 'fixed',
                discountAmount: 30000,
                minOrderValue: 500000,
                expirationDate: new Date('2026-12-31'),
                isActive: true
            },
            {
                code: 'ATOMIC',
                description: 'Giảm giá cực mạnh - 50%',
                discountType: 'percent',
                discountAmount: 50,
                minOrderValue: 1000000,
                expirationDate: new Date('2026-12-31'),
                isActive: true
            },
            {
                code: 'SPRING15',
                description: 'Giảm 15% cho BST Xuân Hè',
                discountType: 'percent',
                discountAmount: 15,
                minOrderValue: 800000,
                expirationDate: new Date('2026-10-31'),
                isActive: true
            },
            {
                code: 'VIP1M',
                description: 'Giảm 1,000,000đ cho đơn từ 8,000,000đ',
                discountType: 'fixed',
                discountAmount: 1000000,
                minOrderValue: 8000000,
                expirationDate: new Date('2026-12-31'),
                isActive: true
            }
        ]);

        const cartsToCreate = [];
        const cartUsers = sampleUnique(customerUsers, 12);
        cartUsers.forEach((user, index) => {
            const selectedProducts = sampleUnique(createdProducts, randomInt(1, 4));
            const items = selectedProducts.map((product) => {
                let size = '';
                let color = '';
                let colorCode = '';
                let maxQty = Math.max(1, Math.min(4, product.stock || 1));

                if (Array.isArray(product.variants) && product.variants.length > 0) {
                    const variant = product.variants[randomInt(0, product.variants.length - 1)];
                    size = variant.sizes?.length ? variant.sizes[randomInt(0, variant.sizes.length - 1)] : '';
                    color = variant.color || '';
                    colorCode = variant.colorCode || '';
                    maxQty = Math.max(1, Math.min(4, variant.stock || 1));
                }

                return {
                    product: product._id,
                    quantity: randomInt(1, maxQty),
                    size,
                    color,
                    colorCode
                };
            });

            cartsToCreate.push({
                user: user._id,
                items,
                createdAt: randomDateWithinDays(30 - (index % 5)),
                updatedAt: new Date()
            });
        });

        await Cart.insertMany(cartsToCreate);

        const orderStatuses = ['Processing', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Delivered', 'Cancelled'];
        const paymentMethods = ['COD', 'Banking', 'Momo', 'VNPay'];
        const shippingTemplates = [
            { street: '12 Nguyễn Huệ', city: 'TP Hồ Chí Minh', state: 'TP Hồ Chí Minh', ward: 'Bến Nghé', country: 'Vietnam' },
            { street: '89 Trần Duy Hưng', city: 'Hà Nội', state: 'Hà Nội', ward: 'Trung Hòa', country: 'Vietnam' },
            { street: '25 Võ Văn Kiệt', city: 'Đà Nẵng', state: 'Đà Nẵng', ward: 'An Hải Bắc', country: 'Vietnam' },
            { street: '203 Lê Lợi', city: 'Hải Phòng', state: 'Hải Phòng', ward: 'Máy Tơ', country: 'Vietnam' }
        ];

        const ordersToCreate = [];
        for (let i = 0; i < 60; i++) {
            const user = pick(customerUsers, i);
            const status = pick(orderStatuses, i + randomInt(0, 2));
            const chosenProducts = sampleUnique(createdProducts, randomInt(1, 3));

            const orderItems = chosenProducts.map((product) => {
                let size = '';
                let color = '';
                let colorCode = '';
                let maxQty = Math.max(1, Math.min(3, product.stock || 1));
                let image = product.image;

                if (Array.isArray(product.variants) && product.variants.length > 0) {
                    const variant = product.variants[randomInt(0, product.variants.length - 1)];
                    size = variant.sizes?.length ? variant.sizes[randomInt(0, variant.sizes.length - 1)] : '';
                    color = variant.color || '';
                    colorCode = variant.colorCode || '';
                    image = variant.images?.length ? variant.images[0] : product.image;
                    maxQty = Math.max(1, Math.min(3, variant.stock || 1));
                }

                return {
                    name: product.name,
                    qty: randomInt(1, maxQty),
                    image,
                    price: product.price,
                    size,
                    color,
                    colorCode,
                    product: product._id
                };
            });

            const itemsPrice = orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const shippingPrice = itemsPrice >= 2000000 ? 0 : 30000;
            const taxPrice = Math.round(itemsPrice * 0.08);
            const shouldUseVoucher = i % 4 === 0;
            const voucher = shouldUseVoucher ? pick(createdVouchers, i) : null;
            let discountPrice = 0;

            if (voucher && itemsPrice >= (voucher.minOrderValue || 0)) {
                if (voucher.discountType === 'percent') {
                    discountPrice = Math.round(itemsPrice * (voucher.discountAmount / 100));
                } else {
                    discountPrice = voucher.discountAmount;
                }
            }

            const totalPrice = Math.max(0, itemsPrice + shippingPrice + taxPrice - discountPrice);
            const createdAt = randomDateWithinDays(120);
            const paidAt = status === 'Processing' || status === 'Cancelled'
                ? null
                : new Date(createdAt.getTime() + randomInt(2, 48) * 60 * 60 * 1000);
            const deliveredAt = status === 'Delivered' && paidAt
                ? new Date(paidAt.getTime() + randomInt(1, 6) * 24 * 60 * 60 * 1000)
                : null;

            ordersToCreate.push({
                user: user._id,
                orderItems,
                shippingAddress: pick(shippingTemplates, i),
                paymentMethod: pick(paymentMethods, i),
                paymentResult: paidAt
                    ? {
                        id: `PAY-${String(100000 + i)}`,
                        status: 'COMPLETED',
                        update_time: paidAt.toISOString(),
                        email_address: user.email
                    }
                    : undefined,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                voucherCode: voucher ? voucher.code : undefined,
                discountPrice,
                isPaid: !!paidAt,
                paidAt,
                isDelivered: status === 'Delivered',
                deliveredAt,
                status,
                createdAt,
                updatedAt: new Date()
            });
        }

        await Order.insertMany(ordersToCreate);

        console.log('✅ Unified seed completed: users, categories, products, vouchers.');
        console.log('📦 Added dedicated QUẦN seed products for the THỜI TRANG page.');
        console.log(`👥 Users: ${createdUsers.length} | 🛍️ Products: ${createdProducts.length} | 🧾 Orders: ${ordersToCreate.length} | 🛒 Carts: ${cartsToCreate.length}`);
        process.exit();
    } catch (error) {
        console.error(`❌ Errors: ${error.message}`);
        process.exit(1);
    }
};

seedData();
