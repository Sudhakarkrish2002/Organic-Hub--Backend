import express from 'express';
import { body } from 'express-validator';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  reportReview,
  getAllReviews
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const reviewValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
];

const reviewUpdateValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
];

const reportReviewValidation = [
  body('reason')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Reason must be between 5 and 200 characters')
];

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, reviewValidation, validate, createReview);
router.put('/:id', protect, reviewUpdateValidation, validate, updateReview);
router.delete('/:id', protect, deleteReview);
router.get('/user', protect, getUserReviews);
router.post('/:id/report', protect, reportReviewValidation, validate, reportReview);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllReviews);

export default router;
