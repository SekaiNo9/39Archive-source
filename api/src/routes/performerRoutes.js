const express = require('express');
const router = express.Router();
const performerController = require('../controllers/performerController');
const multer = require('multer');
const { storage } = require('../middleware/uploadLocal');
const upload = multer({ storage });

router.get('/all', performerController.getAllPerformers);
router.get('/:id', performerController.getPerformerById);
router.put('/:id/update', upload.single('url_avt'), performerController.updatePerformer);
router.post('/add', upload.single('url_avt'), performerController.addPerformer);
router.delete('/:id/delete', performerController.deletePerformer);

module.exports = router;
  