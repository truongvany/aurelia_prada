const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const { startTryOnCleanupScheduler } = require('./services/tryOnCleanupService');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 image uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Load Routes
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const tryOnRoutes = require('./routes/tryOnRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/tryon', tryOnRoutes);
app.use('/api/settings', settingsRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Aurelia Prada API is running...');
});

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('Error:', err.message);
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✨ Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api\n`);
  startTryOnCleanupScheduler();
});
