const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');

const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const seedData = async () => {
  try {
    // Clear all existing data from the database
    // BE CAREFUL running this script
    await Order.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log('🗑️  Data cleared.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('customer123', salt);

    const createdUsers = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@aureliaprda.com',
        password: adminPassword,
        role: 'admin',
        phone: '+84 898 123 456',
        address: {
          street: '123 Admin Ave',
          city: 'Ho Chi Minh Ciy',
          state: 'SG',
          zipCode: '700000',
          country: 'Vietnam'
        }
      },
      {
        name: 'Jane Doe',
        email: 'customer@aureliaprda.com',
        password: userPassword,
        role: 'user',
        phone: '+84 912 345 678',
        address: {
          street: '456 Customer Blvd',
          city: 'Ho Chi Minh City',
          state: 'SG',
          zipCode: '700000',
          country: 'Vietnam'
        }
      }
    ]);

    const adminUser = createdUsers[0]._id;

    console.log('👤 Users seeded.');

    // 2. Create Categories
    const categoriesToCreate = [
      { name: 'Dresses', slug: 'dresses' },
      { name: 'Tops', slug: 'tops' },
      { name: 'Bottoms', slug: 'bottoms' },
      { name: 'Outerwear', slug: 'outerwear' },
      { name: 'Shoes', slug: 'shoes' },
    ];

    const createdCategories = await Category.insertMany(categoriesToCreate);
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    console.log('🏷️  Categories seeded.');

    // 3. Create Products
    const productsToCreate = [
      {
        name: 'Đầm họa tiết Springlight Floral',
        price: 1690000,
        originalPrice: null,
        category: categoryMap['Dresses'],
        color: 'Champagne',
        image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/b1dc876b0be0daccf2f3d334cfcf27d6.webp',
        badge: 'New',
        stock: 50,
      },
      {
        name: 'Áo sơ mi họa tiết Spring Mosaic',
        price: 1390000,
        originalPrice: null,
        category: categoryMap['Tops'],
        color: 'Black',
        image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/554530918643b20e07f912d8d7650e02.webp',
        badge: 'New',
        stock: 25,
      },
      {
        name: 'Quần tây dáng suông Melange',
        price: 1590000,
        originalPrice: null,
        category: categoryMap['Bottoms'],
        color: 'Ivory',
        image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/5ed8763b426af135a4cc0f688bd9f1bd.webp',
        badge: 'New',
        stock: 10,
      }
    ];

    const seededProducts = await Product.insertMany(productsToCreate);

    console.log('👚 Products seeded.');

    // 4. Create Sample Orders
    const customer = createdUsers[1]._id;
    const ordersToCreate = [
      {
        user: customer,
        orderItems: [
          {
            name: seededProducts[0].name,
            qty: 1,
            image: seededProducts[0].image,
            price: seededProducts[0].price,
            product: seededProducts[0]._id,
          }
        ],
        shippingAddress: {
          street: '456 Customer Blvd',
          city: 'Ho Chi Minh City',
          state: 'SG',
          zipCode: '700000',
          country: 'Vietnam'
        },
        paymentMethod: 'COD',
        itemsPrice: seededProducts[0].price,
        taxPrice: 0,
        shippingPrice: 30000,
        totalPrice: seededProducts[0].price + 30000,
        isPaid: true,
        paidAt: new Date(),
        status: 'Delivered',
        createdAt: new Date()
      },
      {
        user: customer,
        orderItems: [
          {
            name: seededProducts[1].name,
            qty: 2,
            image: seededProducts[1].image,
            price: seededProducts[1].price,
            product: seededProducts[1]._id,
          }
        ],
        shippingAddress: {
          street: '456 Customer Blvd',
          city: 'Ho Chi Minh City',
          state: 'SG',
          zipCode: '700000',
          country: 'Vietnam'
        },
        paymentMethod: 'COD',
        itemsPrice: seededProducts[1].price * 2,
        taxPrice: 0,
        shippingPrice: 30000,
        totalPrice: (seededProducts[1].price * 2) + 30000,
        isPaid: true,
        paidAt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        status: 'Delivered',
        createdAt: new Date(new Date().setMonth(new Date().getMonth() - 1))
      },
      {
        user: customer,
        orderItems: [
          {
            name: seededProducts[2].name,
            qty: 1,
            image: seededProducts[2].image,
            price: seededProducts[2].price,
            product: seededProducts[2]._id,
          }
        ],
        shippingAddress: {
          street: '456 Customer Blvd',
          city: 'Ho Chi Minh City',
          state: 'SG',
          zipCode: '700000',
          country: 'Vietnam'
        },
        paymentMethod: 'COD',
        itemsPrice: seededProducts[2].price,
        taxPrice: 0,
        shippingPrice: 30000,
        totalPrice: seededProducts[2].price + 30000,
        isPaid: true,
        paidAt: new Date(new Date().setMonth(new Date().getMonth() - 2)),
        status: 'Delivered',
        createdAt: new Date(new Date().setMonth(new Date().getMonth() - 2))
      }
    ];

    await Order.insertMany(ordersToCreate);
    console.log('📦 Sample Orders seeded.');

    console.log('🌱 Database initialized perfectly!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error with data import: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();
        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error with data destroy: ${error.message}`);
        process.exit(1);
    }
}

if(process.argv[2] === '-d'){
    destroyData()
} else {
    seedData()
}
