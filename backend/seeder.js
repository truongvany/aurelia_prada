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
            // ÁO
            { name: 'Áo sơ mi', slug: 'ao-so-mi', group: 'ÁO' },
            { name: 'Áo thun', slug: 'ao-thun', group: 'ÁO' },
            { name: 'Áo len', slug: 'ao-len', group: 'ÁO' },
            { name: 'Áo vest / Blazer', slug: 'ao-vest-blazer', group: 'ÁO' },
            { name: 'Áo giữ nhiệt', slug: 'ao-giu-nhiet', group: 'ÁO' },
            // ÁO KHOÁC
            { name: 'Áo chống nắng', slug: 'ao-chong-nang', group: 'ÁO KHOÁC' },
            { name: 'Áo lông vũ', slug: 'ao-long-vu', group: 'ÁO KHOÁC' },
            { name: 'Áo khoác dạ', slug: 'ao-khoac-da', group: 'ÁO KHOÁC' },
            // QUẦN & VÁY
            { name: 'Quần âu', slug: 'quan-au', group: 'QUẦN & VÁY' },
            { name: 'Quần Jeans', slug: 'quan-jeans', group: 'QUẦN & VÁY' },
            { name: 'Chân váy', slug: 'chan-vay', group: 'QUẦN & VÁY' },
            { name: 'Đầm liền', slug: 'dam-lien', group: 'QUẦN & VÁY' },
            // PHỤ KIỆN
            { name: 'Giày dép', slug: 'giay-dep', group: 'PHỤ KIỆN' },
            { name: 'Túi xách', slug: 'tui-xach', group: 'PHỤ KIỆN' },
            { name: 'Thắt lưng', slug: 'that-lung', group: 'PHỤ KIỆN' },
            { name: 'Kính mắt', slug: 'kinh-mat', group: 'PHỤ KIỆN' }
        ];

        const createdCats = await Category.insertMany(categoriesData);
        const catMap = {};
        createdCats.forEach(c => catMap[c.name] = c._id);

        const materials = ['Silk', 'Linen', 'Wool', 'Cashmere', 'Polyester', 'Soft Cotton'];
        const collections = ['Premium Silk by Format', 'First Class', 'No.11 Être Douce', 'Urban Glow 2026'];
        
        // Realistic Unsplash / IvyModa Style Image pool for high quality display
        const images = [
            'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/b1dc876b0be0daccf2f3d334cfcf27d6.webp',
            'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/554530918643b20e07f912d8d7650e02.webp',
            'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/5ed8763b426af135a4cc0f688bd9f1bd.webp',
            'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/f0e3776d7e00d7bd1c080cb95c80ce9d.webp',
            'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/49ce975d8dcc87c1af8b5f3d334cfcf2.webp',
            'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/07e8763b426af135a4cc0f688bd9f1bd.webp',
            'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/57a2529097e90cffd3b4a83ad8b99f2c.webp',
            'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/a1dc876b0be0daccf2f3d334cfcf27d6.webp',
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
