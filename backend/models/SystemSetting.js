const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    brandName: {
      type: String,
      default: 'AURELIA PRADA',
    },
    supportEmail: {
      type: String,
      default: 'concierge@aureliaprada.com',
    },
    hotline: {
      type: String,
      default: '+84 (0) 898 123 456',
    },
    currency: {
      type: String,
      default: 'VND',
    },
    headOfficeAddress: {
      type: String,
      default: '123 Dai lo Cao Cap, Quan 1, Thanh pho Ho Chi Minh, Viet Nam',
    },
    bankConfig: {
      bankCode: {
        type: String,
        default: 'VCB',
      },
      bankName: {
        type: String,
        default: 'Vietcombank',
      },
      accountName: {
        type: String,
        default: 'AURELIA PRADA',
      },
      accountNumber: {
        type: String,
        default: '1234567890',
      },
      branch: {
        type: String,
        default: 'Chi nhanh TP. Ho Chi Minh',
      },
    },
    momoConfig: {
      phone: {
        type: String,
        default: '0901234567',
      },
      name: {
        type: String,
        default: 'AURELIA PRADA',
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);

module.exports = SystemSetting;
