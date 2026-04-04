const SystemSetting = require('../models/SystemSetting');

function normalizeString(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  return value.trim();
}

async function getOrCreateSystemSetting() {
  let setting = await SystemSetting.findOne({ singletonKey: 'default' });
  if (!setting) {
    setting = await SystemSetting.create({ singletonKey: 'default' });
  }
  return setting;
}

// @desc    Get settings for admin
// @route   GET /api/settings/admin
// @access  Private/Admin
const getAdminSettings = async (req, res) => {
  try {
    const setting = await getOrCreateSystemSetting();
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update settings for admin
// @route   PUT /api/settings/admin
// @access  Private/Admin
const updateAdminSettings = async (req, res) => {
  try {
    const setting = await getOrCreateSystemSetting();
    const payload = req.body || {};

    setting.brandName = normalizeString(payload.brandName, setting.brandName);
    setting.supportEmail = normalizeString(payload.supportEmail, setting.supportEmail);
    setting.hotline = normalizeString(payload.hotline, setting.hotline);
    setting.currency = normalizeString(payload.currency, setting.currency || 'VND') || 'VND';
    setting.headOfficeAddress = normalizeString(payload.headOfficeAddress, setting.headOfficeAddress);

    const bankConfig = payload.bankConfig || {};
    setting.bankConfig = {
      ...setting.bankConfig,
      bankCode: normalizeString(bankConfig.bankCode, setting.bankConfig?.bankCode || 'VCB').toUpperCase(),
      bankName: normalizeString(bankConfig.bankName, setting.bankConfig?.bankName || ''),
      accountName: normalizeString(bankConfig.accountName, setting.bankConfig?.accountName || ''),
      accountNumber: normalizeString(bankConfig.accountNumber, setting.bankConfig?.accountNumber || ''),
      branch: normalizeString(bankConfig.branch, setting.bankConfig?.branch || ''),
    };

    const momoConfig = payload.momoConfig || {};
    setting.momoConfig = {
      ...setting.momoConfig,
      phone: normalizeString(momoConfig.phone, setting.momoConfig?.phone || ''),
      name: normalizeString(momoConfig.name, setting.momoConfig?.name || ''),
    };

    setting.updatedBy = req.user?._id;

    const updated = await setting.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment settings for storefront
// @route   GET /api/settings/payment
// @access  Public
const getPublicPaymentSettings = async (req, res) => {
  try {
    const setting = await getOrCreateSystemSetting();
    res.json({
      brandName: setting.brandName,
      supportEmail: setting.supportEmail,
      hotline: setting.hotline,
      bankConfig: setting.bankConfig,
      momoConfig: setting.momoConfig,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminSettings,
  updateAdminSettings,
  getPublicPaymentSettings,
};
