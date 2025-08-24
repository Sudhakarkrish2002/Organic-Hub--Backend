import express from 'express';
// Temporarily commented out imports to fix server startup
// import authRoutes from './auth/routes/authRoutes.js';
// import productRoutes from './products/routes/productRoutes.js';
// import categoryRoutes from './products/routes/categoryRoutes.js';
// import cartRoutes from './orders/routes/cartRoutes.js';
// import orderRoutes from './orders/routes/orderRoutes.js';
// import paymentRoutes from './payments/routes/paymentRoutes.js';
// import reviewRoutes from './products/routes/reviewRoutes.js';
// import adminRoutes from './admin/routes/adminRoutes.js';
// import seasonalRoutes from './seasonal/routes/seasonalRoutes.js';
// import uploadRoutes from './admin/routes/uploadRoutes.js';
// import userRoutes from './users/routes/userRoutes.js';
// import discountRoutes from './admin/routes/discountRoutes.js';

const router = express.Router();

// API version prefix
const API_VERSION = '/api/v1';

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Organic Hub API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Basic test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes (temporarily commented out to fix import issues)
// router.use(`${API_VERSION}/auth`, authRoutes);
// router.use(`${API_VERSION}/products`, productRoutes);
// router.use(`${API_VERSION}/categories`, categoryRoutes);
// router.use(`${API_VERSION}/cart`, cartRoutes);
// router.use(`${API_VERSION}/orders`, orderRoutes);
// router.use(`${API_VERSION}/payments`, paymentRoutes);
// router.use(`${API_VERSION}/reviews`, reviewRoutes);
// router.use(`${API_VERSION}/admin`, adminRoutes);
// router.use(`${API_VERSION}/seasonal`, seasonalRoutes);
// router.use(`${API_VERSION}/upload`, uploadRoutes);
// router.use(`${API_VERSION}/users`, userRoutes);
// router.use(`${API_VERSION}/discounts`, discountRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

export default router;
