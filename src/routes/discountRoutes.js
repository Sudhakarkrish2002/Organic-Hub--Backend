import express from 'express';
import {
  getBulkDiscounts,
  getProductBulkDiscount,
  createBulkDiscount,
  updateBulkDiscount,
  deleteBulkDiscount,
  toggleBulkDiscountStatus,
  getCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus
} from '../controllers/discountController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/bulk', getBulkDiscounts);
router.get('/bulk/product/:productId', getProductBulkDiscount);
router.get('/coupons', getCoupons);
router.post('/coupons/validate', validateCoupon);

// Admin routes
router.post('/bulk', protect, admin, createBulkDiscount);
router.put('/bulk/:id', protect, admin, updateBulkDiscount);
router.delete('/bulk/:id', protect, admin, deleteBulkDiscount);
router.patch('/bulk/:id/toggle', protect, admin, toggleBulkDiscountStatus);

router.post('/coupons', protect, admin, createCoupon);
router.put('/coupons/:id', protect, admin, updateCoupon);
router.delete('/coupons/:id', protect, admin, deleteCoupon);
router.patch('/coupons/:id/toggle', protect, admin, toggleCouponStatus);

export default router;
