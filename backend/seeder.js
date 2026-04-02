const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');

const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();

        console.log('🗑️  Data cleared.');

        await User.create({
            name: 'Aurelia Admin',
            email: 'admin@aurelia.com',
            password: 'admin123',
            role: 'admin',
            phone: '+84 898 123 456'
        });

        const categoriesData = [
            // ÁO & ÁO KHOÁC (Exist)
            { name: 'Áo sơ mi', slug: 'ao-so-mi', group: 'ÁO' },
            { name: 'Áo thun', slug: 'ao-thun', group: 'ÁO' },
            { name: 'Áo len', slug: 'ao-len', group: 'ÁO' },
            { name: 'Áo vest / Blazer', slug: 'ao-vest-blazer', group: 'ÁO' },
            { name: 'Áo khoác dạ', slug: 'ao-khoac-da', group: 'ÁO KHOÁC' },

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
        const collections = ['Premium Silk by Format', 'First Class', 'No.11 Être Douce', 'Urban Glow 2026'];

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

        const productsToCreate = [];

        // Generate 48 products to cover more items including all accessories
        for (let i = 0; i < 48; i++) {
            const catNames = Object.keys(catMap);
            const catName = catNames[i % catNames.length]; // Cycle through all sub-categories
            const randomPrice = Math.floor(Math.random() * (1500000 - 350000) + 350000); // 350k - 1.5M
            const randomBadge = Math.random() > 0.5 ? 'Sale' : (Math.random() > 0.5 ? 'New' : 'Best Seller');

            // Special image selection for accessory categories
            let itemImage = images[i % images.length];
            const accImgMap = {
                'Túi xách': 0, 'Ví': 2, 'Kính mắt': 3, 'Thắt lưng': 5, 'Mũ': 6, 'Trang sức': 7, 'Giày dép': 4
            };
            if (accImgMap[catName] !== undefined) {
                itemImage = images[accImgMap[catName]];
            }

            productsToCreate.push({
                name: `${catName} ${collections[Math.floor(Math.random() * collections.length)]}`,
                price: randomPrice,
                originalPrice: Math.random() > 0.7 ? Math.floor(randomPrice * 1.3) : null,
                category: catMap[catName],
                color: ['Black', 'Cream', 'Caramel', 'Midnight', 'Sand'][i % 5],
                image: itemImage,
                badge: randomBadge,
                stock: 20 + Math.floor(Math.random() * 80),
                material: materials[Math.floor(Math.random() * materials.length)],
                collectionName: collections[Math.floor(Math.random() * collections.length)]
            });
        }

        await Product.insertMany(productsToCreate);

        console.log('✅ Accurate categories and 32 items seeded (Price < 2M).');
        process.exit();
    } catch (error) {
        console.error(`❌ Errors: ${error.message}`);
        process.exit(1);
    }
};

seedData();
