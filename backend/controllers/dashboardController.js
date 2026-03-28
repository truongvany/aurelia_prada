const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // 1. Basic counts
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });

    // 2. Total Revenue
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });
    const totalRevenue = orders.reduce((acc, item) => acc + item.totalPrice, 0);

    // 3. Recent Sales (last 5)
    const recentSales = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // 4. Monthly Sales Data (last 6 months)
    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Map month numbers to names for the chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlySales = monthlySales.map(item => ({
      month: monthNames[item._id - 1],
      total: item.total
    }));

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
      },
      recentSales,
      monthlySales: formattedMonthlySales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
