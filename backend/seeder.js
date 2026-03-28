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
            { name: 'Kính mắt', slug: 'kinh-mat', group: 'PHỤ KIỆN' }
        ];

        const createdCats = await Category.insertMany(categoriesData);
        const catMap = {};
        createdCats.forEach(c => catMap[c.name] = c._id);

        const materials = ['Silk', 'Linen', 'Wool', 'Cashmere', 'Polyester', 'Soft Cotton'];
        const collections = ['Premium Silk by Format', 'First Class', 'No.11 Être Douce', 'Urban Glow 2026'];
        
        // Reliable Unsplash Fashion Image pool for high quality display (Avoids CORS/Opaque blocking)
        const images = [
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1539109132314-34a936ee5530?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1111663110294-f73c1d9361a9?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
        ];

        const productsToCreate = [];

        // Generate 32 products to cover all 16 sub-categories (2 each)
        for (let i = 0; i < 32; i++) {
            const catNames = Object.keys(catMap);
            const catName = catNames[i % catNames.length]; // Cycle through all sub-categories
            const randomPrice = Math.floor(Math.random() * (1200000 - 350000) + 350000); // Mostly 350k - 1.2M
            const randomBadge = Math.random() > 0.5 ? 'Sale' : (Math.random() > 0.5 ? 'New' : 'Best Seller');
            
            productsToCreate.push({
                name: `${catName} ${collections[Math.floor(Math.random() * collections.length)]}`,
                price: randomPrice,
                originalPrice: Math.random() > 0.7 ? Math.floor(randomPrice * 1.5) : null,
                category: catMap[catName],
                color: ['Black', 'Cream', 'Pearl', 'Midnight', 'Sand'][i % 5],
                image: images[i % images.length],
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
