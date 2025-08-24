import User from '../models/User.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, status } = req.query;
  
  let query = {};
  
  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by role
  if (role) {
    query.role = role;
  }
  
  // Filter by status
  if (status !== undefined) {
    query.isActive = status === 'active';
  }
  
  const skip = (page - 1) * limit;
  
  const users = await User.find(query)
    .select('-password -emailVerificationToken -passwordResetToken')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
  
  const total = await User.countDocuments(query);
  
  res.json({
    success: true,
    count: users.length,
    data: users,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/v1/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -emailVerificationToken -passwordResetToken');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.json({
    success: true,
    data: { user }
  });
});

// @desc    Update user by ID (Admin only)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUserById = asyncHandler(async (req, res) => {
  const { name, email, phone, address, role, isActive } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  
  const updatedUser = await user.save();
  
  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user: updatedUser }
  });
});

// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Check if user has orders
  const orderCount = await Order.countDocuments({ user: req.params.id });
  if (orderCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with existing orders'
    });
  }
  
  // Check if user has reviews
  const reviewCount = await Review.countDocuments({ user: req.params.id });
  if (reviewCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with existing reviews'
    });
  }
  
  await User.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/v1/users/stats/overview
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
  
  // Get users registered in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  
  // Get users by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
  
  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      adminUsers,
      verifiedUsers,
      newUsers,
      usersByRole
    }
  });
});

// @desc    Get user activity (Admin only)
// @route   GET /api/v1/users/:id/activity
// @access  Private/Admin
export const getUserActivity = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  // Get user orders
  const orders = await Order.find({ user: userId })
    .select('orderNumber totalAmount status createdAt')
    .sort({ createdAt: -1 })
    .limit(10);
  
  // Get user reviews
  const reviews = await Review.find({ user: userId })
    .select('product rating comment createdAt')
    .populate('product', 'name images')
    .sort({ createdAt: -1 })
    .limit(10);
  
  // Get user stats
  const totalOrders = await Order.countDocuments({ user: userId });
  const totalSpent = await Order.aggregate([
    { $match: { user: userId, status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  
  res.json({
    success: true,
    data: {
      orders,
      reviews,
      stats: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0
      }
    }
  });
});

// @desc    Toggle user status (Admin only)
// @route   PATCH /api/v1/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  user.isActive = !user.isActive;
  await user.save();
  
  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user }
  });
});

// @desc    Get user dashboard data
// @route   GET /api/v1/users/dashboard
// @access  Private
export const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Get recent orders
  const recentOrders = await Order.find({ user: userId })
    .select('orderNumber totalAmount status createdAt')
    .sort({ createdAt: -1 })
    .limit(5);
  
  // Get recent reviews
  const recentReviews = await Review.find({ user: userId })
    .select('product rating comment createdAt')
    .populate('product', 'name images')
    .sort({ createdAt: -1 })
    .limit(5);
  
  // Get user stats
  const totalOrders = await Order.countDocuments({ user: userId });
  const totalSpent = await Order.aggregate([
    { $match: { user: userId, status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  
  // Get favorite categories (based on orders)
  const favoriteCategories = await Order.aggregate([
    { $match: { user: userId } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$product.category',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ]);
  
  res.json({
    success: true,
    data: {
      recentOrders,
      recentReviews,
      stats: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0
      },
      favoriteCategories
    }
  });
});
