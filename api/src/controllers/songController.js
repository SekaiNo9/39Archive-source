const Song = require('../models/Song');
const fs = require('fs');
const path = require('path');

// Lấy tất cả bài hát
exports.getAllSongs = async (req, res) => {
  try {
    let songs = await Song.find({}, "_id title duration composers performers url_cover url_song views release_date")
      .populate("composers", "nick_name")
      .populate("performers", "nick_name")
      .sort({ release_date: -1 }); // Sắp xếp theo ngày phát hành mới nhất trước

    // Chuyển composers/performers thành mảng nick_name
    songs = songs.map(song => ({
      _id: song._id,
      title: song.title,
      duration: song.duration || 0,
      url_cover: song.url_cover,
      url_song: song.url_song,
      composers: song.composers.map(c => c.nick_name),
      performers: song.performers.map(p => p.nick_name),
      views: song.views || 0,
      release_date: song.release_date,
    }));
 
    res.status(200).json({
      success: true,
      count: songs.length,
      data: songs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách bài hát!",
      error: error.message
    });
  }
};

// Lấy bài hát theo ID
exports.getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('composers', 'nick_name')
      .populate('performers', 'nick_name');
    if (!song) return res.status(404).json({ message: 'Không tìm thấy bài hát!' });
    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy bài hát!', error: error.message });
  }
};

// Thêm bài hát
exports.addSong = async (req, res) => {
  try {
    const { title, duration, description, composers, performers, language, release_date, mv_link } = req.body;
    const { uploadToCloudinary } = require('../utils/cloudinaryReal');

    if (!title || !duration || !description || !composers || !performers || !language || !release_date || !mv_link) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc!' });
    }

    if (!req.files?.url_song || !req.files?.url_cover) {
      return res.status(400).json({ message: 'Thiếu file nhạc hoặc ảnh bìa!' });
    }

    // Upload song lên Google Drive
    const songResult = await uploadToCloudinary(req.files['url_song'][0], 'songs');

    // Upload cover lên Cloudinary  
    const coverResult = await uploadToCloudinary(req.files['url_cover'][0], 'covers');
    
    const composersArray = Array.isArray(composers) ? composers : [composers];
    const performersArray = Array.isArray(performers) ? performers : [performers];

    const song = new Song({
      title,
      duration,
      description,
      composers: composersArray,
      performers: performersArray,
      language,
      release_date,
      mv_link,
      url_cover: coverResult.url,
      url_song: songResult.url,
      cover_file_id: coverResult.fileId,
      song_file_id: songResult.fileId
    });

    await song.save();
    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm bài hát!', error: error.message });
  }
};

// Cập nhật bài hát
exports.updateSong = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.composers && !Array.isArray(updateData.composers)) {
      updateData.composers = [updateData.composers];
    }
    if (updateData.performers && !Array.isArray(updateData.performers)) {
      updateData.performers = [updateData.performers];
    }

    const song = await Song.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!song) return res.status(404).json({ message: 'Không tìm thấy bài hát để cập nhật!' });

    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật bài hát!', error: error.message });
  }
};

// Cập nhật lyric
exports.updateLyrics = async (req, res) => {
  try {
    const { lyric } = req.body;
    if (!lyric) return res.status(400).json({ message: 'Thiếu nội dung lyric!' });

    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { lyrics: lyric },
      { new: true }
    );

    if (!song) return res.status(404).json({ message: 'Không tìm thấy bài hát để cập nhật lyric!' });

    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật lyric!', error: error.message });
  }
};

// Xóa bài hát
exports.deleteSong = async (req, res) => {
  try {
    const { deleteFromCloudinary } = require('../utils/cloudinaryReal');
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ message: 'Không tìm thấy bài hát để xóa!' });

    // Xóa files trên Cloudinary
    if (song.url_cover) {
      try {
        const coverResult = await deleteFromCloudinary(song.url_cover);
      } catch (err) {
        // Silently continue if deletion fails
      }
    }
    if (song.url_song) {
      try {
        const songResult = await deleteFromCloudinary(song.url_song);
      } catch (err) {
        // Silently continue if deletion fails
      }
    }

    res.status(200).json({ message: 'Xóa bài hát thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa bài hát!', error: error.message });
  }
};

exports.incrementView = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, // tăng 1 view
      { new: true }
    );
    if (!song) return res.status(404).json({ message: 'Không tìm thấy bài hát!' });
    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tăng view bài hát!', error: error.message });
  }
};

