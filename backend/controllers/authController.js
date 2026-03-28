const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'aurelia_secret_123', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Save login history
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || '---';

    user.loginHistory.push({
      device: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
      software: `Website aurelia.vn - ${userAgent.substring(0, 30)}...`,
      loginType: 'Mặc định',
      location: 'Vietnam',
      ip: ip,
      timestamp: new Date(),
    });
    
    // Keep only last 20 entries
    if (user.loginHistory.length > 20) user.loginHistory.shift();
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone, address, dob, gender } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    dob,
    gender,
  });

  if (user) {
    // Add initial login history record
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || '---';

    user.loginHistory.push({
      device: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
      software: `Website aurelia.vn - Đăng ký mới`,
      loginType: 'Hệ thống',
      location: 'Vietnam',
      ip: ip,
      timestamp: new Date(),
    });
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist').populate('viewedProducts');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      dob: user.dob,
      gender: user.gender,
      wishlist: user.wishlist,
      viewedProducts: user.viewedProducts,
      loginHistory: user.loginHistory,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.dob = req.body.dob || user.dob;
    user.gender = req.body.gender || user.gender;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Add/Remove from wishlist
const toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    const alreadyExists = user.wishlist.some((id) => id.toString() === productId);
    if (alreadyExists) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json({ message: 'Wishlist updated', wishlist: user.wishlist });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Track viewed product
const trackViewedProduct = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    user.viewedProducts = user.viewedProducts.filter((id) => id.toString() !== productId);
    user.viewedProducts.unshift(productId);
    
    // Keep last 10
    if (user.viewedProducts.length > 10) user.viewedProducts.pop();

    await user.save();
    res.json({ success: true });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  toggleWishlist,
  trackViewedProduct,
};
