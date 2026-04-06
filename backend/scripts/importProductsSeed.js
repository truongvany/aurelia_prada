const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const connectDB = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');

dotenv.config();

function createSlugFromName(name) {
  if (!name) return null;
  return name
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const noWipe = args.includes('--no-wipe');
  const fileArg = args.find((arg) => !arg.startsWith('--'));
  const defaultFile = path.join(__dirname, '..', 'seeds', 'products.seed.json');

  return {
    seedFilePath: fileArg ? path.resolve(process.cwd(), fileArg) : defaultFile,
    wipeBeforeImport: !noWipe,
  };
}

function readSeedFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Seed file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const payload = JSON.parse(raw);

  if (!payload || !Array.isArray(payload.products)) {
    throw new Error('Invalid seed file format: products array is required.');
  }

  return payload;
}

async function ensureCategories(payload) {
  const categorySource = new Map();

  if (Array.isArray(payload.categories)) {
    payload.categories.forEach((category) => {
      const slug = category?.slug || createSlugFromName(category?.name);
      if (!slug) return;
      categorySource.set(slug, {
        name: category?.name || slug,
        slug,
        description: category?.description || '',
        group: category?.group || '',
      });
    });
  }

  payload.products.forEach((product) => {
    const slug = product?.categorySlug || createSlugFromName(product?.categoryName);
    if (!slug || categorySource.has(slug)) return;

    categorySource.set(slug, {
      name: product?.categoryName || slug,
      slug,
      description: '',
      group: '',
    });
  });

  const categoryIdBySlug = new Map();

  for (const [slug, categorySeed] of categorySource.entries()) {
    let categoryDoc = await Category.findOne({ slug });

    if (!categoryDoc && categorySeed.name) {
      categoryDoc = await Category.findOne({ name: categorySeed.name });
    }

    if (!categoryDoc) {
      categoryDoc = await Category.create({
        name: categorySeed.name,
        slug,
        description: categorySeed.description,
        group: categorySeed.group,
      });
    }

    categoryIdBySlug.set(slug, categoryDoc._id);
  }

  return categoryIdBySlug;
}

function normalizeVariants(variants) {
  if (!Array.isArray(variants)) return [];

  return variants.map((variant) => ({
    color: variant?.color || '',
    colorCode: variant?.colorCode || '',
    images: Array.isArray(variant?.images) ? variant.images : [],
    sizes: Array.isArray(variant?.sizes) ? variant.sizes : [],
    stock: Number.isFinite(variant?.stock) ? variant.stock : 0,
  }));
}

function toDateOrUndefined(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function createProductDocs(products, categoryIdBySlug) {
  return products.map((product) => {
    const categorySlug = product?.categorySlug || createSlugFromName(product?.categoryName);
    const categoryId = categorySlug ? categoryIdBySlug.get(categorySlug) : null;

    if (!categoryId) {
      throw new Error(`Cannot map category for product: ${product?.name || 'unknown product'}`);
    }

    const doc = {
      name: product?.name ?? '',
      description: product?.description ?? undefined,
      price: product?.price ?? 0,
      originalPrice: product?.originalPrice ?? undefined,
      category: categoryId,
      variants: normalizeVariants(product?.variants),
      stock: product?.stock ?? 0,
      images: Array.isArray(product?.images) ? product.images : [],
      image: product?.image ?? undefined,
      badge: product?.badge ?? undefined,
      material: product?.material ?? undefined,
      sizeGuideImage: product?.sizeGuideImage ?? undefined,
      collectionName: product?.collectionName ?? undefined,
      status: product?.status ?? undefined,
      rating: product?.rating ?? undefined,
      numReviews: product?.numReviews ?? undefined,
      totalSold: product?.totalSold ?? undefined,
      createdAt: toDateOrUndefined(product?.createdAt),
      updatedAt: toDateOrUndefined(product?.updatedAt),
    };

    if (product?._id && mongoose.Types.ObjectId.isValid(product._id)) {
      doc._id = new mongoose.Types.ObjectId(product._id);
    }

    return doc;
  });
}

async function importProductsSeed() {
  const { seedFilePath, wipeBeforeImport } = parseArgs();
  const payload = readSeedFile(seedFilePath);

  await connectDB();

  try {
    const categoryIdBySlug = await ensureCategories(payload);
    const productDocs = createProductDocs(payload.products, categoryIdBySlug);

    if (wipeBeforeImport) {
      await Product.deleteMany({});
      await Product.insertMany(productDocs, { ordered: false });
      console.log(`✅ Imported ${productDocs.length} products (wipe mode) from: ${seedFilePath}`);
    } else {
      for (const doc of productDocs) {
        const filter = doc._id ? { _id: doc._id } : { name: doc.name, category: doc.category };
        await Product.findOneAndUpdate(filter, doc, {
          upsert: true,
          returnDocument: 'after',
          runValidators: true,
          setDefaultsOnInsert: true,
        });
      }
      console.log(`✅ Imported ${productDocs.length} products (upsert mode) from: ${seedFilePath}`);
    }
  } catch (error) {
    console.error('❌ Failed to import product seed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

importProductsSeed();
