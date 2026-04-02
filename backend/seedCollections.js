const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Product = require('./models/Product');
const Category = require('./models/Category');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

// ─── SLUGIFY HELPER ─────────────────────────────────────────────────────
function slugify(text) {
    return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .toLowerCase();
}

const seedCollections = async () => {
    try {
        console.log('🚀 Starting seed collections for main groups...');

        // ─── CREATE MISSING CATEGORIES ───────────────────────────────────────
        const newCategoryNames = [
            { name: 'Áo Sơ Mi (Shirt Edit)', group: 'SẢN PHẨM ĐẶC TRƯNG' },
            { name: 'Áo Thun (T-Shirt Edit)', group: 'SẢN PHẨM ĐẶC TRƯNG' },
            { name: 'Áo Khoác (Outerwear Edit)', group: 'SẢN PHẨM ĐẶC TRƯNG' },
            { name: 'Quần Jeans (Denim Edit)', group: 'SẢN PHẨM ĐẶC TRƯNG' },
            { name: 'Thu Đông 2026', group: 'THEO MÙA' },
            { name: 'Lookbook Casual', group: 'THEO MÙA' },
            { name: 'Essentials Basics', group: 'THEO MÙA' },
            { name: 'Tết / Valentine', group: 'THEO DỊP' },
            { name: 'Giáng Sinh / Năm Mới', group: 'THEO DỊP' }
        ];

        for (const catData of newCategoryNames) {
            const existing = await Category.findOne({ name: catData.name });
            if (!existing) {
                await Category.create({
                    ...catData,
                    slug: slugify(catData.name)
                });
                console.log(`✅ Created category: "${catData.name}"`);
            }
        }

        // Get existing categories
        const categories = await Category.find({});
        const catMap = {};
        categories.forEach(c => catMap[c.name] = c._id);

        // Define products by ACTUAL collection category names (not groups)
        const collectionData = {
            // THEO DỊP Group (4 categories)
            'Tết / Holiday Collection': [
                {
                    name: 'Áo Dạ Tết Sang Trọng',
                    price: 1290000,
                    originalPrice: 1890000,
                    description: 'Áo dạ chất lượng cao dành cho Tết Nguyên Đán',
                    material: 'Wool Blend',
                    collectionName: 'Holiday Capsule',
                    variants: [
                        { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 12 },
                        { color: 'Navy', colorCode: '#001F3F', sizes: ['S', 'M', 'L', 'XL'], stock: 10 },
                        { color: 'Vàng Kim', colorCode: '#FFD700', sizes: ['S', 'M', 'L'], stock: 8 }
                    ],
                    stock: 30,
                    image: 'https://images.unsplash.com/photo-1591869711797-3dd30c3d3a13?auto=format&fit=crop&w=600&q=80',
                    rating: 4.9,
                    numReviews: 145,
                    totalSold: 289
                },
                {
                    name: 'Đầm Tết Quý Phái',
                    price: 1450000,
                    originalPrice: 2100000,
                    description: 'Đầm dạ hàng duyên cho dịp Tết',
                    material: 'Silk Satin',
                    collectionName: 'Premium Silk by Format',
                    variants: [
                        { color: 'Đỏ Gạch', colorCode: '#A0522D', sizes: ['XS', 'S', 'M', 'L'], stock: 10 },
                        { color: 'Đen', colorCode: '#000000', sizes: ['S', 'M', 'L'], stock: 9 },
                        { color: 'Xanh Tím', colorCode: '#4B0082', sizes: ['S', 'M', 'L'], stock: 8 }
                    ],
                    stock: 27,
                    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
                    rating: 4.8,
                    numReviews: 112,
                    totalSold: 224
                },
                {
                    name: 'Áo Sơ Mi Lụa Tết',
                    price: 895000,
                    originalPrice: 1290000,
                    description: 'Áo sơ mi lụa cao cấp cho dịp lễ Tết',
                    material: 'Silk 100%',
                    collectionName: 'Premium Silk by Format',
                    variants: [
                        { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 15 },
                        { color: 'Beige', colorCode: '#F5E6D3', sizes: ['S', 'M', 'L', 'XL'], stock: 12 },
                        { color: 'Xanh Nhạt', colorCode: '#B0D4E3', sizes: ['S', 'M', 'L'], stock: 10 }
                    ],
                    stock: 37,
                    image: 'https://images.unsplash.com/photo-1516992654410-7eaf5a5cfe7e?auto=format&fit=crop&w=600&q=80',
                    rating: 4.8,
                    numReviews: 124,
                    totalSold: 256
                },
                {
                    name: 'Váy Tết Thanh Lịch',
                    price: 980000,
                    originalPrice: 1450000,
                    description: 'Váy thanh lịch cho buổi gặp gỡ Tết',
                    material: 'Cotton Polyester',
                    collectionName: 'First Class',
                    variants: [
                        { color: 'Đỏ Hoa Mai', colorCode: '#E63946', sizes: ['XS', 'S', 'M', 'L'], stock: 13 },
                        { color: 'Navy', colorCode: '#001F3F', sizes: ['S', 'M', 'L', 'XL'], stock: 14 },
                        { color: 'Champagne', colorCode: '#F8F0E6', sizes: ['S', 'M', 'L'], stock: 11 }
                    ],
                    stock: 38,
                    image: 'https://images.unsplash.com/photo-1567681022160-ec3d7ef34df3?auto=format&fit=crop&w=600&q=80',
                    rating: 4.7,
                    numReviews: 98,
                    totalSold: 196
                },
                {
                    name: 'Áo Khoác Tết Lịch Lãm',
                    price: 1150000,
                    originalPrice: 1700000,
                    description: 'Áo khoác sang trọng cho dịp Tết',
                    material: 'Wool Blend',
                    collectionName: 'First Class',
                    variants: [
                        { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 14 },
                        { color: 'Caramel', colorCode: '#C67C4E', sizes: ['S', 'M', 'L'], stock: 12 },
                        { color: 'Xám Nhạt', colorCode: '#D3D3D3', sizes: ['S', 'M', 'L', 'XL'], stock: 11 }
                    ],
                    stock: 37,
                    image: 'https://images.unsplash.com/photo-1534227615491-d00ce4f0d404?auto=format&fit=crop&w=600&q=80',
                    rating: 4.8,
                    numReviews: 108,
                    totalSold: 216
                },
                {
                    name: 'Đầm Tết Kinh Điển',
                    price: 1100000,
                    originalPrice: 1600000,
                    description: 'Đầm nhập khẩu kinh điển cho Tết',
                    material: 'Premium Cotton',
                    collectionName: 'No.11 Être Douce',
                    variants: [
                        { color: 'Đỏ Gạch', colorCode: '#A0522D', sizes: ['XS', 'S', 'M', 'L'], stock: 11 },
                        { color: 'Xám Đậm', colorCode: '#A9A9A9', sizes: ['S', 'M', 'L'], stock: 10 },
                        { color: 'Navy Sẫm', colorCode: '#00008B', sizes: ['S', 'M', 'L', 'XL'], stock: 12 }
                    ],
                    stock: 33,
                    image: 'https://images.unsplash.com/photo-1595777707876-acdc3ef1eda0?auto=format&fit=crop&w=600&q=80',
                    rating: 4.7,
                    numReviews: 89,
                    totalSold: 178
                },
                {
                    name: 'Áo Sơ Mi Cộc Tay Tết',
                    price: 620000,
                    originalPrice: 920000,
                    description: 'Áo sơ mi cộc tay lịch sự cho Tết',
                    material: 'Cotton Premium',
                    collectionName: 'Spring Summer 2026',
                    variants: [
                        { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 18 },
                        { color: 'Xanh Nhạt', colorCode: '#87CEEB', sizes: ['S', 'M', 'L', 'XL'], stock: 15 },
                        { color: 'Hồng Phấn', colorCode: '#FFB6C1', sizes: ['S', 'M', 'L'], stock: 12 }
                    ],
                    stock: 45,
                    image: 'https://images.unsplash.com/photo-1551084221-46ff6fd8e55f?auto=format&fit=crop&w=600&q=80',
                    rating: 4.6,
                    numReviews: 76,
                    totalSold: 152
                },
                {
                    name: 'Quần Tây Lịch Lãm Tết',
                    price: 750000,
                    originalPrice: 1100000,
                    description: 'Quần tây lịch lãm phối với áo sơ mi',
                    material: 'Wool Cotton',
                    collectionName: 'First Class',
                    variants: [
                        { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 16 },
                        { color: 'Navy', colorCode: '#001F3F', sizes: ['S', 'M', 'L', 'XL'], stock: 14 },
                        { color: 'Xám', colorCode: '#808080', sizes: ['S', 'M', 'L'], stock: 12 }
                    ],
                    stock: 42,
                    image: 'https://images.unsplash.com/photo-1594938361394-fdf6cb295e37?auto=format&fit=crop&w=600&q=80',
                    rating: 4.7,
                    numReviews: 91,
                    totalSold: 182
                },
                {
                    name: 'Áo Len Tết Ấm Áp',
                    price: 850000,
                    originalPrice: 1250000,
                    description: 'Áo len ấm áp cho Tết mùa lạnh',
                    material: 'Wool 100%',
                    collectionName: 'Fall Winter 2025',
                    variants: [
                        { color: 'Cream', colorCode: '#FFFDD0', sizes: ['XS', 'S', 'M', 'L'], stock: 13 },
                        { color: 'Đen', colorCode: '#000000', sizes: ['S', 'M', 'L', 'XL'], stock: 15 },
                        { color: 'Burgundy', colorCode: '#800020', sizes: ['S', 'M', 'L'], stock: 11 }
                    ],
                    stock: 39,
                    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80',
                    rating: 4.8,
                    numReviews: 115,
                    totalSold: 230
                },
                {
                    name: 'Áo Khoác Lông Tết Premium',
                    price: 1380000,
                    originalPrice: 2000000,
                    description: 'Áo khoác lông cao cấp cho Tết',
                    material: 'Fur Blend',
                    collectionName: 'Premium Silk by Format',
                    variants: [
                        { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L'], stock: 8 },
                        { color: 'Xám Sáng', colorCode: '#D3D3D3', sizes: ['S', 'M', 'L'], stock: 7 },
                        { color: 'Nâu Đậm', colorCode: '#8B4513', sizes: ['S', 'M', 'L'], stock: 6 }
                    ],
                    stock: 21,
                    image: 'https://images.unsplash.com/photo-1539533057592-4d2b7472e0a2?auto=format&fit=crop&w=600&q=80',
                    rating: 4.9,
                    numReviews: 67,
                    totalSold: 134
                }
            ],
            // SẢN PHẨM ĐẶC TRƯNG Group
            'Đầm & Váy (Dress Edit)': [
                {
                    name: 'Đầm Suông Thanh Lịch',
                    price: 980000,
                    originalPrice: 1450000,
                    description: 'Đầm suông thiết kế cao cấp',
                    material: 'Cotton Blend',
                    collectionName: 'First Class',
                    variants: [
                        { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L'], stock: 15 },
                        { color: 'Navy', colorCode: '#001F3F', sizes: ['S', 'M', 'L', 'XL'], stock: 12 },
                        { color: 'Hồng Nhạt', colorCode: '#FFB6C1', sizes: ['S', 'M', 'L'], stock: 10 }
                    ],
                    stock: 37,
                    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
                    rating: 4.8,
                    numReviews: 134,
                    totalSold: 268
                },
                {
                    name: 'Váy Midi Nữ Tính',
                    price: 850000,
                    originalPrice: 1250000,
                    description: 'Váy midi với thiết kế nữ tính',
                    material: 'Linen Cotton',
                    collectionName: 'Spring Summer 2026',
                    variants: [
                        { color: 'Kem', colorCode: '#FFFDD0', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 18 },
                        { color: 'Xanh Nhạt', colorCode: '#B0D4E3', sizes: ['S', 'M', 'L', 'XL'], stock: 15 },
                        { color: 'Hồng Coral', colorCode: '#FF7F50', sizes: ['S', 'M', 'L'], stock: 12 }
                    ],
                    stock: 45,
                    image: 'https://images.unsplash.com/photo-1595777707876-acdc3ef1eda0?auto=format&fit=crop&w=600&q=80',
                    rating: 4.7,
                    numReviews: 103,
                    totalSold: 206
                },
                {
                    name: 'Đầm Xòe Cổ Điển',
                    price: 920000,
                    originalPrice: 1350000,
                    description: 'Đầm xòe kiểu cổ điển sang trọng',
                    material: 'Silk Blend',
                    collectionName: 'No.11 Être Douce',
                    variants: [
                        { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L'], stock: 12 },
                        { color: 'Tím Nhạt', colorCode: '#DDA0DD', sizes: ['S', 'M', 'L', 'XL'], stock: 14 },
                        { color: 'Xanh Đậm', colorCode: '#00008B', sizes: ['S', 'M', 'L'], stock: 10 }
                    ],
                    stock: 36,
                    image: 'https://images.unsplash.com/photo-1567681022160-ec3d7ef34df3?auto=format&fit=crop&w=600&q=80',
                    rating: 4.9,
                    numReviews: 156,
                    totalSold: 312
                },
                {
                    name: 'Đầm Bodycon Quyến Rũ',
                    price: 750000,
                    originalPrice: 1100000,
                    description: 'Đầm bodycon ôm dáng quyến rũ',
                    material: 'Polyester Elastane',
                    collectionName: 'Urban Glow 2026',
                    variants: [
                        { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L'], stock: 16 },
                        { color: 'Hồng Fuchsia', colorCode: '#FF1493', sizes: ['S', 'M', 'L', 'XL'], stock: 13 },
                        { color: 'Xanh Teal', colorCode: '#008080', sizes: ['S', 'M', 'L'], stock: 11 }
                    ],
                    stock: 40,
                    image: 'https://images.unsplash.com/photo-1595777707876-acdc3ef1eda0?auto=format&fit=crop&w=600&q=80',
                    rating: 4.6,
                    numReviews: 87,
                    totalSold: 174
                },
                {
                    name: 'Đầm Họa Tiết Bohemian',
                    price: 890000,
                    originalPrice: 1300000,
                    description: 'Đầm in họa tiết bohemian phong cách',
                    material: 'Viscose Rayon',
                    collectionName: 'Resort Collection',
                    variants: [
                        { color: 'Đa Sắc 1', colorCode: '#FF6B35', sizes: ['XS', 'S', 'M', 'L'], stock: 12 },
                        { color: 'Đa Sắc 2', colorCode: '#004E89', sizes: ['S', 'M', 'L', 'XL'], stock: 14 },
                        { color: 'Đa Sắc 3', colorCode: '#F77F00', sizes: ['S', 'M', 'L'], stock: 10 }
                    ],
                    stock: 36,
                    image: 'https://images.unsplash.com/photo-1567680022160-ec3d7ef34df3?auto=format&fit=crop&w=600&q=80',
                    rating: 4.8,
                    numReviews: 92,
                    totalSold: 184
                },
                {
                    name: 'Váy Chữ A Duyên Dáng',
                    price: 720000,
                    originalPrice: 1050000,
                    description: 'Váy chữ A duyên dáng và tinh tế',
                    material: 'Cotton Premium',
                    collectionName: 'First Class',
                    variants: [
                        { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 18 },
                        { color: 'Xanh Biển', colorCode: '#20B2AA', sizes: ['S', 'M', 'L', 'XL'], stock: 15 },
                        { color: 'Vàng Nhạt', colorCode: '#FFFFE0', sizes: ['S', 'M', 'L'], stock: 12 }
                    ],
                    stock: 45,
                    image: 'https://images.unsplash.com/photo-1595777707876-acdc3ef1eda0?auto=format&fit=crop&w=600&q=80',
                    rating: 4.7,
                    numReviews: 98,
                    totalSold: 196
                },
                {
                    name: 'Đầm Layered Phong Cách',
                    price: 980000,
                    originalPrice: 1450000,
                    description: 'Đầm với chi tiết layered tạo chiều sâu',
                    material: 'Silk Cotton',
                    collectionName: 'No.11 Être Douce',
                    variants: [
                        { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L'], stock: 13 },
                        { color: 'Hồng Nhạt', colorCode: '#FFB6C1', sizes: ['S', 'M', 'L', 'XL'], stock: 15 },
                        { color: 'Tím Nhạt', colorCode: '#DDA0DD', sizes: ['S', 'M', 'L'], stock: 11 }
                    ],
                    stock: 39,
                    image: 'https://images.unsplash.com/photo-1567680022160-ec3d7ef34df3?auto=format&fit=crop&w=600&q=80',
                    rating: 4.8,
                    numReviews: 109,
                    totalSold: 218
                },
                {
                    name: 'Váy Lưng Cao Tôn Dáng',
                    price: 650000,
                    originalPrice: 950000,
                    description: 'Váy lưng cao tôn dáng vóc người',
                    material: 'Cotton Spandex',
                    collectionName: 'Basics Essentials',
                    variants: [
                        { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 20 },
                        { color: 'Xám', colorCode: '#808080', sizes: ['S', 'M', 'L', 'XL'], stock: 17 },
                        { color: 'Xanh Navy', colorCode: '#001F3F', sizes: ['S', 'M', 'L'], stock: 14 }
                    ],
                    stock: 51,
                    image: 'https://images.unsplash.com/photo-1595777707876-acdc3ef1eda0?auto=format&fit=crop&w=600&q=80',
                    rating: 4.5,
                    numReviews: 78,
                    totalSold: 156
                },
                {
                    name: 'Đầm Cổ Vuông Nữ Tính',
                    price: 880000,
                    originalPrice: 1290000,
                    description: 'Đầm với cổ vuông nhấn nhá nữ tính',
                    material: 'Linen Blend',
                    collectionName: 'Spring Summer 2026',
                    variants: [
                        { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L'], stock: 14 },
                        { color: 'Xanh Lá', colorCode: '#2ECC71', sizes: ['S', 'M', 'L', 'XL'], stock: 12 },
                        { color: 'Đỏ Nhạt', colorCode: '#FF6B9D', sizes: ['S', 'M', 'L'], stock: 10 }
                    ],
                    stock: 36,
                    image: 'https://images.unsplash.com/photo-1567680022160-ec3d7ef34df3?auto=format&fit=crop&w=600&q=80',
                    rating: 4.7,
                    numReviews: 87,
                    totalSold: 174
                },
                {
                    name: 'Đầm Pleated Thanh Lịch',
                    price: 1050000,
                    originalPrice: 1550000,
                    description: 'Đầm với chi tiết pleated thanh lịch',
                    material: 'Premium Cotton',
                    collectionName: 'First Class',
                    variants: [
                        { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 16 },
                        { color: 'Navy', colorCode: '#001F3F', sizes: ['S', 'M', 'L', 'XL'], stock: 14 },
                        { color: 'Hồng Nhạt', colorCode: '#FFB6C1', sizes: ['S', 'M', 'L'], stock: 12 }
                    ],
                    stock: 42,
                    image: 'https://images.unsplash.com/photo-1595777707876-acdc3ef1eda0?auto=format&fit=crop&w=600&q=80',
                    rating: 4.8,
                    numReviews: 121,
                    totalSold: 242
                }
            ],
            // THEO MÙA Group
            'Xuân Hè 2026': [
                {
                    name: 'Áo Thun Cotton Mùa Hè',
                    price: 345000,
                    originalPrice: null,
                    description: 'Áo thun cotton nhẹ nhàng cho mùa hè',
                    material: 'Cotton 100%',
                    collectionName: 'Basics Essentials',
                    variants: [
                        { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], stock: 32 },
                        { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 28 },
                        { color: 'Xám', colorCode: '#808080', sizes: ['S', 'M', 'L', 'XL'], stock: 24 }
                    ],
                    stock: 84,
                    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
                    rating: 4.8,
                    numReviews: 198,
                    totalSold: 396
                },
                {
                    name: 'Áo Sơ Mi Linen Thoáng Khí',
                    price: 650000,
                    originalPrice: 950000,
                    description: 'Áo sơ mi linen hoàn hảo cho mùa hè',
                    material: 'Linen 100%',
                    collectionName: 'Spring Summer 2026',
                    variants: [
                        { color: 'Kem', colorCode: '#FFFDD0', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 18 },
                        { color: 'Hồng Nhạt', colorCode: '#FFB6C1', sizes: ['S', 'M', 'L'], stock: 14 },
                        { color: 'Lavender', colorCode: '#E6D0E8', sizes: ['S', 'M', 'L', 'XL'], stock: 11 }
                    ],
                    stock: 43,
                    image: 'https://images.unsplash.com/photo-1594938361394-fdf6cb295e37?auto=format&fit=crop&w=600&q=80',
                    rating: 4.9,
                    numReviews: 156,
                    totalSold: 312
                },
                {
                    name: 'Quần Short Mùa Hè Thoải Mái',
                    price: 450000,
                    originalPrice: 650000,
                    description: 'Quần short thoải mái cho mùa hè',
                    material: 'Cotton Linen',
                    collectionName: 'Spring Summer 2026',
                    variants: [
                        { color: 'Xám Nhạt', colorCode: '#D3D3D3', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 20 },
                        { color: 'Khaki', colorCode: '#F0E68C', sizes: ['S', 'M', 'L', 'XL'], stock: 17 },
                        { color: 'Navy Nhạt', colorCode: '#87CEEB', sizes: ['S', 'M', 'L'], stock: 14 }
                    ],
                    stock: 51,
                    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
                    rating: 4.7,
                    numReviews: 112,
                    totalSold: 224
                },
                {
                    name: 'Váy Linen Mùa Hè Duyên Dáng',
                    price: 720000,
                    originalPrice: 1050000,
                    description: 'Váy linen duyên dáng cho mùa hè',
                    material: 'Linen Cotton',
                    collectionName: 'Spring Summer 2026',
                    variants: [
                        { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 16 },
                        { color: 'Xanh Nhạt', colorCode: '#B0D4E3', sizes: ['S', 'M', 'L', 'XL'], stock: 14 },
                        { color: 'Hồng Coral', colorCode: '#FF7F50', sizes: ['S', 'M', 'L'], stock: 12 }
                    ],
                    stock: 42,
                    image: 'https://images.unsplash.com/photo-1595777707876-acdc3ef1eda0?auto=format&fit=crop&w=600&q=80',
                    rating: 4.8,
                    numReviews: 134,
                    totalSold: 268
                },
                {
                    name: 'Áo Croptop Nữ Tính Hè',
                    price: 380000,
                    originalPrice: 550000,
                    description: 'Áo croptop nữ tính cho mùa hè',
                    material: 'Cotton Jersey',
                    collectionName: 'Urban Glow 2026',
                    variants: [
                        { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L'], stock: 18 },
                        { color: 'Hồng Phấn', colorCode: '#FFB6C1', sizes: ['S', 'M', 'L'], stock: 15 },
                        { color: 'Xanh Biển', colorCode: '#20B2AA', sizes: ['S', 'M', 'L', 'XL'], stock: 14 }
                    ],
                    stock: 47,
                    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
                    rating: 4.6,
                    numReviews: 89,
                    totalSold: 178
                },
                {
                    name: 'Áo Khoác Kaki Mỏng',
                    price: 580000,
                    originalPrice: 850000,
                    description: 'Áo khoác kaki mỏng cho mùa hè',
                    material: 'Cotton Kaki',
                    collectionName: 'Spring Summer 2026',
                    variants: [
                        { color: 'Khaki', colorCode: '#F0E68C', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 17 },
                        { color: 'Xám Nhạt', colorCode: '#D3D3D3', sizes: ['S', 'M', 'L', 'XL'], stock: 15 },
                        { color: 'Trắng Kem', colorCode: '#F5E6D3', sizes: ['S', 'M', 'L'], stock: 12 }
                    ],
                    stock: 44,
                    image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?auto=format&fit=crop&w=600&q=80',
                    rating: 4.7,
                    numReviews: 98,
                    totalSold: 196
                },
                {
                    name: 'Đầm Maxi Hè Thoát Vị',
                    price: 850000,
                    originalPrice: 1250000,
                    description: 'Đầm maxi thoát vị cho mùa hè',
                    material: 'Viscose',
                    collectionName: 'Resort Collection',
                    variants: [
                        { color: 'Hồng Coral', colorCode: '#FF7F50', sizes: ['XS', 'S', 'M', 'L'], stock: 13 },
                        { color: 'Xanh Lá', colorCode: '#2ECC71', sizes: ['S', 'M', 'L', 'XL'], stock: 15 },
                        { color: 'Xanh Biển', colorCode: '#20B2AA', sizes: ['S', 'M', 'L'], stock: 11 }
                    ],
                    stock: 39,
                    image: 'https://images.unsplash.com/photo-1595777707876-acdc3ef1eda0?auto=format&fit=crop&w=600&q=80',
                    rating: 4.8,
                    numReviews: 126,
                    totalSold: 252
                },
                {
                    name: 'Áo Tanktop Basic Mùa Hè',
                    price: 280000,
                    originalPrice: 420000,
                    description: 'Áo tanktop basic thoáng khí mùa hè',
                    material: 'Cotton Spandex',
                    collectionName: 'Basics Essentials',
                    variants: [
                        { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], stock: 28 },
                        { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 24 },
                        { color: 'Xám', colorCode: '#808080', sizes: ['S', 'M', 'L', 'XL'], stock: 20 }
                    ],
                    stock: 72,
                    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
                    rating: 4.7,
                    numReviews: 145,
                    totalSold: 290
                },
                {
                    name: 'Quần Âu Mỏng Mùa Hè',
                    price: 620000,
                    originalPrice: 920000,
                    description: 'Quần âu mỏng toàn mỗi mùa hè',
                    material: 'Linen Cotton',
                    collectionName: 'First Class',
                    variants: [
                        { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 16 },
                        { color: 'Xám Nhạt', colorCode: '#D3D3D3', sizes: ['S', 'M', 'L', 'XL'], stock: 14 },
                        { color: 'Khaki', colorCode: '#F0E68C', sizes: ['S', 'M', 'L'], stock: 12 }
                    ],
                    stock: 42,
                    image: 'https://images.unsplash.com/photo-1594938361394-fdf6cb295e37?auto=format&fit=crop&w=600&q=80',
                    rating: 4.6,
                    numReviews: 87,
                    totalSold: 174
                },
                {
                    name: 'Áo Sơ Mi Tay Lỡ Mùa Hè',
                    price: 580000,
                    originalPrice: 850000,
                    description: 'Áo sơ mi tay lỡ thoáng khí cho mùa hè',
                    material: 'Linen Blend',
                    collectionName: 'Spring Summer 2026',
                    variants: [
                        { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 18 },
                        { color: 'Xanh Nhạt', colorCode: '#B0D4E3', sizes: ['S', 'M', 'L', 'XL'], stock: 15 },
                        { color: 'Hồng Coral', colorCode: '#FF7F50', sizes: ['S', 'M', 'L'], stock: 12 }
                    ],
                    stock: 45,
                    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
                    rating: 4.7,
                    numReviews: 102,
                    totalSold: 204
                }
            ],
            // ─── 9 NEW COLLECTION CATEGORIES ─────────────────────────
            // SẢN PHẨM ĐẶC TRƯNG Group - 4 new categories
            'Áo Sơ Mi (Shirt Edit)': Array.from({ length: 13 }, (_, i) => ({
                name: `Áo Sơ Mi ${i + 1}`,
                price: 450000 + (i * 10000),
                originalPrice: 700000 + (i * 15000),
                description: `Áo sơ mi chất lượng cao #${i + 1}`,
                material: 'Cotton 100%',
                collectionName: 'Shirt Collection',
                variants: [
                    { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 15 },
                    { color: 'Navy', colorCode: '#001F3F', sizes: ['S', 'M', 'L', 'XL'], stock: 13 },
                    { color: 'Xanh Nhạt', colorCode: '#B0D4E3', sizes: ['S', 'M', 'L'], stock: 11 }
                ],
                stock: 39,
                image: `https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80`,
                rating: 4.5 + (i * 0.02),
                numReviews: 45 + (i * 3),
                totalSold: 90 + (i * 6)
            })),
            'Áo Thun (T-Shirt Edit)': Array.from({ length: 13 }, (_, i) => ({
                name: `Áo Thun Premium #${i + 1}`,
                price: 280000 + (i * 8000),
                originalPrice: 450000 + (i * 12000),
                description: `Áo thun premium chất liệu tốt #${i + 1}`,
                material: 'Cotton Premium',
                collectionName: 'T-Shirt Essentials',
                variants: [
                    { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], stock: 20 },
                    { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 18 },
                    { color: 'Xám', colorCode: '#808080', sizes: ['S', 'M', 'L', 'XL'], stock: 16 }
                ],
                stock: 54,
                image: `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80`,
                rating: 4.6 + (i * 0.01),
                numReviews: 52 + (i * 4),
                totalSold: 104 + (i * 8)
            })),
            'Áo Khoác (Outerwear Edit)': Array.from({ length: 13 }, (_, i) => ({
                name: `Áo Khoác Cao Cấp #${i + 1}`,
                price: 950000 + (i * 20000),
                originalPrice: 1400000 + (i * 30000),
                description: `Áo khoác thiết kế cao cấp #${i + 1}`,
                material: 'Wool Blend',
                collectionName: 'Premium Outerwear',
                variants: [
                    { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 12 },
                    { color: 'Xám Đen', colorCode: '#2F4F4F', sizes: ['S', 'M', 'L', 'XL'], stock: 11 },
                    { color: 'Camel', colorCode: '#C19A6B', sizes: ['S', 'M', 'L'], stock: 10 }
                ],
                stock: 33,
                image: `https://images.unsplash.com/photo-1551028719-00167b16ebc5?auto=format&fit=crop&w=600&q=80`,
                rating: 4.7 + (i * 0.01),
                numReviews: 38 + (i * 2),
                totalSold: 76 + (i * 4)
            })),
            'Quần Jeans (Denim Edit)': Array.from({ length: 13 }, (_, i) => ({
                name: `Quần Jeans Trendy #${i + 1}`,
                price: 580000 + (i * 15000),
                originalPrice: 850000 + (i * 22000),
                description: `Quần jeans xu hướng #${i + 1}`,
                material: 'Denim 100%',
                collectionName: 'Denim Collection',
                variants: [
                    { color: 'Xanh Đậm', colorCode: '#00008B', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 16 },
                    { color: 'Xanh Nhạt', colorCode: '#87CEEB', sizes: ['S', 'M', 'L', 'XL'], stock: 14 },
                    { color: 'Đen', colorCode: '#000000', sizes: ['S', 'M', 'L'], stock: 12 }
                ],
                stock: 42,
                image: `https://images.unsplash.com/photo-1542272604-787c62d465d1?auto=format&fit=crop&w=600&q=80`,
                rating: 4.5 + (i * 0.02),
                numReviews: 61 + (i * 5),
                totalSold: 122 + (i * 10)
            })),
            // THEO MÙA Group - 3 new categories
            'Thu Đông 2026': Array.from({ length: 13 }, (_, i) => ({
                name: `Áo Thu Đông #${i + 1}`,
                price: 620000 + (i * 18000),
                originalPrice: 920000 + (i * 27000),
                description: `Thiết kế thu đông ấm áp #${i + 1}`,
                material: 'Cotton Wool',
                collectionName: 'Fall Winter 2026',
                variants: [
                    { color: 'Nâu', colorCode: '#8B4513', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 14 },
                    { color: 'Xám', colorCode: '#A9A9A9', sizes: ['S', 'M', 'L', 'XL'], stock: 13 },
                    { color: 'Xanh Than', colorCode: '#228B22', sizes: ['S', 'M', 'L'], stock: 11 }
                ],
                stock: 38,
                image: `https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80`,
                rating: 4.6 + (i * 0.01),
                numReviews: 47 + (i * 3),
                totalSold: 94 + (i * 6)
            })),
            'Lookbook Casual': Array.from({ length: 13 }, (_, i) => ({
                name: `Casual Wear #${i + 1}`,
                price: 420000 + (i * 12000),
                originalPrice: 650000 + (i * 18000),
                description: `Phong cách casual thoải mái #${i + 1}`,
                material: 'Cotton Blend',
                collectionName: 'Casual Essentials',
                variants: [
                    { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 17 },
                    { color: 'Kem', colorCode: '#FFFDD0', sizes: ['S', 'M', 'L', 'XL'], stock: 15 },
                    { color: 'Xanh Lá', colorCode: '#90EE90', sizes: ['S', 'M', 'L'], stock: 13 }
                ],
                stock: 45,
                image: `https://images.unsplash.com/photo-1552062407-c551eeda4ac5?auto=format&fit=crop&w=600&q=80`,
                rating: 4.5 + (i * 0.02),
                numReviews: 55 + (i * 4),
                totalSold: 110 + (i * 8)
            })),
            'Essentials Basics': Array.from({ length: 13 }, (_, i) => ({
                name: `Basic Essential #${i + 1}`,
                price: 240000 + (i * 7000),
                originalPrice: 400000 + (i * 11000),
                description: `Những món đồ cơ bản không thể thiếu #${i + 1}`,
                material: 'Cotton 100%',
                collectionName: 'Timeless Basics',
                variants: [
                    { color: 'Trắng', colorCode: '#FFFFFF', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], stock: 22 },
                    { color: 'Đen', colorCode: '#000000', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 20 },
                    { color: 'Navy', colorCode: '#001F3F', sizes: ['S', 'M', 'L', 'XL'], stock: 18 }
                ],
                stock: 60,
                image: `https://images.unsplash.com/photo-1554062407-98eeb840d6f7?auto=format&fit=crop&w=600&q=80`,
                rating: 4.4 + (i * 0.02),
                numReviews: 67 + (i * 5),
                totalSold: 134 + (i * 10)
            })),
            // THEO DỊP Group - 2 new categories
            'Tết / Valentine': Array.from({ length: 13 }, (_, i) => ({
                name: `Tết Valentine #${i + 1}`,
                price: 780000 + (i * 18000),
                originalPrice: 1150000 + (i * 27000),
                description: `Bộ sưu tập Tết và Valentine #${i + 1}`,
                material: 'Silk Cotton',
                collectionName: 'Festive Collection',
                variants: [
                    { color: 'Đỏ', colorCode: '#FF0000', sizes: ['XS', 'S', 'M', 'L'], stock: 13 },
                    { color: 'Hồng', colorCode: '#FFC0CB', sizes: ['S', 'M', 'L', 'XL'], stock: 14 },
                    { color: 'Vàng Kim', colorCode: '#FFD700', sizes: ['S', 'M', 'L'], stock: 11 }
                ],
                stock: 38,
                image: `https://images.unsplash.com/photo-1612036782180-69c73116e76f?auto=format&fit=crop&w=600&q=80`,
                rating: 4.7 + (i * 0.01),
                numReviews: 43 + (i * 3),
                totalSold: 86 + (i * 6)
            })),
            'Giáng Sinh / Năm Mới': Array.from({ length: 13 }, (_, i) => ({
                name: `Giáng Sinh Năm Mới #${i + 1}`,
                price: 720000 + (i * 16000),
                originalPrice: 1080000 + (i * 24000),
                description: `Bộ sưu tập Giáng Sinh và Năm Mới #${i + 1}`,
                material: 'Premium Cotton',
                collectionName: 'Holiday Season',
                variants: [
                    { color: 'Đỏ Noel', colorCode: '#DC143C', sizes: ['XS', 'S', 'M', 'L'], stock: 12 },
                    { color: 'Xanh Lục', colorCode: '#228B22', sizes: ['S', 'M', 'L', 'XL'], stock: 13 },
                    { color: 'Bạc Kim', colorCode: '#C0C0C0', sizes: ['S', 'M', 'L'], stock: 10 }
                ],
                stock: 35,
                image: `https://images.unsplash.com/photo-1512327122986-92e9cdb7deee?auto=format&fit=crop&w=600&q=80`,
                rating: 4.6 + (i * 0.01),
                numReviews: 39 + (i * 3),
                totalSold: 78 + (i * 6)
            }))
        };

        // Seed products for selected categories
        let seedCount = 0;
        for (const [catName, products] of Object.entries(collectionData)) {
            const catId = catMap[catName];
            if (!catId) {
                console.warn(`⚠️  Category "${catName}" not found. Skipping.`);
                continue;
            }

            console.log(`📦 Seeding ${products.length} products for "${catName}"...`);

            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                try {
                    const baseProduct = {
                        ...product,
                        category: catId,
                        status: product.stock > 20 ? 'Active' : (product.stock > 0 ? 'Low Stock' : 'Out of Stock')
                    };
                    await Product.create(baseProduct);
                    seedCount++;
                } catch (err) {
                    console.error(`❌ Failed to seed product ${i + 1} in "${catName}": ${err.message}`);
                }
            }
        }

        console.log(`\n✅ Seeded ${seedCount} collection products successfully!`);
        process.exit();
    } catch (error) {
        console.error(`❌ Seed error: ${error.message}`);
        process.exit(1);
    }
};

seedCollections();
