import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;

  const total = await Review.countDocuments({ 
    product: productId, 
    isActive: true 
  });

  const reviews = await Review.find({ 
    product: productId, 
    isActive: true 
  })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    user: req.user._id,
    product: productId
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this product'
    });
  }

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Create review
  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    title,
    comment
  });

  // Populate user details
  await review.populate('user', 'name');

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: { review }
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user owns this review
  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review'
    });
  }

  // Update review
  review.rating = rating || review.rating;
  review.title = title || review.title;
  review.comment = comment || review.comment;

  await review.save();

  // Populate user details
  await review.populate('user', 'name');

  res.json({
    success: true,
    message: 'Review updated successfully',
    data: { review }
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user owns this review or is admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review'
    });
  }

  await review.deleteOne();

  res.json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get user reviews
// @route   GET /api/reviews/user
// @access  Private
export const getUserReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;

  const total = await Review.countDocuments({ user: req.user._id });
  const reviews = await Review.find({ user: req.user._id })
    .populate('product', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// @desc    Report review
// @route   POST /api/reviews/:id/report
// @access  Private
export const reportReview = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user already reported this review
  if (review.reportedBy && review.reportedBy.includes(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You have already reported this review'
    });
  }

  review.isReported = true;
  review.reportReason = reason;
  if (!review.reportedBy) review.reportedBy = [];
  review.reportedBy.push(req.user._id);

  await review.save();

  res.json({
    success: true,
    message: 'Review reported successfully'
  });
});

// @desc    Get all reviews (Admin only)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const startIndex = (page - 1) * limit;

  const {
    status,
    rating,
    startDate,
    endDate,
    search
  } = req.query;

  // Build filter
  const filter = {};
  
  if (status === 'reported') filter.isReported = true;
  if (status === 'active') filter.isActive = true;
  
  if (rating) filter.rating = parseInt(rating);
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { comment: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('user', 'name email')
    .populate('product', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});
