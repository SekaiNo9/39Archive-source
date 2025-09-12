const Composer = require('../models/Composer');
const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveFile(file, folder, ext) {
    ensureDir(folder);
    const timestamp = Date.now();
    const filename = `${timestamp}${ext}`;
    const dest = path.join(folder, filename);
    fs.writeFileSync(dest, file.buffer);
    return path.join('/', folder, filename).replace(/\\/g, '/');
}
 
// Lấy tất cả composer
const getAllComposers = async (req, res) => {
    try {
        const composers = await Composer.find({});
        res.status(200).json(composers);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách composer!', error: error.message });
    }
};

// Lấy thông tin một composer
const getComposer = async (req, res) => {
    try {
        const composer = await Composer.findById(req.params.id);
        if (!composer) {
            return res.status(404).json({ message: 'Không tìm thấy composer!' });
        }
        res.status(200).json(composer);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thông tin composer!', error: error.message });
    }
};

// Thêm composer
const addComposer = async (req, res) => {
    try {
        const { nick_name, country, description, social_link } = req.body;
        // Google Drive import đã được xóa - sử dụng Cloudinary
        
        if (!nick_name || !country || !description || !social_link || !req.file) {
            return res.status(400).json({ message: 'Thiếu thông tin hoặc file avatar!' });
        }

        // Upload avatar lên Cloudinary
        const { uploadToCloudinary } = require('../utils/cloudinaryReal');
        const avtResult = await uploadToCloudinary(req.file, 'avt');

        const composer = new Composer({ 
            nick_name, 
            country, 
            description, 
            social_link, 
            url_avt: avtResult.url,
            avt_file_id: avtResult.fileId
        });
        
        await composer.save();
        res.status(201).json(composer);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi thêm composer!', error: error.message });
    }
};

// Cập nhật composer
const updateComposer = async (req, res) => {
    try {
        const { id } = req.params;
        const { nick_name, country, description, social_link } = req.body;
        const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryReal');

        let updateData = { nick_name, country, description, social_link };

        if (req.file) {
            // Tìm composer hiện tại để xóa file cũ
            const existingComposer = await Composer.findById(id);
            
            // Upload avatar mới lên Cloudinary
            const avtResult = await uploadToCloudinary(req.file, 'avt');
            
            updateData.url_avt = avtResult.url;
            updateData.avt_file_id = avtResult.fileId;
            
            // Xóa file cũ nếu tồn tại
            if (existingComposer && existingComposer.avt_file_id) {
                try {
                    await deleteFromCloudinary(existingComposer.avt_file_id);
                } catch (error) {
                    }
            }
        }

        const composer = await Composer.findByIdAndUpdate(id, updateData, { new: true });
        if (!composer) {
            return res.status(404).json({ message: 'Không tìm thấy composer!' });
        }
        res.status(200).json(composer);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật composer!', error: error.message });
    }
};

// Xóa composer
const deleteComposer = async (req, res) => {
    try {
        const { id } = req.params;
        const { deleteFromCloudinary } = require('../utils/cloudinaryReal');
        
        const composer = await Composer.findById(id);
        if (!composer) {
            return res.status(404).json({ message: 'Không tìm thấy composer!' });
        }
        
        // Xóa file avatar từ Cloudinary
        if (composer.avt_url) {
            try {
                const result = await deleteFromCloudinary(composer.avt_url);
                } catch (error) {
                }
        }
        
        await Composer.findByIdAndDelete(id);
        res.status(200).json({ message: 'Xóa composer thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa composer!', error: error.message });
    }
};

module.exports = { getAllComposers, getComposer, addComposer, updateComposer, deleteComposer };
