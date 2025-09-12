const Performer = require('../models/Performer');
const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Lấy tất cả performer
const getAllPerformers = async (req, res) => {
  try {
    const performers = await Performer.find({});
    res.status(200).json(performers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách performer!', error: error.message });
  }
};
 
// Thêm performer
const addPerformer = async (req, res) => {
  try {
    const { nick_name, voice_actor, gender, age, birthday, symbol, debut_day, description, detail_info } = req.body;
    const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryReal');

    if (!nick_name || !voice_actor || !gender || !age || !birthday || !symbol || !debut_day || !description || !req.file) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc hoặc file avatar!' });
    }

        // Upload avatar lên Cloudinary
        const avtResult = await uploadToCloudinary(req.file, 'avt');
        
    const performer = new Performer({
      nick_name,
      voice_actor,
      gender,
      age,
      birthday,
      symbol,
      debut_day,
      description,
      detail_info: detail_info || '', // optional
      url_avt: avtResult.url,
      avt_file_id: avtResult.fileId
    });

    await performer.save();
    res.status(201).json(performer);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm performer!', error: error.message });
  }
};

// Lấy performer theo ID
const getPerformerById = async (req, res) => {
  try {
    const performer = await Performer.findById(req.params.id);
    if (!performer) return res.status(404).json({ message: 'Không tìm thấy performer!' });
    res.status(200).json(performer);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy performer!', error: error.message });
  }
};

// Cập nhật performer
const updatePerformer = async (req, res) => {
  try {
    const old = await Performer.findById(req.params.id);
    if (!old) return res.status(404).json({ message: 'Không tìm thấy performer!' });

    const updateData = {};

    // Chỉ update field nào client gửi
    const allowedFields = ['nick_name', 'voice_actor', 'gender', 'age', 'birthday', 'symbol', 'debut_day', 'description', 'detail_info'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    // Xử lý cập nhật avatar mới
    if (req.file) {
      const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryReal');
      
      // Upload avatar mới lên Cloudinary
      const avtResult = await uploadToCloudinary(req.file, 'avt');
      
      updateData.url_avt = avtResult.url;
      updateData.avt_file_id = avtResult.fileId;
      
      // Xóa file cũ từ Cloudinary nếu tồn tại
      if (old.avt_file_id) {
        try {
          await deleteFromCloudinary(old.avt_file_id);
        } catch (error) {
          // Silently continue if deletion fails
        }
      }
    }

    const performer = await Performer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ message: 'Cập nhật performer thành công!', performer });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật performer!', error: error.message });
  }
};

// Xóa performer
const deletePerformer = async (req, res) => {
  try {
    const { deleteFromCloudinary } = require('../utils/cloudinaryReal');
    
    const performer = await Performer.findById(req.params.id);
    if (!performer) return res.status(404).json({ message: 'Không tìm thấy performer!' });

    // Xóa file avatar từ Cloudinary
    if (performer.avt_url) {
      try {
        const result = await deleteFromCloudinary(performer.avt_url);
        } catch (error) {
        }
    }
    
    await Performer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Xóa performer thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa performer!', error: error.message });
  }
};

module.exports = { getAllPerformers, getPerformerById, addPerformer, updatePerformer, deletePerformer };
