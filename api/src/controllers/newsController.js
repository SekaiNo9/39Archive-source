const News = require('../models/News');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryReal');
const path = require('path');
const fs = require('fs');

// Lấy tất cả news (sắp xếp mới nhất)
const getAllNews = async (req, res) => {
  try {
    const { from, to } = req.query;
    let filter = {};
    
    if (from || to) filter.uploadDate = {};
    if (from) filter.uploadDate.$gte = new Date(from);
    if (to) {
      // Cộng thêm 1 ngày để lấy cả ngày cuối
      const endDate = new Date(to);
      endDate.setDate(endDate.getDate() + 1);
      filter.uploadDate.$lte = endDate;
    }

    const news = await News.find(filter).sort({ uploadDate: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// Upload News with Image
const uploadNews = async (req, res) => {
  try {
    if (!req.body.title || !req.body.body) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung không được để trống' });
    }

    const { title, body, artist } = req.body;
    
    // Kiểm tra quyền admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền đăng tin tức' });
    }
    
    let image = null;
    let image_file_id = null;
    
    if (req.file) {
      try {
        // Upload image lên Cloudinary với folder 'news'
        const uploadResult = await uploadToCloudinary(req.file, 'news');
        
        image = uploadResult.url;
        image_file_id = uploadResult.fileId;
        
        } catch (uploadError) {
        return res.status(500).json({ 
          message: 'Lỗi khi upload ảnh: ' + uploadError.message 
        });
      }
    }

    const news = new News({ 
      title, 
      body, 
      artist: artist || req.username || 'Admin', 
      image, 
      image_file_id 
    });
    
    await news.save();
    res.status(201).json(news);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo tin tức: ' + err.message });
  }
};

// Update news
const updateNews = async (req, res) => {
  try {
    const { title, body } = req.body;
    
    // Kiểm tra quyền admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật tin tức' });
    }
    
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'Không tìm thấy tin tức' });
    }

    if (title) news.title = title;
    if (body) news.body = body;
    
    // Xử lý cập nhật ảnh mới
    if (req.file) {
      try {
        // Upload ảnh mới lên Cloudinary
        const imageResult = await uploadToCloudinary(req.file, 'news');
        
        // Lưu lại public_id của ảnh cũ để xóa sau
        const oldPublicId = news.image_file_id;
        
        // Cập nhật URL và ID mới
        news.image = imageResult.url;
        news.image_file_id = imageResult.public_id;
        
        // Xóa ảnh cũ từ Cloudinary nếu tồn tại
        if (oldPublicId) {
          try {
            await deleteFromCloudinary(oldPublicId);
          } catch (deleteError) {
            // Silently continue if deletion fails
          }
        }
      } catch (uploadError) {
        return res.status(500).json({ 
          message: 'Lỗi khi upload ảnh mới: ' + uploadError.message 
        });
      }
    }

    await news.save();
    res.json({ 
      message: 'Cập nhật tin tức thành công!', 
      news 
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật tin tức: ' + err.message });
  }
};

// Delete News with Image
const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'Không tìm thấy tin tức' });
    }
    
    // Kiểm tra quyền admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa tin tức' });
    }
    
    // Xóa ảnh nếu có
    if (news.image_file_id) {
      try {
        await deleteFromCloudinary(news.image);
      } catch (error) {
        // Vẫn tiếp tục xóa tin tức ngay cả khi xóa ảnh thất bại
      }
    }
    
    await News.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Xóa tin tức thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa tin tức' });
  }
};

module.exports = {
  getAllNews,
  uploadNews,
  updateNews, 
  deleteNews
};