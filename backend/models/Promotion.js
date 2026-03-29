const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed_amount', 'combo_quantity'],
      // percentage: x% off
      // fixed_amount: fixed amount off a single item
      // combo_quantity: buy minQuantity get discountValue off total (e.g. buy 3 get 500k off or x% off depending on combination)
    },
    discountValue: {
      type: Number,
      required: true,
      // If type is percentage, value is 1-100. If fixed_amount, value is money.
    },
    minQuantity: {
      type: Number,
      default: 1,
      // For combo_quantity, e.g. Buy 2 get 10% obj. If not combo, default is 1.
    },
    targetProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    applyToAll: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to set status automatically, you can add hooks here if needed

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
