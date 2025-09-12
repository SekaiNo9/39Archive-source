const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file lên Cloudinary
async function uploadToCloudinary(file, folderName = 'songs') {
  try {
    if (!file.buffer) {
      throw new Error('File buffer is empty');
    }

    // Convert buffer to base64
    const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    
    // Xác định upload options dựa vào loại file
    const isImage = file.mimetype.startsWith('image/');
    const isAudio = file.mimetype.startsWith('audio/');
    
    // Tạo filename dễ đọc (loại bỏ timestamp phức tạp)
    const originalName = file.originalname;
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
    const timestamp = Date.now();
    const cleanFileName = `${nameWithoutExt}_${timestamp}`;
    
    let uploadOptions = {
      folder: `39archive/uploads/${folderName}`, // 📁 Đúng cấu trúc: uploads/avt/, uploads/songs/, etc.
      public_id: cleanFileName, // 🎯 Tên file dễ đọc với timestamp ngắn
      overwrite: true, // Cho phép ghi đè nếu trùng tên
    };
    
    if (isImage) {
      // Cho ảnh: LUÔN convert thành PNG và tối ưu
      uploadOptions = {
        ...uploadOptions,
        resource_type: 'image',
        format: 'png', // 🎯 BẮT BUỘC chuyển thành PNG
        transformation: [
          { 
            quality: 'auto:best', // Chất lượng tốt nhất
            fetch_format: 'png',  // Đầu ra luôn là PNG
            flags: 'png8'         // Optimize PNG
          }
        ]
      };
    } else if (isAudio) {
      // Cho audio: giữ nguyên format
      uploadOptions = {
        ...uploadOptions,
        resource_type: 'video' // Cloudinary dùng 'video' cho audio
      };
    } else {
      // Cho file khác
      uploadOptions = {
        ...uploadOptions,
        resource_type: 'auto'
      };
    }

    const result = await cloudinary.uploader.upload(fileStr, uploadOptions);

    return {
      fileId: result.public_id, // Dùng để xóa file sau này
      url: result.secure_url,   // URL trực tiếp từ Cloudinary CDN
      originalName: file.originalname,
      uniqueName: result.public_id,
      format: result.format,
      size: result.bytes
    };

  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

// Xóa file từ Cloudinary
async function deleteFromCloudinary(fileUrl) {
  try {
    // Extract public_id từ URL
    // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{format}
    const urlParts = fileUrl.split('/');
    const fileWithExt = urlParts[urlParts.length - 1];
    const publicId = fileWithExt.split('.')[0];
    
    // Tìm full public_id (có thể có folder)
    let fullPublicId = publicId;
    
    // Nếu URL có folder structure, reconstruct public_id
    if (fileUrl.includes('39archive')) {
      const archiveIndex = urlParts.indexOf('39archive');
      if (archiveIndex !== -1) {
        const pathParts = urlParts.slice(archiveIndex);
        fullPublicId = pathParts.join('/').replace(/\.[^/.]+$/, '');
      }
    }

    const result = await cloudinary.uploader.destroy(fullPublicId);
    
    return result;
    
  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

// Test connection
async function testCloudinaryConnection() {
  try {
    const result = await cloudinary.api.ping();
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  testCloudinaryConnection
};
