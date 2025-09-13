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

const mongoose = require('mongoose');

// Route test kết nối MongoDB
router.get('/test-db', (req, res) => {
  const state = mongoose.connection.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  let status = '';
  switch (state) {
    case 0:
      status = 'disconnected';
      break;
    case 1:
      status = 'connected';
      break;
    case 2:
      status = 'connecting';
      break;
    case 3:
      status = 'disconnecting';
      break;
    default:
      status = 'unknown';
  }
  // Log toàn bộ thông tin kết nối mongoose
  const conn = mongoose.connection;
  const info = {
    success: state === 1,
    state,
    status,
    host: conn.host,
    port: conn.port,
    name: conn.name,
    readyState: conn.readyState,
    client: conn.client ? {
      topology: conn.client.topology ? conn.client.topology.constructor.name : null,
      s: conn.client.s ? conn.client.s : null
    } : null,
    error: conn.error ? conn.error.message : null,
    errorStack: conn.error ? conn.error.stack : null,
    _hasError: conn._hasError ? conn._hasError : null,
    _closeCalled: conn._closeCalled,
    _connectionString: conn._connectionString,
    // Thêm các thông tin khác nếu cần
  };
  res.json(info);
});

module.exports = router;