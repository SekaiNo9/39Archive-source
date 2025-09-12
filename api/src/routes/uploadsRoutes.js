const express = require('express');
const router = express.Router();
const { serveFile } = require('../controllers/uploadsController');

router.get('/:folder/:filename', serveFile);

module.exports = router;
