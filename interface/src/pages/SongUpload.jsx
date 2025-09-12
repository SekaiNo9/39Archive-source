import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

const SongUpload = () => {
  const [form, setForm] = useState({
    title: '',
    duration: '',
    description: '',
    composers: ['unknown'],     // Mặc định là unknown
    performers: ['unknown'],    // Mặc định là unknown
    language: '',
    release_date: '',
    mv_link: '',
    url_cover: null,
    url_song: null,
  });
  const [composerList, setComposerList] = useState([]);
  const [performerList, setPerformerList] = useState([]);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [coverPreview, setCoverPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/composer/all`)
      .then(res => setComposerList(res.data))
      .catch(() => setComposerList([]));

    axios.get(`${process.env.REACT_APP_API_URL}/performer/all`)
      .then(res => setPerformerList(res.data))
      .catch(() => setPerformerList([]));
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setForm(prev => ({ ...prev, [name]: file }));
      
      // Xem trước ảnh cover
      if (name === 'url_cover' && file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCoverPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
      
      // Lưu thông tin file audio
      if (name === 'url_song' && file && file.type.startsWith('audio/')) {
        setSelectedAudio({
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
        });
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle multi-select for composers
  const handleComposerChange = (e) => {
    const { value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      composers: checked 
        ? [...prev.composers.filter(id => id !== 'unknown'), value] // Remove unknown if selecting others
        : prev.composers.filter(id => id !== value)
    }));
  };

  // Handle multi-select for performers
  const handlePerformerChange = (e) => {
    const { value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      performers: checked 
        ? [...prev.performers.filter(id => id !== 'unknown'), value] // Remove unknown if selecting others
        : prev.performers.filter(id => id !== value)
    }));
  };

  // Reset to unknown if no composer selected
  const resetToUnknownComposer = () => {
    if (form.composers.length === 0) {
      setForm(prev => ({ ...prev, composers: ['unknown'] }));
    }
  };

  // Reset to unknown if no performer selected
  const resetToUnknownPerformer = () => {
    if (form.performers.length === 0) {
      setForm(prev => ({ ...prev, performers: ['unknown'] }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setToast('');
    setIsLoading(true);

    if (!form.title || !form.duration || !form.description ||
        form.composers.length === 0 || form.performers.length === 0 ||
        !form.language || !form.release_date || !form.mv_link ||
        !form.url_cover || !form.url_song) {
      setError('Vui lòng điền đầy đủ thông tin và chọn file!');
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'url_cover' && value) {
        const ext = value.name.split('.').pop();
        const newFile = new File([value], `${form.title}-cover.${ext}`, { type: value.type });
        data.append(key, newFile);
      } else if (key === 'url_song' && value) {
        const ext = value.name.split('.').pop();
        const newFile = new File([value], `${form.title}-audio.${ext}`, { type: value.type });
        data.append(key, newFile);
      } else if (Array.isArray(value)) {
        value.forEach(v => data.append(key, v)); // append từng phần tử _id
      } else {
        data.append(key, value);
      }
    });

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/song/add`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setToast('Upload thành công!');
      
      // Reset form
      setForm({
        title: '',
        duration: '',
        description: '',
        composers: ['unknown'],
        performers: ['unknown'],
        language: '',
        release_date: '',
        mv_link: '',
        url_cover: null,
        url_song: null,
      });
      setCoverPreview(null);
      setSelectedAudio(null);
      
      setTimeout(() => navigate('/song-collection'), 1500);
    } catch (err) {
      setError('Upload thất bại! ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 md:top-20 right-4 md:right-10 w-24 md:w-48 h-24 md:h-48 bg-miku-mint opacity-10 rounded-full animate-float"></div>
        <div className="absolute bottom-10 md:bottom-20 left-4 md:left-10 w-18 md:w-36 h-18 md:h-36 bg-aqua-300 opacity-20 rounded-full animate-pulse-soft"></div>
      </div>

      <div className="w-full max-w-3xl relative z-10">
        <Toast message={toast} type="success" />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-miku-deep mb-2 animate-glow">
            🎵 Upload Bài Hát Mới
          </h2>
          <p className="text-miku-darkCyan">Chia sẻ âm nhạc với cộng đồng</p>
        </div>

        {/* Form */}
        <div style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 88%, rgba(57,208,216,0.1) 12%)'}} className="p-4 md:p-8 rounded-2xl shadow-miku border border-aqua-200">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="240" 
                  value={form.duration} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🌍 Ngôn ngữ
                </label>
                <input 
                  type="text" 
                  name="language" 
                  placeholder="Tiếng Nhật, Tiếng Việt..." 
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

            <div>
              <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                📝 Mô tả
              </label>
              <textarea 
                name="description" 
                placeholder="Mô tả về bài hát..." 
                value={form.description} 
                onChange={handleChange} 
                rows="4"
                className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500 resize-none"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                🔗 Liên kết MV
              </label>
              <input 
                type="url" 
                name="mv_link" 
                placeholder="https://youtube.com/..." 
                value={form.mv_link} 
                onChange={handleChange} 
                className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-gray-500"
                required 
              />
            </div>

            {/* Multi-Select Composer & Performer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-miku-darkCyan mb-2">
                  🎼 Composer (có thể chọn nhiều)
                </label>
                <div className="max-h-40 overflow-y-auto border-2 border-gray-800 rounded-lg p-3 bg-white">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value="unknown"
                        checked={form.composers.includes('unknown')}
                        onChange={handleComposerChange}
                        className="rounded text-aqua-500 focus:ring-aqua-400"
                      />
                      <span className="text-sm font-medium text-gray-700">Unknown (mặc định)</span>
                    </label>
                    {composerList.map(composer => (
                      <label key={composer._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={composer._id}
                          checked={form.composers.includes(composer._id)}
                          onChange={handleComposerChange}
                          onBlur={resetToUnknownComposer}
                          className="rounded text-aqua-500 focus:ring-aqua-400"
                        />
                        <span className="text-sm text-gray-700">{composer.nick_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-miku-darkCyan mt-1">
                  Đã chọn: {form.composers.length} composer(s)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-miku-darkCyan mb-2">
                  🎤 Performer (có thể chọn nhiều)
                </label>
                <div className="max-h-40 overflow-y-auto border-2 border-gray-800 rounded-lg p-3 bg-white">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value="unknown"
                        checked={form.performers.includes('unknown')}
                        onChange={handlePerformerChange}
                        className="rounded text-aqua-500 focus:ring-aqua-400"
                      />
                      <span className="text-sm font-medium text-gray-700">Unknown (mặc định)</span>
                    </label>
                    {performerList.map(performer => (
                      <label key={performer._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={performer._id}
                          checked={form.performers.includes(performer._id)}
                          onChange={handlePerformerChange}
                          onBlur={resetToUnknownPerformer}
                          className="rounded text-aqua-500 focus:ring-aqua-400"
                        />
                        <span className="text-sm text-gray-700">{performer.nick_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-miku-darkCyan mt-1">
                  Đã chọn: {form.performers.length} performer(s)
                </p>
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload ảnh bìa */}
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🖼️ Ảnh bìa
                </label>
                <input 
                  type="file" 
                  name="url_cover" 
                  accept="image/*" 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-aqua-50 file:text-miku-darkCyan hover:file:bg-aqua-100"
                  required 
                />
                <p className="text-xs text-miku-darkCyan opacity-70 mt-1">JPG, PNG (khuyến nghị 500x500px)</p>
              </div>

              {/* Upload file nhạc */}
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🎧 File nhạc
                </label>
                <input 
                  type="file" 
                  name="url_song" 
                  accept="audio/*" 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-aqua-50 file:text-miku-darkCyan hover:file:bg-aqua-100"
                  required 
                />
                <p className="text-xs text-miku-darkCyan opacity-70 mt-1">MP3, WAV (tối đa 10MB)</p>
              </div>
            </div>

            {/* Preview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview ảnh bìa */}
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  👁️ Xem trước ảnh bìa
                </label>
                <div className="border-2 border-dashed border-aqua-300 rounded-lg p-4 bg-aqua-50 h-40 flex items-center justify-center">
                  {coverPreview ? (
                    <img 
                      src={coverPreview} 
                      alt="Preview" 
                      className="h-full w-auto object-contain rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="text-center text-miku-darkCyan opacity-50">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-sm">Chưa chọn ảnh bìa</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview file nhạc */}
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🎵 Thông tin file nhạc
                </label>
                <div className="border-2 border-dashed border-aqua-300 rounded-lg p-4 bg-aqua-50 h-40 flex items-center justify-center">
                  {selectedAudio ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎵</div>
                      <p className="text-sm font-medium text-miku-darkCyan">{selectedAudio.name}</p>
                      <p className="text-xs text-miku-darkCyan opacity-70">Kích thước: {selectedAudio.size}</p>
                    </div>
                  ) : (
                    <div className="text-center text-miku-darkCyan opacity-50">
                      <div className="text-4xl mb-2">🎧</div>
                      <p className="text-sm">Chưa chọn file nhạc</p>
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
                    <span>Đang upload bài hát...</span>
                  </div>
                ) : (
                  <>🚀 Upload Bài Hát</>
                )}
              </button>
              
              {/* Nút hủy */}
              <button 
                type="button"
                onClick={() => navigate('/song-collection')}
                className="w-full mt-3 px-8 py-3 rounded-lg border-2 border-aqua-300 text-miku-darkCyan font-medium hover:bg-aqua-50 transition-all duration-300"
              >
                ← Quay lại bộ sưu tập
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SongUpload;
