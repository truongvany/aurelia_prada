const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const connectDB = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');

dotenv.config();

function normalizeDate(input) {
  if (!input) return null;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeVariant(variant) {
  return {
    color: variant?.color || '',
    colorCode: variant?.colorCode || '',
    images: Array.isArray(variant?.images) ? variant.images : [],
    sizes: Array.isArray(variant?.sizes) ? variant.sizes : [],
    stock: Number.isFinite(variant?.stock) ? variant.stock : 0,
  };
}

function normalizeProduct(product, categoryMap) {
  const categoryId = product?.category ? String(product.category) : null;
  const category = categoryId ? categoryMap.get(categoryId) : null;

  return {
    _id: String(product._id),
    name: product?.name ?? null,
    description: product?.description ?? null,
    price: product?.price ?? null,
    originalPrice: product?.originalPrice ?? null,
    categoryId,
    categorySlug: category?.slug ?? null,
    categoryName: category?.name ?? null,
    variants: Array.isArray(product?.variants)
      ? product.variants.map((variant) => normalizeVariant(variant))
      : [],
    stock: product?.stock ?? 0,
    images: Array.isArray(product?.images) ? product.images : [],
    image: product?.image ?? null,
    badge: product?.badge ?? null,
    material: product?.material ?? null,
    sizeGuideImage: product?.sizeGuideImage ?? null,
    collectionName: product?.collectionName ?? null,
    status: product?.status ?? null,
    rating: product?.rating ?? null,
    numReviews: product?.numReviews ?? null,
    totalSold: product?.totalSold ?? null,
    createdAt: normalizeDate(product?.createdAt),
    updatedAt: normalizeDate(product?.updatedAt),
  };
}

async function exportProductsSeed() {
  await connectDB();

  try {
    const [categories, products] = await Promise.all([
      Category.find({}).lean(),
      Product.find({}).sort({ createdAt: 1, _id: 1 }).lean(),
    ]);

    const categoryMap = new Map(
      categories.map((category) => [String(category._id), {
        _id: String(category._id),
        name: category.name ?? null,
        slug: category.slug ?? null,
        description: category.description ?? null,
        group: category.group ?? null,
      }])
    );

    const normalizedProducts = products.map((product) => normalizeProduct(product, categoryMap));

    const output = {
      meta: {
        exportedAt: new Date().toISOString(),
        sourceDatabase: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aurelia_prada',
        seedFormatVersion: 1,
        productCount: normalizedProducts.length,
        categoryCount: categories.length,
      },
      categories: Array.from(categoryMap.values()),
      products: normalizedProducts,
    };

    const outputDir = path.join(__dirname, '..', 'seeds');
    const outputPath = path.join(outputDir, 'products.seed.json');

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

    console.log(`✅ Exported ${normalizedProducts.length} products to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Failed to export product seed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

exportProductsSeed();
