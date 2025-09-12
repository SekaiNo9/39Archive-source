const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Import models
const Song = require('../models/Song');
const Composer = require('../models/Composer');
const Performer = require('../models/Performer');
const News = require('../models/News');
const Account = require('../models/Account');

// Connect to MongoDB using config
const dbConfig = require('../config/db');

async function cleanupLegacyUrls() {
    try {
        await mongoose.connect(dbConfig.mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        
        // Xóa tất cả records có legacy URLs (bắt đầu với /uploads/)
        // Songs
        const legacySongs = await Song.find({
            $or: [
                { url_song: { $regex: '^/uploads/' } },
                { url_cover: { $regex: '^/uploads/' } }
            ]
        });
        // Composers  
        const legacyComposers = await Composer.find({
            url_avt: { $regex: '^/uploads/' }
        });
        // Performers
        const legacyPerformers = await Performer.find({
            url_avt: { $regex: '^/uploads/' }
        });
        // Accounts
        const legacyAccounts = await Account.find({
            avt: { $regex: '^/uploads/' }
        });
        // Update accounts to default Cloudinary avatar
        for (const account of legacyAccounts) {
            account.avt = `https://res.cloudinary.com/${cloudName}/image/upload/39archive/uploads/avt/default.jpg`;
            await account.save();
            }
        
        } catch (error) {
        } finally {
        await mongoose.disconnect();
        }
}

cleanupLegacyUrls();
