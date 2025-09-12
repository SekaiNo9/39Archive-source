import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

const UploadNewsPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    body: '',
    image: null
  });
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Kiểm tra quyền admin
  useEffect(() => {
    if (!user) {
      setToast({ message: 'Vui lòng đăng nhập để tiếp tục!', type: 'error' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    if (user.role !== 'admin') {
      setToast({ message: 'Bạn không có quyền truy cập trang này!', type: 'error' });
      setTimeout(() => navigate('/'), 3000);
      return;
    }
  }, [user, navigate]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setForm(prev => ({ ...prev, image: file }));
      // Tạo preview cho ảnh mới  
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Hàm xử lý khi chọn file ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng và kích thước
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Vui lòng chọn file ảnh định dạng JPG, PNG, GIF hoặc WebP');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Kích thước ảnh tối đa là 5MB');
        return;
      }
      
      setForm({...form, image: file});
      
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sửa hàm handleSubmit
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setToast({ message: '', type: '' });

    // Validate
    if (!form.title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      setIsLoading(false);
      return;
    }
    
    if (!form.body.trim()) {
      setError('Vui lòng nhập nội dung');
      setIsLoading(false);
      return;
    }
    
    // Prepare FormData
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('body', form.body);
    formData.append('artist', user?.username || 'Admin');
    
    if (form.image) {
      formData.append('image', form.image);
    }
    
    try {
      console.log('📤 Uploading news...');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/news/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );
      
      console.log('✅ News uploaded successfully:', response.data);
      setToast({ message: 'Đăng tin thành công!', type: 'success' });
      
      // Reset form
      setForm({ title: '', body: '', image: null });
      setPreview('');
      
      // Redirect sau 2 giây
      setTimeout(() => navigate('/news'), 2000);
    } catch (err) {
      console.error('❌ Upload failed:', err);
      
      if (err.response?.status === 403) {
        setError('Bạn không có quyền đăng tin tức');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(`Lỗi: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Không render gì nếu user không phải admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-32 w-48 h-48 bg-gradient-to-r from-aqua-200 to-blue-200 opacity-20 rounded-full animate-float"></div>
        <div className="absolute bottom-32 left-16 w-36 h-36 bg-gradient-to-r from-miku-mint to-aqua-300 opacity-15 rounded-full animate-pulse-soft"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-miku-deep mb-2 animate-glow">
            📰 Tạo tin tức mới
          </h2>
          <p className="text-lg text-miku-darkCyan">Chia sẻ tin tức thú vị với cộng đồng Vocaloid</p>
        </div>

        {/* Form */}
        <div style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 88%, rgba(57,208,216,0.1) 12%)'}} className="p-8 rounded-2xl shadow-miku border border-aqua-200">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-miku-deep font-medium mb-2">📝 Tiêu đề</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all"
                    placeholder="Nhập tiêu đề tin tức..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-miku-deep font-medium mb-2">📄 Nội dung</label>
                  <textarea
                    name="body"
                    value={form.body}
                    onChange={handleChange}
                    rows={8}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all resize-none"
                    placeholder="Nhập nội dung tin tức..."
                    required
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="text-center">
                  <label className="block text-miku-deep font-medium mb-3">🖼️ Ảnh minh họa</label>
                  
                  {/* Image Preview */}
                  <div className="mb-4">
                    {preview ? (
                      <div className="relative group">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-48 rounded-xl object-cover border-4 border-aqua-200 shadow-aqua-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-white bg-aqua-500 px-4 py-2 rounded-lg hover:bg-aqua-600 transition-colors"
                          >
                            📷 Thay đổi
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-aqua-400 hover:bg-aqua-50 transition-all"
                      >
                        <div className="text-6xl text-gray-400 mb-2">🖼️</div>
                        <p className="text-gray-600 font-medium">Click để chọn ảnh</p>
                        <p className="text-sm text-gray-500">(Không bắt buộc)</p>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-effect text-miku-darkCyan px-6 py-3 rounded-lg hover:bg-white/30 transition-all duration-300 font-medium hover-lift border border-aqua-200"
                  >
                    📷 {preview ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-aqua-50 to-blue-50 p-6 rounded-xl border border-aqua-200">
                  <h4 className="font-semibold text-miku-deep mb-3 flex items-center gap-2">
                    <span>ℹ️</span>
                    Thông tin tác giả
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Tác giả:</span> {user?.username}</p>
                    <p><span className="font-medium">Email:</span> {user?.email}</p>
                    <p><span className="font-medium">Vai trò:</span> <span className="bg-gradient-aqua text-white px-2 py-1 rounded text-xs">Admin</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-6 border-t border-aqua-200">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 hover-lift
                  ${isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-aqua hover:shadow-aqua-lg'
                  } text-white`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang đăng tin...</span>
                  </div>
                ) : (
                  <>📤 Đăng tin tức</>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/news')}
                className="glass-effect text-miku-darkCyan px-8 py-3 rounded-lg hover:bg-white/30 transition-all duration-300 font-medium hover-lift border border-aqua-200"
              >
                🔙 Quay lại
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default UploadNewsPage;