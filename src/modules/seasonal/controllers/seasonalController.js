import SeasonalPromotion from '../models/SeasonalPromotion.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all seasonal promotions
// @route   GET /api/v1/seasonal/promotions
// @access  Public
export const getSeasonalPromotions = asyncHandler(async (req, res) => {
  const { season, active } = req.query;
  
  let query = {};
  
  if (season) {
    query.season = season;
  }
  
  if (active !== undefined) {
    query.isActive = active === 'true';
  }
  
  const promotions = await SeasonalPromotion.find(query)
    .populate('products', 'name price images category')
    .sort({ startDate: -1 });
  
  res.json({
    success: true,
    count: promotions.length,
    data: promotions
  });
});

// @desc    Get seasonal products by season
// @route   GET /api/v1/seasonal/products/:season
// @access  Public
export const getSeasonalProducts = asyncHandler(async (req, res) => {
  const { season } = req.params;
  const { page = 1, limit = 12, category } = req.query;
  
  let query = { 
    isSeasonal: true, 
    season: season,
    isAvailable: true 
  };
  
  if (category) {
    query.category = category;
  }
  
  const skip = (page - 1) * limit;
  
  const products = await Product.find(query)
    .populate('category', 'name')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ rating: -1, createdAt: -1 });
  
  const total = await Product.countDocuments(query);
  
  res.json({
    success: true,
    data: products,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
});

// @desc    Get current season
// @route   GET /api/v1/seasonal/current
// @access  Public
export const getCurrentSeason = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  
  let season;
  if (month >= 3 && month <= 5) season = 'spring';
  else if (month >= 6 && month <= 8) season = 'summer';
  else if (month >= 9 && month <= 10) season = 'monsoon';
  else season = 'winter';
  
  // Get seasonal products for current season
  const seasonalProducts = await Product.find({
    isSeasonal: true,
    season: season,
    isAvailable: true
  })
  .populate('category', 'name')
  .limit(8)
  .sort({ rating: -1 });
  
  // Get active promotions for current season
  const promotions = await SeasonalPromotion.find({
    season: season,
    isActive: true,
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate }
  })
  .populate('products', 'name price images category');
  
  res.json({
    success: true,
    data: {
      currentSeason: season,
      seasonalProducts,
      promotions
    }
  });
});

// @desc    Create seasonal promotion (Admin only)
// @route   POST /api/v1/seasonal/promotions
// @access  Private/Admin
export const createSeasonalPromotion = asyncHandler(async (req, res) => {
  const { title, description, season, startDate, endDate, discountPercentage, products } = req.body;
  
  const promotion = await SeasonalPromotion.create({
    title,
    description,
    season,
    startDate,
    endDate,
    discountPercentage,
    products
  });
  
  res.status(201).json({
    success: true,
    message: 'Seasonal promotion created successfully',
    data: promotion
  });
});

// @desc    Update seasonal promotion (Admin only)
// @route   PUT /api/v1/seasonal/promotions/:id
// @access  Private/Admin
export const updateSeasonalPromotion = asyncHandler(async (req, res) => {
  const promotion = await SeasonalPromotion.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Seasonal promotion not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Seasonal promotion updated successfully',
    data: promotion
  });
});

// @desc    Delete seasonal promotion (Admin only)
// @route   DELETE /api/v1/seasonal/promotions/:id
// @access  Private/Admin
export const deleteSeasonalPromotion = asyncHandler(async (req, res) => {
  const promotion = await SeasonalPromotion.findByIdAndDelete(req.params.id);
  
  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Seasonal promotion not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Seasonal promotion deleted successfully'
  });
});

// @desc    Toggle seasonal promotion status (Admin only)
// @route   PATCH /api/v1/seasonal/promotions/:id/toggle
// @access  Private/Admin
export const togglePromotionStatus = asyncHandler(async (req, res) => {
  const promotion = await SeasonalPromotion.findById(req.params.id);
  
  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Seasonal promotion not found'
    });
  }
  
  promotion.isActive = !promotion.isActive;
  await promotion.save();
  
  res.json({
    success: true,
    message: `Promotion ${promotion.isActive ? 'activated' : 'deactivated'} successfully`,
    data: promotion
  });
});
