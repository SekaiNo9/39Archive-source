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
    let uploadOptions = {
      folder: `39archive/uploads/${folderName}`,
      resource_type: 'auto',
      format: 'png', // Chuyển tất cả ảnh thành PNG
      quality: 'auto:good',
    };

    // Nếu là file âm thanh, không convert format
    if (file.mimetype && file.mimetype.startsWith('audio/')) {
      delete uploadOptions.format;
      uploadOptions.resource_type = 'video'; // Cloudinary dùng 'video' cho audio
    }

    const result = await cloudinary.uploader.upload(fileStr, uploadOptions);
    
    return {
      url: result.secure_url,
      fileId: result.public_id
    };
  } catch (error) {
    throw error;
  }
}

// Xóa file trên Cloudinary
async function deleteFromCloudinary(url) {
  try {
    if (!url || !url.includes('cloudinary.com')) {
      return { result: 'skipped' };
    }

    // Extract public_id từ URL
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) {
      throw new Error('Không tìm thấy public_id trong URL');
    }

    // Lấy phần sau '/upload/v..../folder/filename'
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.split('.')[0]; // Bỏ extension

    // Thử xóa với tất cả các resource_type có thể
    const resourceTypes = ['image', 'video', 'raw'];
    let deleteResult = null;
    
    for (const resourceType of resourceTypes) {
      try {
        const result = await cloudinary.uploader.destroy(publicId, { 
          resource_type: resourceType,
          invalidate: true // Xóa cache
        });
        
        if (result.result === 'ok') {
          deleteResult = result;
          break;
        } else if (result.result === 'not found') {
          continue;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (!deleteResult || deleteResult.result !== 'ok') {
      // Thử lần cuối với public_id gốc (có thể có version)
      try {
        const fullPublicId = pathAfterUpload; // Giữ nguyên extension
        for (const resourceType of resourceTypes) {
          const result = await cloudinary.uploader.destroy(fullPublicId, { 
            resource_type: resourceType,
            invalidate: true
          });
          if (result.result === 'ok') {
            deleteResult = result;
            break;
          }
        }
      } catch (error) {
        }
    }
    
    if (deleteResult && deleteResult.result === 'ok') {
      return deleteResult;
    } else {
      return { result: 'not_found_or_already_deleted' };
    }
    
  } catch (error) {
    // Không throw error để không làm gián đoạn việc xóa object chính
    return { result: 'error', error: error.message };
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
