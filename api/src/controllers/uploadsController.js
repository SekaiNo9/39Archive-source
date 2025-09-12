// Legacy route để serve file cũ từ database
// Dữ liệu mới đã lưu direct Cloudinary URLs với format: 
// https://res.cloudinary.com/diidna3y8/image/upload/v{version}/{filename}
require('dotenv').config();

// Import models để tìm file thực tế
const Song = require('../models/Song');
const Composer = require('../models/Composer'); 
const Performer = require('../models/Performer');
const Account = require('../models/Account');
const News = require('../models/News');

// Tìm file thực tế trong database
async function findActualCloudinaryUrl(folderName, filename) {
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        
        // Tìm trong database dựa vào filename (bỏ extension để match)
        // Vì tất cả ảnh giờ đều convert thành PNG, tìm theo base name
        const baseFileName = filename.replace(/\.[^/.]+$/, '');
        
        let actualUrl = null;
        
        if (folderName === 'avt' || folderName === 'avatars') {
            // Tìm trong performers
            const performer = await Performer.findOne({ 
                url_avt: { $regex: baseFileName, $options: 'i' }
            });
            if (performer?.url_avt?.includes('cloudinary.com')) {
                actualUrl = performer.url_avt;
            }
            
            // Tìm trong composers nếu chưa có
            if (!actualUrl) {
                const composer = await Composer.findOne({ 
                    url_avt: { $regex: baseFileName, $options: 'i' }
                });
                if (composer?.url_avt?.includes('cloudinary.com')) {
                    actualUrl = composer.url_avt;
                }
            }
            
            // Tìm trong accounts nếu chưa có
            if (!actualUrl) {
                const account = await Account.findOne({ 
                    avt: { $regex: baseFileName, $options: 'i' }
                });
                if (account?.avt?.includes('cloudinary.com')) {
                    actualUrl = account.avt;
                }
            }
        }
        
        if (folderName === 'covers') {
            const song = await Song.findOne({ 
                url_cover: { $regex: baseFileName, $options: 'i' }
            });
            if (song?.url_cover?.includes('cloudinary.com')) {
                actualUrl = song.url_cover;
            }
        }
        
        if (folderName === 'songs') {
            const song = await Song.findOne({ 
                url_song: { $regex: baseFileName, $options: 'i' }
            });
            if (song?.url_song?.includes('cloudinary.com')) {
                actualUrl = song.url_song;
            }
        }
        
        if (folderName === 'news') {
            const news = await News.findOne({ 
                image: { $regex: baseFileName, $options: 'i' }
            });
            if (news?.image?.includes('cloudinary.com')) {
                actualUrl = news.image;
            }
        }
        
        return actualUrl;
        
    } catch (error) {
        return null;
    }
}

// Controller để redirect file đến Cloudinary thực tế
const serveFile = async (req, res) => {
    try {
        const { folder, filename } = req.params;

        // Tìm URL thực tế trong database
        const actualUrl = await findActualCloudinaryUrl(folder, filename);
        
        if (actualUrl) {
            res.redirect(301, actualUrl);
        } else {
            // Fallback cho avatar - trả về default
            if (folder === 'avt' || folder === 'avatars') {
                const defaultUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1757515100/default_avatar.png`;
                res.redirect(301, defaultUrl);
            } else {
                res.status(404).json({ 
                    error: 'File không tìm thấy',
                    folder: folder,
                    filename: filename,
                    message: 'Legacy file không tồn tại trong database'
                });
            }
        }

    } catch (error) {
        res.status(500).json({ 
            error: 'Lỗi server khi lấy file',
            message: error.message 
        });
    }
};

module.exports = { serveFile };
