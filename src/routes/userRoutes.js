import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getUserStats,
  getUserActivity,
  toggleUserStatus,
  getUserDashboard
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User dashboard (for authenticated users)
router.get('/dashboard', getUserDashboard);

// Admin routes
router.get('/', admin, getAllUsers);
router.get('/stats/overview', admin, getUserStats);
router.get('/:id', admin, getUserById);
router.get('/:id/activity', admin, getUserActivity);
router.put('/:id', admin, updateUserById);
router.delete('/:id', admin, deleteUserById);
router.patch('/:id/toggle-status', admin, toggleUserStatus);

export default router;
