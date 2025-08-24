import express from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getSeasonalProducts,
  searchProducts
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { searchLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('weight')
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('weightUnit')
    .isIn(['g', 'kg', 'ml', 'l', 'pcs'])
    .withMessage('Invalid weight unit'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('isOrganic')
    .optional()
    .isBoolean()
    .withMessage('isOrganic must be a boolean'),
  body('isSeasonal')
    .optional()
    .isBoolean()
    .withMessage('isSeasonal must be a boolean'),
  body('season')
    .optional()
    .isIn(['spring', 'summer', 'monsoon', 'winter', 'all-year'])
    .withMessage('Invalid season'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('featured must be a boolean')
];

const productUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('weightUnit')
    .optional()
    .isIn(['g', 'kg', 'ml', 'l', 'pcs'])
    .withMessage('Invalid weight unit'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('isOrganic')
    .optional()
    .isBoolean()
    .withMessage('isOrganic must be a boolean'),
  body('isSeasonal')
    .optional()
    .isBoolean()
    .withMessage('isSeasonal must be a boolean'),
  body('season')
    .optional()
    .isIn(['spring', 'summer', 'monsoon', 'winter', 'all-year'])
    .withMessage('Invalid season'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('featured must be a boolean')
];

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/seasonal/:season', getSeasonalProducts);
router.get('/search', searchLimiter, searchProducts);
router.get('/:id', getProduct);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), productValidation, validate, createProduct);
router.put('/:id', protect, authorize('admin'), productUpdateValidation, validate, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
