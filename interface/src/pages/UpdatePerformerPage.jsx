import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../components/Toast';

const UpdatePerformerPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nick_name: '',
    voice_actor: '',
    gender: '',
    age: '',
    birthday: '',
    symbol: '',
    debut_day: '',
    description: '',
    detail_info: '',
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
 
  useEffect(() => {
    const fetchPerformer = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/performer/${id}`);
        const data = res.data;
        setNickName(data.nick_name || '');
        setForm({
          voice_actor: data.voice_actor || '',
          gender: data.gender || '',
          age: data.age || '',
          birthday: data.birthday ? data.birthday.slice(0,10) : '',
          symbol: data.symbol || '',
          debut_day: data.debut_day ? data.debut_day.slice(0,10) : '',
          description: data.description || '',

          detail_info: data.detail_info || '',
          url_avt: null,
        });
        if (data.url_avt) {
          setPreview(`${process.env.REACT_APP_API_URL}${data.url_avt}`);
        }
      } catch (err) {
        setError('Không tải được dữ liệu performer.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') {
      fetchPerformer();
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
      } else if (key === 'age') {
        data.append(key, Number(value));
      } else if (value) {
        data.append(key, value);
      }
    });

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/performer/${id}/update`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setToast({ message: 'Cập nhật performer thành công!', type: 'success' });
      setTimeout(() => navigate('/v-singer'), 2000);
    } catch (err) {
      setError('Cập nhật thất bại! ' + (err.response?.data?.message || err.message));
      setToast({ message: 'Cập nhật thất bại!', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa performer này?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/performer/${id}/delete`);
      setToast({ message: 'Xóa performer thành công!', type: 'success' });
      setTimeout(() => navigate('/v-singer'), 2000);
    } catch (err) {
      setError('Xóa thất bại! ' + (err.response?.data?.message || err.message));
      setToast({ message: 'Xóa thất bại!', type: 'error' });
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // Component đã xử lý redirect trong useEffect
  }a

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
            ✏️ Cập nhật V-Singer
          </h2>
          <div className="glass-effect p-3 rounded-xl inline-block">
            <p className="text-lg font-medium text-miku-darkCyan">
              🎤 <span className="text-miku-deep">{nickName}</span>
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
                  <label className="block text-miku-deep font-medium mb-2">👤 Lồng tiếng</label>
                  <input
                    type="text"
                    name="voice_actor"
                    value={form.voice_actor}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all"
                    placeholder="Nhập tên lồng tiếng..."
                  />
                </div>

                <div>
                  <label className="block text-miku-deep font-medium mb-2">⚧️ Giới tính</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="female">Nữ</option>
                    <option value="male">Nam</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-miku-deep font-medium mb-2">🎂 Tuổi</label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all"
                    placeholder="Nhập tuổi..."
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-miku-deep font-medium mb-2">🎁 Sinh nhật</label>
                  <input
                    type="text"
                    name="birthday"
                    value={form.birthday}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-miku-deep font-medium mb-2">🔮 Biểu tượng</label>
                  <input
                    type="text"
                    name="symbol"
                    value={form.symbol}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all"
                    placeholder="Nhập biểu tượng..."
                  />
                </div>

                <div>
                  <label className="block text-miku-deep font-medium mb-2">🌟 Ngày debut</label>
                  <input
                    type="date"
                    name="debut_day"
                    value={form.debut_day}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-miku-deep font-medium mb-2">📄 Mô tả</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all resize-none"
                    placeholder="Nhập mô tả về V-Singer..."
                  />
                </div>

                <div>
                  <label className="block text-miku-deep font-medium mb-2">📋 Thông tin chi tiết</label>
                  <textarea
                    name="detail_info"
                    value={form.detail_info}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all resize-none"
                    placeholder="Nhập thông tin chi tiết..."
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
                onClick={() => navigate('/v-singer')}
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

export default UpdatePerformerPage;
