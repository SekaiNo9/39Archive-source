const mongoose = require('mongoose');

const performerSchema = new mongoose.Schema({
    nick_name: { type: String, required: true },
    voice_actor: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: Number, required: true },
    birthday: { type: String, required: true },
    symbol: { type: String, required: true },
    debut_day: { type: Date, required: true },
    description: { type: String, required: true },
    detail_info: { type: String, required: true },
    url_avt: { type: String, required: true },
    avt_file_id: { type: String, required: false }
});

module.exports = mongoose.model('Performer', performerSchema);