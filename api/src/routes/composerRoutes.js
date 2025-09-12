const express = require('express');
const router = express.Router();
const composerController = require('../controllers/composerController');
const multer = require('multer');
const { storage } = require('../middleware/uploadLocal');

// Lưu file trong RAM
const upload = multer({ storage });

router.get('/all', composerController.getAllComposers);
router.get('/:id', composerController.getComposer);
router.put('/:id/update', upload.single('url_avt'), composerController.updateComposer);
router.post('/add', upload.single('url_avt'), composerController.addComposer);
router.delete('/:id/delete', composerController.deleteComposer);

module.exports = router;
 