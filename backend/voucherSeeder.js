const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Voucher = require('./models/Voucher');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const vouchers = [
  {
    code: 'AURELIA10',
    description: 'Giảm 10% cho đơn hàng đầu tiên',
    discountType: 'percent',
    discountAmount: 10,
    minOrderValue: 0,
    expirationDate: new Date('2026-12-31'),
    isActive: true
  },
  {
    code: 'LUXURY500K',
    description: 'Giảm 500,000đ cho đơn hàng từ 5,000,000đ',
    discountType: 'fixed',
    discountAmount: 500000,
    minOrderValue: 5000000,
    expirationDate: new Date('2026-12-31'),
    isActive: true
  },
  {
    code: 'FREESHIP',
    description: 'Giảm 30,000đ phí vận chuyển',
    discountType: 'fixed',
    discountAmount: 30000,
    minOrderValue: 500000,
    expirationDate: new Date('2026-12-31'),
    isActive: true
  },
  {
    code: 'ATOMIC',
    description: 'Giảm giá cực mạnh - 50%',
    discountType: 'percent',
    discountAmount: 50,
    minOrderValue: 1000000,
    expirationDate: new Date('2026-12-31'),
    isActive: true
  }
];

const seedVouchers = async () => {
  try {
    await Voucher.deleteMany();
    await Voucher.insertMany(vouchers);
    console.log('✅ Voucher seeding completed successfully.');
    process.exit();
  } catch (error) {
    console.error(`❌ Error during voucher seeding: ${error.message}`);
    process.exit(1);
  }
};

seedVouchers();
