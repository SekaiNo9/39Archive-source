const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Debug: Log cookies và headers
    console.log('🔍 Auth Debug:', {
      hasCookies: !!req.cookies,
      cookies: req.cookies,
      hasAuthHeader: !!req.header('Authorization'),
      authHeader: req.header('Authorization')
    });
    
    // Lấy token từ cookie hoặc header
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔍 Token found:', !!token);
    
    if (!token) {
      return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
    }

    // Verify token và lưu thông tin vào req
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    console.log('🔍 Token decoded:', { userId: decoded.userId, role: decoded.role });
    
    // Đây là dòng quan trọng - đảm bảo userId và role được lưu đúng vào req
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    next();
  } catch (err) {
    console.error('🔍 Auth error:', err.message);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

module.exports = auth;