const express = require('express');
const router = express.Router();
const { getAllNews, uploadNews, updateNews, deleteNews } = require('../controllers/newsController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');

// Cấu hình multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Public route
router.get('/', getAllNews);

// Protected routes (admin only)
router.post('/upload', auth, upload.single('image'), uploadNews);
router.put('/:id', auth, upload.single('image'), updateNews);
router.delete('/:id', auth, deleteNews);

module.exports = router;