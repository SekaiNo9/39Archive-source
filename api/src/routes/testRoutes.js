const express = require('express');
const { testCloudinaryConnection } = require('../utils/cloudinaryTest');

const router = express.Router();

// Test Cloudinary connection
router.get('/test-cloudinary', async (req, res) => {
  try {
    const isConnected = await testCloudinaryConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'Cloudinary kết nối thành công! 🎉',
        config: {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY ? '✓ Configured' : '✗ Missing',
          api_secret: process.env.CLOUDINARY_API_SECRET ? '✓ Configured' : '✗ Missing'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Cloudinary kết nối thất bại! ❌',
        config: {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '✗ Missing',
          api_key: process.env.CLOUDINARY_API_KEY ? '✓ Configured' : '✗ Missing',
          api_secret: process.env.CLOUDINARY_API_SECRET ? '✓ Configured' : '✗ Missing'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi test Cloudinary',
      error: error.message,
      config: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '✗ Missing',
        api_key: process.env.CLOUDINARY_API_KEY ? '✓ Configured' : '✗ Missing',
        api_secret: process.env.CLOUDINARY_API_SECRET ? '✓ Configured' : '✗ Missing'
      }
    });
  }
});

module.exports = router;