const mongoose = require('mongoose');

const composerSchema = new mongoose.Schema({
    nick_name: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    social_link: {
        type: String,
        required: true
    },
    url_avt: {
        type: String,
        required: true
    },
    avt_file_id: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Composer', composerSchema);