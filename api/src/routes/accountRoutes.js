const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/authMiddleware');

// Import controller với tên đúng
const accountCtrl = require('../controllers/accountController');

// Cấu hình multer cho file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});

// Public routes (không cần auth)
router.post('/login', accountCtrl.login);
router.post('/register', accountCtrl.register);
router.post('/logout', accountCtrl.logout); // Thêm route logout

// Protected routes (cần auth)
router.get('/all', auth, accountCtrl.getAllAccounts);
router.get('/me', auth, accountCtrl.getMe);
router.get('/:id', auth, accountCtrl.getAccountById);
router.put('/:id/reset-password', auth, accountCtrl.resetPassword);
router.delete('/:id', auth, accountCtrl.deleteAccount);
router.put('/:userId/latest-song', auth, accountCtrl.updateLatestSong);
router.put('/:id/update-fav', auth, accountCtrl.updatefavSong);
router.put('/:id/profile', auth, upload.single('url_avt'), accountCtrl.updateProfile);
router.put('/:id/password', auth, upload.none(), accountCtrl.updatePassword);

module.exports = router;
