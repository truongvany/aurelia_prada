const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Product seeding data
const productsData = {
  'Dresses': [
    {
      name: 'Đầm họa tiết Springlight Floral',
      price: 1690000,
      originalPrice: null,
      color: 'Champagne',
      image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/b1dc876b0be0daccf2f3d334cfcf27d6.webp',
      badge: 'New'
    },
    {
      name: 'Đầm hoa xanh Spring Pastel',
      price: 716000,
      originalPrice: 1790000,
      color: 'Ivory',
      image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/e4ce118778e8f39af38a2ecabe204b4a.webp',
      badge: '-60%'
    }
  ],
  'Bottoms': [
    {
      name: 'Quần tây dáng suông Melange',
      price: 1590000,
      originalPrice: null,
      color: 'Ivory',
      image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/5ed8763b426af135a4cc0f688bd9f1bd.webp',
      badge: 'New'
    }
  ],
  'Tops': [
    {
      name: 'Áo sơ mi họa tiết Spring Mosaic',
      price: 1390000,
      originalPrice: null,
      color: 'Black',
      image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/554530918643b20e07f912d8d7650e02.webp',
      badge: 'New'
    },
    {
      name: 'Áo sơ mi cổ nơ Nâu Tây',
      price: 1290000,
      originalPrice: null,
      color: 'Sage',
      image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/db9f5609e5deba38d07272d7496b6ae5.webp',
      badge: 'New'
    },
    {
      name: 'Áo sơ mi phối túi Beige',
      price: 534000,
      originalPrice: 890000,
      color: 'Black',
      image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/4c7f2683847186c00369b3b52d048d31.webp',
      badge: '-40%'
    },
    {
      name: 'Áo sơ mi xếp ly Tencel Matcha',
      price: 850500,
      originalPrice: 1890000,
      color: 'Oat',
      image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/be3375421aa04748b10c0b594b07e0b5.webp',
      badge: '-55%'
    },
    {
      name: 'Áo Croptop đính hoa vai',
      price: 876000,
      originalPrice: 2190000,
      color: 'Oat',
      image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/60007f762225d9dd32fd5c0e9a28e1da.webp',
      badge: '-60%'
    }
  ]
};

async function initDb() {
  let pool;
  try {
    // Initial connection without database to create it
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const dbName = process.env.DB_NAME || 'aurelia_prada';
    console.log(`\n🔧 Creating database ${dbName} if it doesn't exist...`);
    
    let connection = await pool.getConnection();
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    connection.release();

    // Create a new pool with the database name
    const dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    connection = await dbPool.getConnection();

    // Clear existing tables (in reverse order of dependencies)
    console.log('\n🗑️  Clearing old data...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DROP TABLE IF EXISTS order_items');
    await connection.query('DROP TABLE IF EXISTS orders');
    await connection.query('DROP TABLE IF EXISTS products');
    await connection.query('DROP TABLE IF EXISTS categories');
    await connection.query('DROP TABLE IF EXISTS users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Old data cleared');

    // 1. Create Users table
    console.log('\n📋 Creating users table...');
    await connection.query(`
      CREATE TABLE users (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        name            VARCHAR(255) NOT NULL,
        email           VARCHAR(255) NOT NULL UNIQUE,
        password        VARCHAR(255) NOT NULL,
        role            VARCHAR(50) NOT NULL DEFAULT 'user',
        phone           VARCHAR(50),
        
        street          VARCHAR(255),
        city            VARCHAR(100),
        state           VARCHAR(100),
        zip_code        VARCHAR(20),
        country         VARCHAR(100),
        
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        CONSTRAINT check_role CHECK (role IN ('user', 'admin')),
        INDEX idx_users_email (email),
        INDEX idx_users_role (role)
      )
    `);

    // 2. Create Categories table
    console.log('📋 Creating categories table...');
    await connection.query(`
      CREATE TABLE categories (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        name            VARCHAR(255) NOT NULL UNIQUE,
        description     TEXT,
        slug            VARCHAR(255) NOT NULL UNIQUE,
        
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_categories_slug (slug)
      )
    `);

    // 3. Create Products table
    console.log('📋 Creating products table...');
    await connection.query(`
      CREATE TABLE products (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        name            VARCHAR(255) NOT NULL,
        description     TEXT,
        price           DECIMAL(12, 2) NOT NULL,
        original_price  DECIMAL(12, 2),
        category_id     INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        color           VARCHAR(100),
        stock           INT NOT NULL DEFAULT 100,
        image           TEXT,
        badge           VARCHAR(50),
        status          VARCHAR(50) NOT NULL DEFAULT 'Active',
        
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        CONSTRAINT check_status CHECK (status IN ('Active', 'Low Stock', 'Out of Stock')),
        INDEX idx_products_category (category_id),
        INDEX idx_products_status (status)
      )
    `);

    // 4. Create Orders table
    console.log('📋 Creating orders table...');
    await connection.query(`
      CREATE TABLE orders (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        user_id         INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        
        shipping_street VARCHAR(255),
        shipping_city   VARCHAR(100),
        shipping_state  VARCHAR(100),
        shipping_zip_code VARCHAR(20),
        shipping_country VARCHAR(100),
        
        payment_method  VARCHAR(100),
        payment_result  JSON,
        
        items_price     DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        tax_price       DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        shipping_price  DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        total_price     DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        
        is_paid         BOOLEAN NOT NULL DEFAULT FALSE,
        paid_at         TIMESTAMP NULL,
        
        is_delivered    BOOLEAN NOT NULL DEFAULT FALSE,
        delivered_at    TIMESTAMP NULL,
        
        status          VARCHAR(50) NOT NULL DEFAULT 'Processing',
        
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        CONSTRAINT check_order_status CHECK (status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')),
        INDEX idx_orders_user (user_id),
        INDEX idx_orders_status (status)
      )
    `);

    // 5. Create Order Items table
    console.log('📋 Creating order_items table...');
    await connection.query(`
      CREATE TABLE order_items (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        order_id        INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id      INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        name            VARCHAR(255) NOT NULL,
        quantity        INT NOT NULL CHECK (quantity > 0),
        price           DECIMAL(12, 2) NOT NULL,
        image           TEXT,
        
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_order_items_order (order_id),
        INDEX idx_order_items_product (product_id)
      )
    `);

    // Seed data
    console.log('\n🌱 Seeding data...');

    // Seed categories
    console.log('  📌 Seeding categories...');
    const categories = Object.keys(productsData);
    const categoryIds = {};
    
    for (const category of categories) {
      const slug = category.toLowerCase().replace(/\s+/g, '-');
      const result = await connection.query(
        'INSERT INTO categories (name, slug) VALUES (?, ?)',
        [category, slug]
      );
      categoryIds[category] = result[0].insertId;
      console.log(`    ✅ ${category}`);
    }

    // Seed products
    console.log('  📌 Seeding products...');
    let productCount = 0;
    for (const [category, products] of Object.entries(productsData)) {
      for (const product of products) {
        const status = product.stock <= 0 ? 'Out of Stock' : (product.stock <= 20 ? 'Low Stock' : 'Active');
        await connection.query(
          `INSERT INTO products 
           (name, price, original_price, category_id, color, image, badge, stock, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.name,
            product.price,
            product.originalPrice,
            categoryIds[category],
            product.color,
            product.image,
            product.badge,
            100,
            status
          ]
        );
        productCount++;
      }
    }
    console.log(`    ✅ Added ${productCount} products`);

    // Seed default admin user
    console.log('  📌 Seeding default admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminEmail = 'admin@aureliaprda.com';
    
    try {
      await connection.query(
        `INSERT INTO users (name, email, password, role, phone, city, country) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'Admin',
          adminEmail,
          adminPassword,
          'admin',
          '+84 898 123 456',
          'Ho Chi Minh',
          'Vietnam'
        ]
      );
      console.log(`    ✅ Admin user: ${adminEmail} / Password: admin123`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`    ℹ️  Admin user already exists`);
      } else {
        throw error;
      }
    }

    // Seed demo customer
    console.log('  📌 Seeding demo customer user...');
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customerEmail = 'customer@aureliaprda.com';
    
    try {
      await connection.query(
        `INSERT INTO users (name, email, password, role, phone, street, city, country) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Jane Doe',
          customerEmail,
          customerPassword,
          'user',
          '+84 912 345 678',
          '123 Nguyen Hue Boulevard',
          'Ho Chi Minh',
          'Vietnam'
        ]
      );
      console.log(`    ✅ Customer user: ${customerEmail} / Password: customer123`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`    ℹ️  Customer user already exists`);
      } else {
        throw error;
      }
    }

    connection.release();
    await dbPool.end();

    console.log('\n✨ Database initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Admin user created`);
    console.log(`   - Customer user created`);
    console.log('\n💡 You can now start the server with: npm start');

  } catch (error) {
    console.error('\n❌ Error initializing database:');
    console.error(error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  initDb();
}

module.exports = { initDb };
