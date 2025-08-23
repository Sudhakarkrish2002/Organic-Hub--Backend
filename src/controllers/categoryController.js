import Category from '../models/Category.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 });

  res.json({
    success: true,
    data: { categories }
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    data: { category }
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category }
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: { category }
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check if category has products
  const Product = (await import('../models/Product.js')).default;
  const productCount = await Product.countDocuments({ category: req.params.id });

  if (productCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category. ${productCount} products are associated with this category.`
    });
  }

  await category.deleteOne();

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
export const getFeaturedCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ 
    featured: true, 
    isActive: true 
  })
    .sort({ sortOrder: 1, name: 1 })
    .limit(6);

  res.json({
    success: true,
    data: { categories }
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ 
    slug: req.params.slug,
    isActive: true 
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    data: { category }
  });
});
