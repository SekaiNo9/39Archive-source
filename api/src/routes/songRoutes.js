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

// List all songs
router.get('/all', getAllSongs);

// Create song (must be before any ":id" routes)
router.post('/add', upload.fields([
    { name: 'url_cover', maxCount: 1 },
    { name: 'url_song', maxCount: 1 }
]), addSong);

// Optional: handle GET /add gracefully (avoid treating as id)
router.get('/add', (req, res) => {
    res.status(405).json({ success: false, message: 'Method Not Allowed. Use POST /song/add to create a song.' });
});

// ID routes (restrict to valid Mongo ObjectId)
const objectId = '[0-9a-fA-F]{24}';
router.get(`/:id(${objectId})`, getSongById);
router.put(`/:id(${objectId})/update`, upload.fields([
    { name: 'url_cover', maxCount: 1 },
    { name: 'url_song', maxCount: 1 }
]), updateSong);
router.put(`/:id(${objectId})/update-lyrics`, updateLyrics);
router.delete(`/:id(${objectId})/delete`, deleteSong);
router.post(`/:id(${objectId})/increment-view`, incrementView);

module.exports = router;
