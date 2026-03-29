const Promotion = require('../models/Promotion');

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Public
const getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find({}).populate('targetProducts', 'name price image badge');
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách khuyến mãi' });
  }
};

// @desc    Get active promotions
// @route   GET /api/promotions/active
// @access  Public
const getActivePromotions = async (req, res) => {
  try {
    const currentDate = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).populate('targetProducts', 'name price image originalPrice status stock');
    
    res.json(promotions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách khuyến mãi đang chạy' });
  }
};

// @desc    Create new promotion
// @route   POST /api/promotions
// @access  Private/Admin
const createPromotion = async (req, res) => {
  const { name, description, type, discountValue, minQuantity, targetProducts, applyToAll, startDate, endDate, isActive } = req.body;

  try {
    const promotion = new Promotion({
      name,
      description,
      type,
      discountValue,
      minQuantity,
      targetProducts,
      applyToAll,
      startDate,
      endDate,
      isActive
    });

    const createdPromotion = await promotion.save();
    res.status(201).json(createdPromotion);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi dữ liệu đầu vào. Không thể tạo khuyến mãi.' });
  }
};

// @desc    Update a promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
const updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (promotion) {
      promotion.name = req.body.name || promotion.name;
      promotion.description = req.body.description !== undefined ? req.body.description : promotion.description;
      promotion.type = req.body.type || promotion.type;
      promotion.discountValue = req.body.discountValue !== undefined ? req.body.discountValue : promotion.discountValue;
      promotion.minQuantity = req.body.minQuantity !== undefined ? req.body.minQuantity : promotion.minQuantity;
      promotion.targetProducts = req.body.targetProducts !== undefined ? req.body.targetProducts : promotion.targetProducts;
      promotion.applyToAll = req.body.applyToAll !== undefined ? req.body.applyToAll : promotion.applyToAll;
      promotion.startDate = req.body.startDate || promotion.startDate;
      promotion.endDate = req.body.endDate || promotion.endDate;
      promotion.isActive = req.body.isActive !== undefined ? req.body.isActive : promotion.isActive;

      const updatedPromotion = await promotion.save();
      res.json(updatedPromotion);
    } else {
      res.status(404).json({ message: 'Không tìm thấy chương trình khuyến mãi' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật khuyến mãi' });
  }
};

// @desc    Delete a promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (promotion) {
      await promotion.deleteOne();
      res.json({ message: 'Đã xóa chương trình khuyến mãi' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy chương trình khuyến mãi' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xóa khuyến mãi' });
  }
};

module.exports = {
  getPromotions,
  getActivePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
};
