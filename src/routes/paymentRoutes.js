import express from 'express';
import { body } from 'express-validator';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment,
  getPaymentMethods,
  handleWebhook
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createPaymentOrderValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD'])
    .withMessage('Currency must be INR or USD'),
  body('receipt')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Receipt must be between 3 and 50 characters')
];

const verifyPaymentValidation = [
  body('razorpay_order_id')
    .trim()
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id')
    .trim()
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpay_signature')
    .trim()
    .notEmpty()
    .withMessage('Razorpay signature is required'),
  body('orderId')
    .optional()
    .isMongoId()
    .withMessage('Valid order ID is required')
];

const refundPaymentValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Reason must be between 5 and 200 characters')
];

// Public routes
router.get('/methods', getPaymentMethods);
router.post('/webhook', handleWebhook);

// Protected routes
router.post('/create-order', protect, createPaymentOrderValidation, validate, createPaymentOrder);
router.post('/verify', protect, verifyPaymentValidation, validate, verifyPayment);
router.get('/:paymentId', protect, getPaymentDetails);

// Admin only routes
router.post('/:paymentId/refund', protect, authorize('admin'), refundPaymentValidation, validate, refundPayment);

export default router;
