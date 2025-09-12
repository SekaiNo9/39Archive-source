// models/News.js
const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  image: { type: String },
  image_file_id: { type: String },
  uploadDate: { type: Date, default: Date.now },
  artist: { type: String, required: true } // username của người đăng
});

module.exports = mongoose.model('News', NewsSchema);
