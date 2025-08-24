import express from 'express';
import { body } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Validation rules
const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

const updateCartItemValidation = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

const applyCouponValidation = [
  body('couponCode')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
];

// Routes
router.get('/', getCart);
router.post('/add', addToCartValidation, validate, addToCart);
router.put('/update/:productId', updateCartItemValidation, validate, updateCartItem);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/apply-coupon', applyCouponValidation, validate, applyCoupon);
router.delete('/remove-coupon', removeCoupon);

export default router;
