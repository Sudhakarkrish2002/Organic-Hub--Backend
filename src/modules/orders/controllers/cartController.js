import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'name price weight weightUnit images stock isAvailable'
    });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  res.json({
    success: true,
    data: { cart }
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (!product.isAvailable) {
    return res.status(400).json({
      success: false,
      message: 'Product is not available'
    });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.stock} items available in stock`
    });
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  // Add item to cart
  await cart.addItem(
    productId,
    quantity,
    product.price,
    product.weight,
    product.weightUnit
  );

  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name price weight weightUnit images stock isAvailable'
  });

  res.json({
    success: true,
    message: 'Item added to cart successfully',
    data: { cart }
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be at least 1'
    });
  }

  // Check product stock
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.stock} items available in stock`
    });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  // Update quantity
  await cart.updateQuantity(productId, quantity);

  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name price weight weightUnit images stock isAvailable'
  });

  res.json({
    success: true,
    message: 'Cart updated successfully',
    data: { cart }
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  // Remove item
  await cart.removeItem(productId);

  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name price weight weightUnit images stock isAvailable'
  });

  res.json({
    success: true,
    message: 'Item removed from cart successfully',
    data: { cart }
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  await cart.clearCart();

  res.json({
    success: true,
    message: 'Cart cleared successfully',
    data: { cart }
  });
});

// @desc    Apply coupon to cart
// @route   POST /api/cart/apply-coupon
// @access  Private
export const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;

  if (!couponCode) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code is required'
    });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  if (cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty'
    });
  }

  // Import Coupon model
  const Coupon = (await import('../models/Coupon.js')).default;
  
  const coupon = await Coupon.findOne({ 
    code: couponCode.toUpperCase(),
    isActive: true
  });

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Invalid coupon code'
    });
  }

  if (!coupon.isValid()) {
    return res.status(400).json({
      success: false,
      message: 'Coupon has expired or reached usage limit'
    });
  }

  if (cart.totalAmount < coupon.minOrderAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
    });
  }

  // Apply coupon
  cart.appliedCoupon = coupon._id;
  cart.discountAmount = coupon.calculateDiscount(cart.totalAmount);
  cart.finalAmount = cart.totalAmount - cart.discountAmount;
  
  await cart.save();

  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name price weight weightUnit images stock isAvailable'
  });

  res.json({
    success: true,
    message: 'Coupon applied successfully',
    data: { cart }
  });
});

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/remove-coupon
// @access  Private
export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  cart.appliedCoupon = undefined;
  cart.discountAmount = 0;
  cart.finalAmount = cart.totalAmount;
  
  await cart.save();

  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name price weight weightUnit images stock isAvailable'
  });

  res.json({
    success: true,
    message: 'Coupon removed successfully',
    data: { cart }
  });
});
