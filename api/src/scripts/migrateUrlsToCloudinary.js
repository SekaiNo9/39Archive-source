const mongoose = require('mongoose');
const Song = require('../models/Song');
const Composer = require('../models/Composer');
const Performer = require('../models/Performer');
const News = require('../models/News');
const Account = require('../models/Account');
require('dotenv').config();

// Helper function để convert URL sang Cloudinary
function convertToCloudinaryUrl(oldUrl) {
    if (!oldUrl || oldUrl.includes('cloudinary.com')) {
        return oldUrl; // Đã là Cloudinary URL hoặc null
    }
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    
    // Parse old URL: /uploads/folder/filename.ext
    const match = oldUrl.match(/\/uploads\/([^\/]+)\/(.+)/);
    if (!match) return oldUrl;
    
    const [, folderName, filename] = match;
    
    // Mapping tên thư mục theo cấu trúc Cloudinary thực tế
    let targetFolder = folderName;
    if (folderName === 'avatars') targetFolder = 'avt';
    // covers và songs giữ nguyên
    
    // Xác định resource type
    const extension = filename.split('.').pop().toLowerCase();
    let resourceType = 'image';
    
    if (['mp3', 'wav', 'flac', 'm4a', 'aac'].includes(extension)) {
        resourceType = 'video'; // Cloudinary dùng 'video' cho audio
    }
    
    // GIỮ NGUYÊN filename có extension
    return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/39archive/uploads/${targetFolder}/${filename}`;
}

async function migrateUrlsToCloudinary() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        // 1. Migrate Songs
        const songs = await Song.find({
            $or: [
                { url_cover: { $regex: '^/uploads/' } },
                { url_song: { $regex: '^/uploads/' } }
            ]
        });
        
        for (let song of songs) {
            const updates = {};
            
            if (song.url_cover && song.url_cover.startsWith('/uploads/')) {
                updates.url_cover = convertToCloudinaryUrl(song.url_cover);
                }
            
            if (song.url_song && song.url_song.startsWith('/uploads/')) {
                updates.url_song = convertToCloudinaryUrl(song.url_song);
                }
            
            if (Object.keys(updates).length > 0) {
                await Song.findByIdAndUpdate(song._id, updates);
                }
        }
        
        // 2. Migrate Composers
        const composers = await Composer.find({
            url_avt: { $regex: '^/uploads/' }
        });
        
        for (let composer of composers) {
            const newUrl = convertToCloudinaryUrl(composer.url_avt);
            await Composer.findByIdAndUpdate(composer._id, { url_avt: newUrl });
            }
        
        // 3. Migrate Performers
        const performers = await Performer.find({
            url_avt: { $regex: '^/uploads/' }
        });
        
        for (let performer of performers) {
            const newUrl = convertToCloudinaryUrl(performer.url_avt);
            await Performer.findByIdAndUpdate(performer._id, { url_avt: newUrl });
            }
        
        // 4. Migrate News
        const news = await News.find({
            image: { $regex: '^/uploads/' }
        });
        
        for (let newsItem of news) {
            const newUrl = convertToCloudinaryUrl(newsItem.image);
            await News.findByIdAndUpdate(newsItem._id, { image: newUrl });
            }
        
        // 5. Migrate Accounts (avatars)
        const accounts = await Account.find({
            avt: { $regex: '^/uploads/' }
        });
        
        for (let account of accounts) {
            const newUrl = convertToCloudinaryUrl(account.avt);
            await Account.findByIdAndUpdate(account._id, { avt: newUrl });
            }
        
        await mongoose.disconnect();
        
    } catch (error) {
        process.exit(1);
    }
}

// Chạy migration
migrateUrlsToCloudinary();
