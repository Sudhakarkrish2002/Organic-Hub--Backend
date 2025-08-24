import User from '../models/User.js';

// Middleware to check if user is admin
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Middleware to check if user is super admin
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }
  next();
};

// Middleware to check if user is admin or super admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'super-admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Middleware to check if user can manage specific resource
export const canManageResource = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
        });
      }

      // Super admin can manage everything
      if (req.user.role === 'super-admin') {
        return next();
      }

      // Admin can manage most resources
      if (req.user.role === 'admin') {
        // Check if admin has specific permissions for this resource
        const hasPermission = await checkAdminPermission(req.user._id, resourceType);
        if (hasPermission) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: `Not authorized to manage ${resourceType}`
      });
    } catch (error) {
      next(error);
    }
  };
};

// Helper function to check admin permissions
const checkAdminPermission = async (adminId, resourceType) => {
  try {
    const admin = await User.findById(adminId);
    if (!admin || !admin.permissions) return false;
    
    return admin.permissions.includes(resourceType) || 
           admin.permissions.includes('all');
  } catch (error) {
    return false;
  }
};

// Middleware to check if user can view analytics
export const canViewAnalytics = (req, res, next) => {
  if (!req.user || !['admin', 'super-admin', 'analyst'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Analytics access required'
    });
  }
  next();
};

// Middleware to check if user can manage users
export const canManageUsers = (req, res, next) => {
  if (!req.user || !['admin', 'super-admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'User management access required'
    });
  }
  next();
};

// Middleware to check if user can manage products
export const canManageProducts = (req, res, next) => {
  if (!req.user || !['admin', 'super-admin', 'product-manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Product management access required'
    });
  }
  next();
};

// Middleware to check if user can manage orders
export const canManageOrders = (req, res, next) => {
  if (!req.user || !['admin', 'super-admin', 'order-manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Order management access required'
    });
  }
  next();
};
