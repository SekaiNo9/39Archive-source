const express = require('express');
const router = express.Router();
const {
  getAllPlaylists,
  getTopPlaylists,
  searchPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  togglePublic,
  addSongToPlaylist,
  removeSongFromPlaylist,
  toggleLikePlaylist,
  getUserPlaylistsForSong
} = require('../controllers/playlistController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/all', getAllPlaylists);
router.get('/top', getTopPlaylists);
router.get('/search', searchPlaylists);
router.get('/:id', getPlaylistById);

// Protected routes - require authentication
router.post('/create', authMiddleware, createPlaylist);
router.put('/:id', authMiddleware, updatePlaylist);
router.delete('/:id', authMiddleware, deletePlaylist);
router.put('/:id/toggle-public', authMiddleware, togglePublic);
router.post('/:id/add-song', authMiddleware, addSongToPlaylist);
router.delete('/:id/remove-song/:songId', authMiddleware, removeSongFromPlaylist);
router.post('/:id/like', authMiddleware, toggleLikePlaylist);
router.get('/user/:songId', authMiddleware, getUserPlaylistsForSong);

module.exports = router;