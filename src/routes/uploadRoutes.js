import express from 'express';
import {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  updateImage,
  getImageInfo,
  optimizeImage
} from '../controllers/uploadController.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Single image upload
router.post('/image', upload.single('image'), uploadImage);

// Multiple images upload
router.post('/images', upload.array('images', 10), uploadMultipleImages);

// Image management
router.get('/image/:publicId', getImageInfo);
router.put('/image/:publicId', upload.single('image'), updateImage);
router.delete('/image/:publicId', admin, deleteImage);

// Image optimization
router.post('/optimize', optimizeImage);

export default router;
