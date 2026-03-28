const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    color: {
      type: String,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    image: {
      type: String,
    },
    badge: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Low Stock', 'Out of Stock'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Method to automatically update status based on stock before save
productSchema.pre('save', function (next) {
  if (this.stock <= 0) {
    this.status = 'Out of Stock';
  } else if (this.stock <= 20) {
    this.status = 'Low Stock';
  } else {
    this.status = 'Active';
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
