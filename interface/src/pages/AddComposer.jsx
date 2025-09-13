import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

const AddComposerPage = () => {
  const [form, setForm] = useState({ 
    nick_name: '',
    country: '',
    description: 'Đang được cập nhập...',
    social_link: '',
    url_avt: null,
  }); 
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setForm(prev => ({ ...prev, [name]: file }));
      
      // Tạo preview cho ảnh
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setToast('');
    setIsLoading(true);

    // check thiếu input
    for (const key in form) {
      if (!form[key]) {
        setError('Vui lòng điền đầy đủ thông tin!');
        setIsLoading(false);
        return;
      }
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'url_avt' && value) {
        const ext = value.name.split('.').pop();
        const newFile = new File([value], `${form.nick_name}.${ext}`, { type: value.type });
        data.append(key, newFile);
      } else {
        data.append(key, value);
      }
    });

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/composer/add`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setToast('Thêm composer thành công!');
      setForm({
        nick_name: '',
        country: '',
        description: '',
        social_link: '',
        url_avt: null,
      });
      setImagePreview(null);
      setTimeout(() => {
        navigate('/composer');
      }, 1500);
    } catch (err) {
      setError('Thêm thất bại! ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-20 w-40 h-40 bg-miku-mint opacity-10 rounded-full animate-float"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-aqua-300 opacity-20 rounded-full animate-pulse-soft"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <Toast message={toast} type="success" />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-miku-deep mb-2 animate-glow">
            🎼 Thêm Composer Mới
          </h2>
          <p className="text-miku-darkCyan">Thêm nhạc sĩ mới vào cơ sở dữ liệu</p>
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

            {/* Hàng 1: Tên và Quốc gia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  👤 Tên nghệ danh
                </label>
                <input 
                  type="text" 
                  name="nick_name" 
                  placeholder="Tên composer" 
                  value={form.nick_name} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🌍 Quốc gia
                </label>
                <input 
                  type="text" 
                  name="country" 
                  placeholder="Quốc gia" 
                  value={form.country} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500"
                  required 
                />
              </div>
            </div>

            {/* Social Link */}
            <div>
              <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                🔗 Liên kết mạng xã hội
              </label>
              <input 
                type="url" 
                name="social_link" 
                placeholder="https://..." 
                value={form.social_link} 
                onChange={handleChange} 
                className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500"
                required 
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                📝 Mô tả
              </label>
              <textarea 
                name="description" 
                placeholder="Thông tin về nhạc sĩ..." 
                value={form.description} 
                onChange={handleChange} 
                rows="4"
                className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500 resize-none"
                required 
              />
            </div>

            {/* Upload ảnh và Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload ảnh */}
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  📸 Ảnh đại diện
                </label>
                <div className="relative">
                  <input 
                    type="file" 
                    name="url_avt" 
                    accept="image/*" 
                    onChange={handleChange} 
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-aqua-50 file:text-miku-darkCyan hover:file:bg-aqua-100"
                    required 
                  />
                  <p className="text-xs text-miku-darkCyan opacity-70 mt-1">Chỉ chấp nhận file JPG, PNG (tối đa 5MB)</p>
                </div>
              </div>

              {/* Preview ảnh */}
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  👁️ Xem trước ảnh
                </label>
                <div className="border-2 border-dashed border-aqua-300 rounded-lg p-4 bg-aqua-50 h-32 flex items-center justify-center">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-full w-auto object-contain rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="text-center text-miku-darkCyan opacity-50">
                      <div className="text-3xl mb-2">🖼️</div>
                      <p className="text-sm">Chưa chọn ảnh</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nút submit với loading */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 
                  ${isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-aqua hover:shadow-aqua-lg hover-lift'
                  } text-white`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang thêm composer...</span>
                  </div>
                ) : (
                  <>🎼 Thêm Composer</>
                )}
              </button>
              
              {/* Nút hủy */}
              <button 
                type="button"
                onClick={() => navigate('/composer')}
                className="w-full mt-3 px-8 py-3 rounded-lg border-2 border-aqua-300 text-miku-darkCyan font-medium hover:bg-aqua-50 transition-all duration-300"
              >
                ← Quay lại danh sách
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddComposerPage;