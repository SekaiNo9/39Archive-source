const mongoose = require('mongoose');

const lyricSchema = new mongoose.Schema({
    start_time: {
        type: Number,
        required: false
    },
    line: {
        type: String,
        required: false
    }
});

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: true 
    },
    duration: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    composers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Composer',
        required: true
    }],
    performers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Performer',
        required: true
    }],
    language: {
        type: String,
        required: true
    },
    release_date: {
        type: Date,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    lyrics: [lyricSchema],
    mv_link: {
        type: String
    },
    url_cover: {
        type: String
    },
    url_song: {
        type: String,
        required: true
    },
    cover_file_id: {
        type: String // Google Drive file ID for cover
    },
    song_file_id: {
        type: String // Google Drive file ID for song
    },
    is_trending: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Song', songSchema);