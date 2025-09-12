const Playlist = require('../models/Playlist');
const Account = require('../models/Account');
const Song = require('../models/Song');

// Lấy tất cả playlists (public hoặc của user)
const getAllPlaylists = async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    
    if (userId) {
      // Lấy playlists của user cụ thể (cả public và private)
      query.author = userId;
    } else {
      // Chỉ lấy playlists public
      query.is_public = true;
    }
    
    const playlists = await Playlist.find(query)
      .populate('author', 'username')
      .populate('songlist', 'title artist url_cover')
      .sort({ updateDate: -1 });
    
    res.json({
      success: true,
      count: playlists.length,
      data: playlists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách playlist',
      error: error.message
    });
  }
};

// Lấy top playlists (theo likes)
const getTopPlaylists = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const topPlaylists = await Playlist.aggregate([
      { $match: { is_public: true } },
      {
        $addFields: {
          likeCount: { $size: "$likes" },
          songCount: { $size: "$songlist" }
        }
      },
      { $sort: { likeCount: -1, updateDate: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'accounts',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [{ $project: { nick_name: 1 } }]
        }
      },
      {
        $lookup: {
          from: 'songs',
          localField: 'songlist',
          foreignField: '_id',
          as: 'songlist',
          pipeline: [{ $project: { title: 1, url_cover: 1 } }]
        }
      },
      { $unwind: '$author' }
    ]);
    
    res.json({
      success: true,
      count: topPlaylists.length,
      data: topPlaylists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy top playlist',
      error: error.message
    });
  }
};

// Tìm kiếm playlists
const searchPlaylists = async (req, res) => {
  try {
    const { 
      q: query, 
      author, 
      page = 1, 
      limit = 20, 
      sortBy = 'likes' 
    } = req.query;
    
    let searchQuery = { is_public: true };
    
    // Tìm kiếm theo title hoặc description
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Tìm kiếm theo tên tác giả
    if (author) {
      const authors = await Account.find({
        nick_name: { $regex: author, $options: 'i' }
      }).select('_id');
      
      const authorIds = authors.map(a => a._id);
      searchQuery.author = { $in: authorIds };
    }
    
    // Sắp xếp
    let sortOptions = {};
    if (sortBy === 'likes') {
      sortOptions = { likes: -1, updateDate: -1 };
    } else if (sortBy === 'date') {
      sortOptions = { updateDate: -1 };
    } else if (sortBy === 'title') {
      sortOptions = { title: 1 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const playlists = await Playlist.find(searchQuery)
      .populate('author', 'username')
      .populate('songlist', 'title url_cover')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Playlist.countDocuments(searchQuery);
    
    res.json({
      success: true,
      count: playlists.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: playlists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm playlist',
      error: error.message
    });
  }
};

// Lấy playlist theo ID
const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const playlist = await Playlist.findById(id)
      .populate('author', 'username')
      .populate({
        path: 'songlist',
        populate: [
          { path: 'composers', select: 'nick_name' },
          { path: 'performers', select: 'nick_name' }
        ]
      });
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy playlist'
      });
    }
    
    // Kiểm tra quyền xem (public hoặc là chủ sở hữu)
    if (!playlist.is_public && (!req.userId || playlist.author._id.toString() !== req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem playlist này'
      });
    }
    
    res.json({
      success: true,
      data: playlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin playlist',
      error: error.message
    });
  }
};

// Tạo playlist mới
const createPlaylist = async (req, res) => {
  try {
    const { title, description, is_public = false } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề playlist là bắt buộc'
      });
    }
    
    const playlist = new Playlist({
      title,
      description,
      author: req.userId,
      is_public,
      songlist: [],
      likes: []
    });
    
    await playlist.save();
    await playlist.populate('author', 'username');
    
    res.status(201).json({
      success: true,
      message: 'Tạo playlist thành công',
      data: playlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo playlist',
      error: error.message
    });
  }
};

// Cập nhật playlist
const updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, is_public } = req.body;
    
    const playlist = await Playlist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy playlist'
      });
    }
    
    // Kiểm tra quyền sở hữu
    if (playlist.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền chỉnh sửa playlist này'
      });
    }
    
    if (title) playlist.title = title;
    if (description !== undefined) playlist.description = description;
    if (is_public !== undefined) playlist.is_public = is_public;
    playlist.updateDate = Date.now();
    
    await playlist.save();
    await playlist.populate('author', 'username');
    
    res.json({
      success: true,
      message: 'Cập nhật playlist thành công',
      data: playlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật playlist',
      error: error.message
    });
  }
};

// Xóa playlist
const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    
    const playlist = await Playlist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy playlist'
      });
    }
    
    // Kiểm tra quyền sở hữu
    if (playlist.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa playlist này'
      });
    }
    
    await Playlist.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Xóa playlist thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa playlist',
      error: error.message
    });
  }
};

// Toggle public/private
const togglePublic = async (req, res) => {
  try {
    const { id } = req.params;
    
    const playlist = await Playlist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy playlist'
      });
    }
    
    // Kiểm tra quyền sở hữu
    if (playlist.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thay đổi trạng thái playlist này'
      });
    }
    
    playlist.is_public = !playlist.is_public;
    playlist.updateDate = Date.now();
    await playlist.save();
    
    res.json({
      success: true,
      message: `Đã ${playlist.is_public ? 'công khai' : 'ẩn'} playlist`,
      data: { is_public: playlist.is_public }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thay đổi trạng thái playlist',
      error: error.message
    });
  }
};

// Thêm bài hát vào playlist
const addSongToPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    
    const playlist = await Playlist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy playlist'
      });
    }
    
    // Kiểm tra quyền sở hữu
    if (playlist.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thêm bài hát vào playlist này'
      });
    }
    
    // Kiểm tra bài hát có tồn tại không
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài hát'
      });
    }
    
    // Kiểm tra bài hát đã có trong playlist chưa
    if (playlist.songlist.includes(songId)) {
      return res.status(400).json({
        success: false,
        message: 'Bài hát đã có trong playlist'
      });
    }
    
    await playlist.addSong(songId);
    
    res.json({
      success: true,
      message: 'Thêm bài hát vào playlist thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm bài hát vào playlist',
      error: error.message
    });
  }
};

// Xóa bài hát khỏi playlist
const removeSongFromPlaylist = async (req, res) => {
  try {
    const { id, songId } = req.params;
    
    const playlist = await Playlist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy playlist'
      });
    }
    
    // Kiểm tra quyền sở hữu
    if (playlist.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa bài hát khỏi playlist này'
      });
    }
    
    await playlist.removeSong(songId);
    
    res.json({
      success: true,
      message: 'Xóa bài hát khỏi playlist thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa bài hát khỏi playlist',
      error: error.message
    });
  }
};

// Toggle like playlist
const toggleLikePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    
    const playlist = await Playlist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy playlist'
      });
    }
    
    // Chỉ có thể like playlist public
    if (!playlist.is_public) {
      return res.status(403).json({
        success: false,
        message: 'Không thể like playlist riêng tư'
      });
    }
    
    await playlist.toggleLike(req.userId);
    
    const isLiked = playlist.likes.includes(req.userId);
    
    res.json({
      success: true,
      message: isLiked ? 'Đã thích playlist' : 'Đã bỏ thích playlist',
      data: { 
        isLiked,
        likeCount: playlist.likes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thao tác like playlist',
      error: error.message
    });
  }
};

// Lấy playlists của user để thêm bài hát
const getUserPlaylistsForSong = async (req, res) => {
  try {
    const { songId } = req.params;
    
    const playlists = await Playlist.find({ author: req.userId })
      .select('title songlist')
      .sort({ updateDate: -1 });
    
    // Kiểm tra bài hát đã có trong playlist nào chưa
    const playlistsWithStatus = playlists.map(playlist => ({
      _id: playlist._id,
      title: playlist.title,
      hasSong: playlist.songlist.includes(songId)
    }));
    
    res.json({
      success: true,
      count: playlistsWithStatus.length,
      data: playlistsWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách playlist',
      error: error.message
    });
  }
};

module.exports = {
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
};