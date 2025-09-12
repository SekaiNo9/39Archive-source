import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../components/Toast';

const UpdateComposerPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    country: '',
    description: '',
    social_link: '',
    url_avt: null,
  });
  const [nickName, setNickName] = useState(''); // chỉ để hiển thị
  const [toast, setToast] = useState({ message: '', type: '' });
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
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
 
  // Sửa phần fetch composer để xử lý url_avt đúng cách
  useEffect(() => {
    const fetchComposer = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/composer/${id}`);
        const data = res.data;
        setNickName(data.nick_name || '');
        setForm({
          nick_name: data.nick_name || '', // Thêm nick_name nếu cần
          country: data.country || '',

          description: data.description || '',
          social_link: data.social_link || '',
          url_avt: null,
        });
        
        // Xử lý ảnh đại diện đúng cách
        if (data.url_avt) {
          // Kiểm tra xem url_avt có phải là URL đầy đủ không
          if (data.url_avt.startsWith('http')) {
            setPreview(data.url_avt);
          } else {
            // Nếu là đường dẫn tương đối, thêm base URL
            setPreview(`${process.env.REACT_APP_API_URL}${data.url_avt}`);
          }
        }
      } catch (err) {
        console.error('Error fetching composer:', err);
        setError('Không tải được dữ liệu composer.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.role === 'admin') {
      fetchComposer();
    }
  }, [id, user]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      setForm(prev => ({ ...prev, [name]: files[0] }));
      // Tạo preview cho ảnh mới
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(files[0]);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setToast({ message: '', type: '' });

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'url_avt' && value) {
        data.append(key, value);
      } else if (value) {
        data.append(key, value);
      }
    });

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/composer/${id}/update`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setToast({ message: 'Cập nhật composer thành công!', type: 'success' });
      setTimeout(() => navigate('/composer'), 2000);
    } catch (err) {
      setError('Cập nhật thất bại! ' + (err.response?.data?.message || err.message));
      setToast({ message: 'Cập nhật thất bại!', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa composer này?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/composer/${id}/delete`);
      setToast({ message: 'Xóa composer thành công!', type: 'success' });
      setTimeout(() => navigate('/composer'), 2000);
    } catch (err) {
      setError('Xóa thất bại! ' + (err.response?.data?.message || err.message));
      setToast({ message: 'Xóa thất bại!', type: 'error' });
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // Component đã xử lý redirect trong useEffect
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-aqua-200 border-t-aqua-500 rounded-full mx-auto mb-4"></div>
          <p className="text-miku-darkCyan text-lg">Đang tải thông tin...</p>
        </div>
      </div>
    );
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
            ✏️ Cập nhật Composer
          </h2>
          <div className="glass-effect p-3 rounded-xl inline-block">
            <p className="text-lg font-medium text-miku-darkCyan">
              🎼 <span className="text-miku-deep">{nickName}</span>
            </p>
          </div>
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
                {/* Avatar Upload & Preview */}
                <div className="text-center">
                  <label className="block text-miku-deep font-semibold mb-3">📸 Ảnh đại diện</label>
                  
                  {/* Preview */}
                  {preview && (
                    <div className="mb-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-aqua-200 shadow-aqua-lg"
                      />
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-effect text-miku-darkCyan px-6 py-3 rounded-lg hover:bg-white/30 transition-all duration-300 font-medium hover-lift border border-aqua-200"
                  >
                    📷 {preview ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="url_avt"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                </div>

                {/* Basic Info */}
                <div>
                  <label className="block text-miku-deep font-medium mb-2">🌍 Quốc gia</label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all"
                    placeholder="Nhập quốc gia..."
                  />
                </div>

                <div>
                  <label className="block text-miku-deep font-medium mb-2">🔗 Liên kết mạng xã hội</label>
                  <input
                    type="url"
                    name="social_link"
                    value={form.social_link}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-miku-deep font-medium mb-2">📄 Mô tả</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={12}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all resize-none"
                    placeholder="Nhập mô tả về composer..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-6 border-t border-aqua-200">
              <button
                type="submit"
                className="bg-gradient-aqua text-white px-8 py-3 rounded-lg hover:shadow-aqua-lg transition-all duration-300 font-medium hover-lift"
              >
                💾 Cập nhật
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg hover:shadow-red-lg transition-all duration-300 font-medium hover-lift"
              >
                🗑️ Xóa
              </button>
              <button
                type="button"
                onClick={() => navigate('/composer')}
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

export default UpdateComposerPage;
