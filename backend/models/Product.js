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
    variants: [{
      color: { type: String, required: true }, // e.g., 'Trắng'
      colorCode: { type: String },              // e.g., '#FFFFFF'
      images: [{ type: String }],               // Specific images for this color
      sizes: [{ type: String }],                // Sizes available for this color
      stock: { type: Number, default: 0 }       // Stock for this specific variant
    }],
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    images: [{
      type: String,
    }],
    image: { // Main image for backwards compatibility or single view
      type: String,
    },
    badge: {
      type: String,
    },
    material: {
      type: String,
    },
    sizeGuideImage: {
      type: String,
    },
    collectionName: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Low Stock', 'Out of Stock'],
      default: 'Active',
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    totalSold: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Method to automatically update status based on stock before save
productSchema.pre('save', function () {
  if (this.stock <= 0) {
    this.status = 'Out of Stock';
  } else if (this.stock <= 20) {
    this.status = 'Low Stock';
  } else {
    this.status = 'Active';
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
