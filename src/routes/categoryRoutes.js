import express from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategories,
  getCategoryBySlug
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon cannot exceed 50 characters'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('featured must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('parentCategory')
    .optional()
    .isMongoId()
    .withMessage('Valid parent category ID is required')
];

const categoryUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon cannot exceed 50 characters'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('featured must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('parentCategory')
    .optional()
    .isMongoId()
    .withMessage('Valid parent category ID is required'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Public routes
router.get('/', getCategories);
router.get('/featured', getFeaturedCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategory);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), categoryValidation, validate, createCategory);
router.put('/:id', protect, authorize('admin'), categoryUpdateValidation, validate, updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
