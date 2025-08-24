import express from 'express';
import {
  getSeasonalPromotions,
  getSeasonalProducts,
  getCurrentSeason,
  createSeasonalPromotion,
  updateSeasonalPromotion,
  deleteSeasonalPromotion,
  togglePromotionStatus
} from '../controllers/seasonalController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/promotions', getSeasonalPromotions);
router.get('/products/:season', getSeasonalProducts);
router.get('/current', getCurrentSeason);

// Admin routes
router.post('/promotions', protect, admin, createSeasonalPromotion);
router.put('/promotions/:id', protect, admin, updateSeasonalPromotion);
router.delete('/promotions/:id', protect, admin, deleteSeasonalPromotion);
router.patch('/promotions/:id/toggle', protect, admin, togglePromotionStatus);

export default router;
