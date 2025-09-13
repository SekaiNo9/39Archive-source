import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../components/Toast';

const SongEditPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    duration: '',
    description: '',
    composers: [],
    performers: [],
    language: '',
    release_date: '',
    mv_link: '',
    url_cover: null,
    url_song: null,
  });
  const [composerList, setComposerList] = useState([]);
  const [performerList, setPerformerList] = useState([]);
  const [unknownComposer, setUnknownComposer] = useState(false);
  const [unknownPerformer, setUnknownPerformer] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [songTitle, setSongTitle] = useState(''); // để hiển thị trong header

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
    if (user?.role !== 'admin') return;
    
    // Lấy danh sách composer + performer
    axios.get(`${process.env.REACT_APP_API_URL}/composer/all`)
      .then(res => setComposerList(res.data))
      .catch(() => setComposerList([]));
    
    axios.get(`${process.env.REACT_APP_API_URL}/performer/all`)
      .then(res => setPerformerList(res.data))
      .catch(() => setPerformerList([]));

    // Lấy dữ liệu bài hát hiện tại
    axios.get(`${process.env.REACT_APP_API_URL}/song/${id}`)
      .then(res => {
        const s = res.data?.data ? res.data.data : res.data;
        setSongTitle(s.title || '');
        setForm({
          title: s.title || '',
          duration: s.duration || '',
          description: s.description || '',
          composers: s.composers?.map(c => c._id) || [],
          performers: s.performers?.map(p => p._id) || [],
          language: s.language || '',
          release_date: s.release_date?.slice(0,10) || '',
          mv_link: s.mv_link || '',
          url_cover: null,
          url_song: null,
        });
        
        // Set unknown state
        setUnknownComposer(!s.composers || s.composers.length === 0);
        setUnknownPerformer(!s.performers || s.performers.length === 0);
      })
      .catch(err => setError('Không tải được dữ liệu bài hát'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleUnknownComposerChange = (e) => {
    const checked = e.target.checked;
    setUnknownComposer(checked);
    if (checked) {
      setForm(prev => ({ ...prev, composers: ['unknown'] }));
    } else {
      setForm(prev => ({ ...prev, composers: [] }));
    }
  };

  const handleUnknownPerformerChange = (e) => {
    const checked = e.target.checked;
    setUnknownPerformer(checked);
    if (checked) {
      setForm(prev => ({ ...prev, performers: ['unknown'] }));
    } else {
      setForm(prev => ({ ...prev, performers: [] }));
    }
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) setForm(prev => ({ ...prev, [name]: files[0] }));
    else setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setToast({ message: '', type: '' });

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if ((key === 'url_cover' || key === 'url_song') && value) {
        const ext = value.name.split('.').pop();
        const newFile = new File([value], `${form.title}-${key}.${ext}`, { type: value.type });
        data.append(key, newFile);
      } else if (Array.isArray(value)) {
        // Nếu là mảng chứa 'unknown', không gửi gì (để server nhận mảng rỗng)
        if (value.includes('unknown')) {
          // Không append gì cả
        } else {
          value.forEach(v => data.append(key, v));
        }
      } else {
        data.append(key, value);
      }
    });

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/song/${id}/update`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setToast({ message: 'Cập nhật thành công!', type: 'success' });
      setTimeout(() => navigate(`/song-detail/${id}`), 1500);
    } catch (err) {
      setError('Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
      setToast({ message: 'Cập nhật thất bại!', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài hát này?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/song/${id}/delete`);
      setToast({ message: 'Xóa thành công!', type: 'success' });
      setTimeout(() => navigate('/song-collection'), 2000);
    } catch (err) {
      setError('Xóa thất bại: ' + (err.response?.data?.message || err.message));
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
          <p className="text-miku-darkCyan text-lg">Đang tải thông tin bài hát...</p>
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

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-miku-deep mb-2 animate-glow">
            ✏️ Chỉnh sửa bài hát
          </h2>
          <div className="glass-effect p-3 rounded-xl inline-block">
            <p className="text-lg font-medium text-miku-darkCyan">
              🎵 <span className="text-miku-deep">{songTitle}</span>
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
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🎵 Tên bài hát
                </label>
                <input 
                  type="text" 
                  name="title" 
                  placeholder="Tên bài hát" 
                  value={form.title} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  ⏱️ Thời lượng (giây)
                </label>
                <input 
                  type="number" 
                  name="duration" 
                  placeholder="Thời lượng" 
                  value={form.duration} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500"
                  required 
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                📄 Mô tả bài hát
              </label>
              <textarea 
                name="description" 
                placeholder="Mô tả bài hát" 
                value={form.description} 
                onChange={handleChange} 
                rows={4}
                className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500 resize-none"
                required 
              />
            </div>

            {/* Language and Release Date */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🌐 Ngôn ngữ
                </label>
                <input 
                  type="text" 
                  name="language" 
                  placeholder="Ngôn ngữ" 
                  value={form.language} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  📅 Ngày phát hành
                </label>
                <input 
                  type="date" 
                  name="release_date" 
                  value={form.release_date} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all"
                  required 
                />
              </div>
            </div>

            {/* MV Link */}
            <div>
              <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                🎬 Liên kết MV
              </label>
              <input 
                type="url" 
                name="mv_link" 
                placeholder="Liên kết MV" 
                value={form.mv_link} 
                onChange={handleChange} 
                className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500"
                required 
              />
            </div>

            {/* Composers and Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-miku-darkCyan mb-2">
                  🎼 Nhà soạn nhạc (có thể chọn nhiều)
                </label>
                
                {/* Unknown checkbox */}
                <div className="mb-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={unknownComposer}
                      onChange={handleUnknownComposerChange}
                      className="rounded text-red-500 focus:ring-red-400"
                    />
                    <span className="text-sm font-medium text-red-600">Unknown</span>
                  </label>
                </div>
                
                <div className={`max-h-40 overflow-y-auto border-2 border-gray-800 rounded-lg p-3 bg-white ${unknownComposer ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-2">
                    {composerList.map(composer => (
                      <label key={composer._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={composer._id}
                          checked={!unknownComposer && form.composers.includes(composer._id)}
                          onChange={(e) => {
                            if (unknownComposer) return;
                            const composerId = e.target.value;
                            setForm(prev => ({
                              ...prev,
                              composers: e.target.checked
                                ? [...prev.composers.filter(id => id !== 'unknown'), composerId]
                                : prev.composers.filter(id => id !== composerId)
                            }));
                            setUnknownComposer(false);
                          }}
                          disabled={unknownComposer}
                          className="rounded text-aqua-500 focus:ring-aqua-400"
                        />
                        <span className="text-sm text-gray-700">{composer.nick_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-miku-darkCyan mt-1">
                  {unknownComposer ? 'Unknown' : `Đã chọn: ${form.composers.filter(id => id !== 'unknown').length} composer(s)`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-miku-darkCyan mb-2">
                  🎤 Performer (có thể chọn nhiều)
                </label>
                
                {/* Unknown checkbox */}
                <div className="mb-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={unknownPerformer}
                      onChange={handleUnknownPerformerChange}
                      className="rounded text-red-500 focus:ring-red-400"
                    />
                    <span className="text-sm font-medium text-red-600">Unknown</span>
                  </label>
                </div>
                
                <div className={`max-h-40 overflow-y-auto border-2 border-gray-800 rounded-lg p-3 bg-white ${unknownPerformer ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-2">
                    {performerList.map(performer => (
                      <label key={performer._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={performer._id}
                          checked={!unknownPerformer && form.performers.includes(performer._id)}
                          onChange={(e) => {
                            if (unknownPerformer) return;
                            const performerId = e.target.value;
                            setForm(prev => ({
                              ...prev,
                              performers: e.target.checked
                                ? [...prev.performers.filter(id => id !== 'unknown'), performerId]
                                : prev.performers.filter(id => id !== performerId)
                            }));
                            setUnknownPerformer(false);
                          }}
                          disabled={unknownPerformer}
                          className="rounded text-aqua-500 focus:ring-aqua-400"
                        />
                        <span className="text-sm text-gray-700">{performer.nick_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-miku-darkCyan mt-1">
                  {unknownPerformer ? 'Unknown' : `Đã chọn: ${form.performers.filter(id => id !== 'unknown').length} performer(s)`}
                </p>
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🖼️ Ảnh bìa mới (tùy chọn)
                </label>
                <input 
                  type="file" 
                  name="url_cover" 
                  accept="image/*" 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-aqua-50 file:text-miku-darkCyan hover:file:bg-aqua-100"
                />
                <p className="text-xs text-miku-darkCyan opacity-70 mt-1">JPG, PNG (khuyến nghị 500x500px)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🎧 File nhạc mới (tùy chọn)
                </label>
                <input 
                  type="file" 
                  name="url_song" 
                  accept="audio/*" 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-aqua-50 file:text-miku-darkCyan hover:file:bg-aqua-100"
                />
                <p className="text-xs text-miku-darkCyan opacity-70 mt-1">MP3, WAV</p>
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
                onClick={() => navigate(`/song-detail/${id}`)}
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

export default SongEditPage;
 