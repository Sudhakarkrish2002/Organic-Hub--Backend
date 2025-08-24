import BulkDiscount from '../models/BulkDiscount.js';
import Coupon from '../models/Coupon.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all bulk discounts
// @route   GET /api/v1/discounts/bulk
// @access  Public
export const getBulkDiscounts = asyncHandler(async (req, res) => {
  const { category, active } = req.query;
  
  let query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (active !== undefined) {
    query.isActive = active === 'true';
  }
  
  const discounts = await BulkDiscount.find(query)
    .populate('category', 'name')
    .sort({ minQuantity: 1 });
  
  res.json({
    success: true,
    count: discounts.length,
    data: discounts
  });
});

// @desc    Get bulk discount for product
// @route   GET /api/v1/discounts/bulk/product/:productId
// @access  Public
export const getProductBulkDiscount = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.query;
  
  const product = await Product.findById(productId).populate('category');
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  // Get applicable bulk discounts
  const bulkDiscounts = await BulkDiscount.find({
    category: product.category._id,
    isActive: true,
    minQuantity: { $lte: parseInt(quantity) }
  }).sort({ minQuantity: -1 });
  
  // Get the best applicable discount
  const bestDiscount = bulkDiscounts[0];
  
  if (bestDiscount) {
    const discountAmount = (product.price * bestDiscount.discountPercentage) / 100;
    const discountedPrice = product.price - discountAmount;
    
    res.json({
      success: true,
      data: {
        product: product.name,
        originalPrice: product.price,
        discountPercentage: bestDiscount.discountPercentage,
        discountAmount,
        discountedPrice,
        minQuantity: bestDiscount.minQuantity,
        applicableQuantity: parseInt(quantity)
      }
    });
  } else {
    res.json({
      success: true,
      data: {
        product: product.name,
        originalPrice: product.price,
        discountPercentage: 0,
        discountAmount: 0,
        discountedPrice: product.price,
        minQuantity: null,
        applicableQuantity: parseInt(quantity)
      }
    });
  }
});

// @desc    Create bulk discount (Admin only)
// @route   POST /api/v1/discounts/bulk
// @access  Private/Admin
export const createBulkDiscount = asyncHandler(async (req, res) => {
  const { category, minQuantity, discountPercentage, description, isActive = true } = req.body;
  
  // Check if discount already exists for this category and quantity
  const existingDiscount = await BulkDiscount.findOne({
    category,
    minQuantity
  });
  
  if (existingDiscount) {
    return res.status(400).json({
      success: false,
      message: 'Bulk discount already exists for this category and quantity'
    });
  }
  
  const discount = await BulkDiscount.create({
    category,
    minQuantity,
    discountPercentage,
    description,
    isActive
  });
  
  res.status(201).json({
    success: true,
    message: 'Bulk discount created successfully',
    data: discount
  });
});

// @desc    Update bulk discount (Admin only)
// @route   PUT /api/v1/discounts/bulk/:id
// @access  Private/Admin
export const updateBulkDiscount = asyncHandler(async (req, res) => {
  const discount = await BulkDiscount.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!discount) {
    return res.status(404).json({
      success: false,
      message: 'Bulk discount not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Bulk discount updated successfully',
    data: discount
  });
});

// @desc    Delete bulk discount (Admin only)
// @route   DELETE /api/v1/discounts/bulk/:id
// @access  Private/Admin
export const deleteBulkDiscount = asyncHandler(async (req, res) => {
  const discount = await BulkDiscount.findByIdAndDelete(req.params.id);
  
  if (!discount) {
    return res.status(404).json({
      success: false,
      message: 'Bulk discount not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Bulk discount deleted successfully'
  });
});

// @desc    Get all coupons
// @route   GET /api/v1/discounts/coupons
// @access  Public
export const getCoupons = asyncHandler(async (req, res) => {
  const { active, type } = req.query;
  
  let query = {};
  
  if (active !== undefined) {
    query.isActive = active === 'true';
  }
  
  if (type) {
    query.type = type;
  }
  
  const coupons = await Coupon.find(query)
    .populate('applicableCategories', 'name')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: coupons.length,
    data: coupons
  });
});

// @desc    Validate coupon code
// @route   POST /api/v1/discounts/coupons/validate
// @access  Public
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount, categories = [] } = req.body;
  
  if (!code || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code and amount are required'
    });
  }
  
  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(),
    isActive: true,
    expiryDate: { $gte: new Date() }
  });
  
  if (!coupon) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired coupon code'
    });
  }
  
  // Check minimum amount requirement
  if (coupon.minAmount && amount < coupon.minAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount of ₹${coupon.minAmount} required`
    });
  }
  
  // Check category restrictions
  if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
    const hasValidCategory = categories.some(catId => 
      coupon.applicableCategories.includes(catId)
    );
    
    if (!hasValidCategory) {
      return res.status(400).json({
        success: false,
        message: 'Coupon not applicable for selected products'
      });
    }
  }
  
  // Calculate discount
  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = (amount * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }
  
  const finalAmount = amount - discountAmount;
  
  res.json({
    success: true,
    message: 'Coupon applied successfully',
    data: {
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount
      },
      originalAmount: amount,
      discountAmount,
      finalAmount
    }
  });
});

// @desc    Create coupon (Admin only)
// @route   POST /api/v1/discounts/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    type,
    discountValue,
    maxDiscount,
    minAmount,
    applicableCategories,
    expiryDate,
    usageLimit,
    description
  } = req.body;
  
  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code already exists'
    });
  }
  
  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    type,
    discountValue,
    maxDiscount,
    minAmount,
    applicableCategories,
    expiryDate,
    usageLimit,
    description
  });
  
  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: coupon
  });
});

// @desc    Update coupon (Admin only)
// @route   PUT /api/v1/discounts/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Coupon not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Coupon updated successfully',
    data: coupon
  });
});

// @desc    Delete coupon (Admin only)
// @route   DELETE /api/v1/discounts/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  
  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Coupon not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Coupon deleted successfully'
  });
});

// @desc    Toggle discount status (Admin only)
// @route   PATCH /api/v1/discounts/bulk/:id/toggle
// @access  Private/Admin
export const toggleBulkDiscountStatus = asyncHandler(async (req, res) => {
  const discount = await BulkDiscount.findById(req.params.id);
  
  if (!discount) {
    return res.status(404).json({
      success: false,
      message: 'Bulk discount not found'
    });
  }
  
  discount.isActive = !discount.isActive;
  await discount.save();
  
  res.json({
    success: true,
    message: `Bulk discount ${discount.isActive ? 'activated' : 'deactivated'} successfully`,
    data: discount
  });
});

// @desc    Toggle coupon status (Admin only)
// @route   PATCH /api/v1/discounts/coupons/:id/toggle
// @access  Private/Admin
export const toggleCouponStatus = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Coupon not found'
    });
  }
  
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  
  res.json({
    success: true,
    message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
    data: coupon
  });
});
