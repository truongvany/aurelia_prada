const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const customersRouter = require('./routes/customers');
const authRouter = require('./routes/auth');

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/customers', customersRouter);

// Basic route
app.get('/', (req, res) => {
  res.send('Aurelia Prada API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✨ Server is running on http://localhost:${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api\n`);
});
