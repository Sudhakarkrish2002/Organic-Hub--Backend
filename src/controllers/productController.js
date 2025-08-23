import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const startIndex = (page - 1) * limit;
  
  const {
    search,
    category,
    minPrice,
    maxPrice,
    isOrganic,
    isSeasonal,
    season,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = { isAvailable: true };
  
  if (search) {
    filter.$text = { $search: search };
  }
  
  if (category) {
    filter.category = category;
  }
  
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  
  if (isOrganic !== undefined) {
    filter.isOrganic = isOrganic === 'true';
  }
  
  if (isSeasonal !== undefined) {
    filter.isSeasonal = isSeasonal === 'true';
  }
  
  if (season && season !== 'all-year') {
    filter.season = season;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name')
    .sort(sort)
    .limit(limit)
    .skip(startIndex);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name description')
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name'
      }
    });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: { product }
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ 
    featured: true, 
    isAvailable: true 
  })
    .populate('category', 'name')
    .limit(8);

  res.json({
    success: true,
    data: { products }
  });
});

// @desc    Get seasonal products
// @route   GET /api/products/seasonal/:season
// @access  Public
export const getSeasonalProducts = asyncHandler(async (req, res) => {
  const { season } = req.params;
  
  const products = await Product.find({
    season: season,
    isAvailable: true
  })
    .populate('category', 'name')
    .limit(12);

  res.json({
    success: true,
    data: { products }
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const products = await Product.find({
    $text: { $search: q },
    isAvailable: true
  })
    .populate('category', 'name')
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: { products }
  });
});
