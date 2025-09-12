const express = require('express');
const {
    getAllSongs,
    getSongById,
    updateSong,
    addSong,
    updateLyrics,
    deleteSong,
    incrementView
} = require('../controllers/songController');
const multer = require('multer');

const storage = multer.memoryStorage();

const router = express.Router();
const upload = multer({ storage });

router.get('/all', getAllSongs);
router.get('/:id', getSongById);
router.put('/:id/update', upload.fields([
    { name: 'url_cover', maxCount: 1 },
    { name: 'url_song', maxCount: 1 }
]), updateSong);
router.post('/add', upload.fields([
    { name: 'url_cover', maxCount: 1 },
    { name: 'url_song', maxCount: 1 }
]), addSong);
router.put('/:id/update-lyrics', updateLyrics);
router.delete('/:id/delete', deleteSong);
router.post('/:id/increment-view', incrementView);

module.exports = router;
