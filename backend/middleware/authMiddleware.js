const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aurelia_secret_123');
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Không thể xác thực người dùng, vui lòng đăng nhập lại.' });
      }
      
      return next();
    } catch (error) {
      console.error('Lỗi xác thực Token:', error);
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy Token xác thực.' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    console.warn(`Cảnh báo: Người dùng ${req.user?._id} (Role: ${req.user?.role}) cố gắng truy cập quyền Admin.`);
    return res.status(401).json({ message: 'Bạn không có quyền quản trị viên.' });
  }
};

module.exports = { protect, admin };
