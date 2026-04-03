require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Cart = require('../models/Cart');

async function run() {
  try {
    await connectDB();
    const result = await Cart.deleteMany({});
    console.log(`Da xoa ${result.deletedCount} gio hang.`);
  } catch (error) {
    console.error('Reset gio hang that bai:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();
