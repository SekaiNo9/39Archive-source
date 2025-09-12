// models/Account.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AccountSchema = new mongoose.Schema({
  login_name: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  latedSong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  favSong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  avt: { type: String }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual để lấy playlists của user
AccountSchema.virtual('playlists', {
  ref: 'Playlist',
  localField: '_id',
  foreignField: 'author'
});

module.exports = mongoose.model('Account', AccountSchema);
