const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề playlist là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự']
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Tác giả playlist là bắt buộc']
  },
  
  updateDate: {
    type: Date,
    default: Date.now
  },
  
  songlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  
  is_public: {
    type: Boolean,
    default: false
  },
  
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }],
  
  description: {
    type: String,
    maxlength: [500, 'Mô tả không được vượt quá 500 ký tự'],
    default: ''
  },
  
  cover_image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual để đếm số bài hát
playlistSchema.virtual('songCount').get(function() {
  return this.songlist.length;
});

// Virtual để đếm số likes
playlistSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Index để tối ưu tìm kiếm
playlistSchema.index({ title: 'text', description: 'text' });
playlistSchema.index({ author: 1 });
playlistSchema.index({ is_public: 1, likes: -1 });
playlistSchema.index({ updateDate: -1 });

// Middleware để cập nhật updateDate khi có thay đổi
playlistSchema.pre('save', function(next) {
  if (this.isModified('songlist')) {
    this.updateDate = Date.now();
  }
  next();
});

// Static method để lấy top playlists
playlistSchema.statics.getTopPublicPlaylists = function(limit = 5) {
  return this.find({ is_public: true })
    .populate('author', 'nick_name')
    .populate('songlist', 'title')
    .sort({ likes: -1, updateDate: -1 })
    .limit(limit);
};

// Static method để tìm kiếm playlists
playlistSchema.statics.searchPlaylists = function(query, options = {}) {
  const { page = 1, limit = 20, sortBy = 'likes' } = options;
  const skip = (page - 1) * limit;
  
  let searchQuery = { is_public: true };
  
  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ];
  }
  
  let sortOptions = {};
  if (sortBy === 'likes') {
    sortOptions = { likes: -1, updateDate: -1 };
  } else if (sortBy === 'date') {
    sortOptions = { updateDate: -1 };
  } else if (sortBy === 'title') {
    sortOptions = { title: 1 };
  }
  
  return this.find(searchQuery)
    .populate('author', 'nick_name')
    .populate('songlist', 'title')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
};

// Instance method để kiểm tra user đã like chưa
playlistSchema.methods.isLikedBy = function(userId) {
  return this.likes.includes(userId);
};

// Instance method để toggle like
playlistSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(index, 1);
  }
  return this.save();
};

// Instance method để thêm bài hát
playlistSchema.methods.addSong = function(songId) {
  if (!this.songlist.includes(songId)) {
    this.songlist.push(songId);
    this.updateDate = Date.now();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method để xóa bài hát
playlistSchema.methods.removeSong = function(songId) {
  const index = this.songlist.indexOf(songId);
  if (index !== -1) {
    this.songlist.splice(index, 1);
    this.updateDate = Date.now();
    return this.save();
  }
  return Promise.resolve(this);
};

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;