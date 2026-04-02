const Voucher = require('../models/Voucher');
const User = require('../models/User');

// @desc    Fetch all vouchers
// @route   GET /api/vouchers
// @access  Private/Admin
const getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a voucher
// @route   POST /api/vouchers
// @access  Private/Admin
const createVoucher = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountAmount,
      minOrderValue,
      maxUsage,
      expirationDate,
      isActive,
      pointsCost,
    } = req.body;

    const voucherExists = await Voucher.findOne({ code: code.toUpperCase() });

    if (voucherExists) {
      return res.status(400).json({ message: 'Mã voucher đã tồn tại' });
    }

    const voucher = new Voucher({
      code: code.toUpperCase(),
      description,
      discountType,
      discountAmount,
      minOrderValue,
      maxUsage,
      expirationDate,
      isActive,
      pointsCost: pointsCost || 0,
    });

    const createdVoucher = await voucher.save();
    res.status(201).json(createdVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a voucher
// @route   PUT /api/vouchers/:id
// @access  Private/Admin
const updateVoucher = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountAmount,
      minOrderValue,
      maxUsage,
      expirationDate,
      isActive,
      pointsCost,
    } = req.body;

    const voucher = await Voucher.findById(req.params.id);

    if (voucher) {
      if (code && code.toUpperCase() !== voucher.code) {
        const voucherExists = await Voucher.findOne({ code: code.toUpperCase() });
        if (voucherExists) {
           return res.status(400).json({ message: 'Mã voucher đã tồn tại' });
        }
        voucher.code = code.toUpperCase();
      }

      voucher.description = description || voucher.description;
      voucher.discountType = discountType || voucher.discountType;
      voucher.discountAmount = discountAmount !== undefined ? discountAmount : voucher.discountAmount;
      voucher.minOrderValue = minOrderValue !== undefined ? minOrderValue : voucher.minOrderValue;
      voucher.maxUsage = maxUsage !== undefined ? maxUsage : voucher.maxUsage;
      voucher.expirationDate = expirationDate || voucher.expirationDate;
      voucher.isActive = isActive !== undefined ? isActive : voucher.isActive;
      voucher.pointsCost = pointsCost !== undefined ? pointsCost : voucher.pointsCost;

      const updatedVoucher = await voucher.save();
      res.json(updatedVoucher);
    } else {
      res.status(404).json({ message: 'Không tìm thấy voucher' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a voucher
// @route   DELETE /api/vouchers/:id
// @access  Private/Admin
const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (voucher) {
      await voucher.deleteOne();
      res.json({ message: 'Voucher đã được xóa' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy voucher' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get voucher by code (Public/Private for users)
// @route   GET /api/vouchers/code/:code
// @access  Public
const getVoucherByCode = async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const voucher = await Voucher.findOne({ code, isActive: true });

    if (!voucher) {
      return res.status(404).json({ message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' });
    }

    // Check expiration
    if (new Date(voucher.expirationDate) < new Date()) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn.' });
    }

    // Check usage limit
    if (voucher.maxUsage && voucher.usageCount >= voucher.maxUsage) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng.' });
    }

    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active vouchers for points redemption
// @route   GET /api/vouchers/rewards
// @access  Private
const getAvailableRewards = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ 
      isActive: true, 
      pointsCost: { $gt: 0 },
      expirationDate: { $gt: new Date() }
    }).sort({ pointsCost: 1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Redeem points for voucher
// @route   POST /api/vouchers/redeem
// @access  Private
const redeemVoucher = async (req, res) => {
  try {
    const { voucherId } = req.body;
    const user = await User.findById(req.user._id);
    const voucher = await Voucher.findById(voucherId);

    if (!user || !voucher) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng hoặc voucher.' });
    }

    if (voucher.pointsCost <= 0) {
      return res.status(400).json({ message: 'Voucher này không thể đổi bằng điểm.' });
    }

    if (user.points < voucher.pointsCost) {
      return res.status(400).json({ message: 'Bạn không đủ điểm để đổi voucher này.' });
    }

    // Deduct points
    user.points -= voucher.pointsCost;
    await user.save();

    // Reward: In a real system, we might create a UserVoucher record.
    // For now, we simply return the code to let them copy it.
    res.json({ 
      message: 'Đổi điểm thành công!', 
      code: voucher.code,
      remainingPoints: user.points 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getVoucherByCode,
  redeemVoucher,
  getAvailableRewards,
};

