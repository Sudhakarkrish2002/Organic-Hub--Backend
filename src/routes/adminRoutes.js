import express from 'express';
import { body } from 'express-validator';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

// Validation rules
const updateUserStatusValidation = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const updateUserRoleValidation = [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"')
];

// Routes
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatusValidation, validate, updateUserStatus);
router.put('/users/:id/role', updateUserRoleValidation, validate, updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
