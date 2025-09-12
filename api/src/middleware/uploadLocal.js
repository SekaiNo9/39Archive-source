const multer = require('multer');

// Sử dụng memory storage để upload lên Google Drive
const storage = multer.memoryStorage();

const upload = multer({ 
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

module.exports = { storage, upload };
