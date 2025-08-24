import cloudinary from 'cloudinary';
import { asyncHandler } from '../middleware/errorHandler.js';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Upload single image
// @route   POST /api/v1/upload/image
// @access  Private
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'organic-hub',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image to Cloudinary',
      error: error.message
    });
  }
});

// @desc    Upload multiple images
// @route   POST /api/v1/upload/images
// @access  Private
export const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  try {
    const uploadPromises = req.files.map(async (file) => {
      const result = await cloudinary.v2.uploader.upload(file.path, {
        folder: 'organic-hub',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      };
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading images to Cloudinary',
      error: error.message
    });
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/v1/upload/image/:publicId
// @access  Private
export const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete image'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting image from Cloudinary',
      error: error.message
    });
  }
});

// @desc    Update image (delete old and upload new)
// @route   PUT /api/v1/upload/image/:publicId
// @access  Private
export const updateImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No new file uploaded'
    });
  }

  try {
    // Delete old image
    await cloudinary.v2.uploader.destroy(publicId);

    // Upload new image
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'organic-hub',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    res.json({
      success: true,
      message: 'Image updated successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating image',
      error: error.message
    });
  }
});

// @desc    Get image info
// @route   GET /api/v1/upload/image/:publicId
// @access  Private
export const getImageInfo = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  try {
    const result = await cloudinary.v2.api.resource(publicId);

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        createdAt: result.created_at,
        tags: result.tags || []
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Image not found',
      error: error.message
    });
  }
});

// @desc    Optimize image
// @route   POST /api/v1/upload/optimize
// @access  Private
export const optimizeImage = asyncHandler(async (req, res) => {
  const { publicId, transformations } = req.body;

  if (!publicId) {
    return res.status(400).json({
      success: false,
      message: 'Public ID is required'
    });
  }

  try {
    const result = await cloudinary.v2.uploader.explicit(publicId, {
      type: 'upload',
      transformation: transformations || [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    res.json({
      success: true,
      message: 'Image optimized successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error optimizing image',
      error: error.message
    });
  }
});
