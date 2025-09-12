import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../components/Toast';

const SongEditPage = () => {
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
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    // Lấy danh sách composer + performer
    axios.get(`${process.env.REACT_APP_API_URL}/composer/all`).then(res => setComposerList(res.data));
    axios.get(`${process.env.REACT_APP_API_URL}/performer/all`).then(res => setPerformerList(res.data));

    // Lấy dữ liệu bài hát hiện tại
    axios.get(`${process.env.REACT_APP_API_URL}/song/${id}`)
      .then(res => {
        const s = res.data;
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
      })
      .catch(err => setError('Không tải được dữ liệu bài hát'));
  }, [id]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) setForm(prev => ({ ...prev, [name]: files[0] }));
    else setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setToast('');

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if ((key === 'url_cover' || key === 'url_song') && value) {
        const ext = value.name.split('.').pop();
        const newFile = new File([value], `${form.title}-${key}.${ext}`, { type: value.type });
        data.append(key, newFile);
      } else if (Array.isArray(value)) {
        value.forEach(v => data.append(key, v));
      } else {
        data.append(key, value);
      }
    });

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/song/${id}/update`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setToast('Cập nhật thành công!');
      setTimeout(() => navigate(`/song-detail/${id}`), 1500);
    } catch (err) {
      setError('Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài hát này?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/song/${id}/delete`);
      setToast('Xóa thành công!');
      setTimeout(() => navigate('/song-collection'), 1000);
    } catch (err) {
      setError('Xóa thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow relative">
      <Toast message={toast} type="success" />
      <h2 className="text-2xl font-bold mb-4 text-miku-dark">Sửa Bài Hát</h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" name="title" placeholder="Tên bài hát" value={form.title} onChange={handleChange} className="border rounded px-3 py-2" required />
        <input type="number" name="duration" placeholder="Thời lượng (giây)" value={form.duration} onChange={handleChange} className="border rounded px-3 py-2" required />
        <textarea name="description" placeholder="Mô tả bài hát" value={form.description} onChange={handleChange} className="border rounded px-3 py-2" required />

        <label>Nhà soạn nhạc:</label>
        <div className="border rounded px-3 py-2 max-h-32 overflow-y-auto bg-white">
          {composerList.map(c => (
            <label key={c._id} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-100 px-2 rounded">
              <input
                type="checkbox"
                value={c._id}
                checked={form.composers.includes(c._id)}
                onChange={(e) => {
                  const composerId = e.target.value;
                  setForm(prev => ({
                    ...prev,
                    composers: e.target.checked
                      ? [...prev.composers, composerId]
                      : prev.composers.filter(id => id !== composerId)
                  }));
                }}
                className="text-blue-500 focus:ring-blue-400"
              />
              <span className="text-sm">{c.nick_name}</span>
            </label>
          ))}
        </div>
 
        <label>Nhà trình diễn:</label>
        <div className="border rounded px-3 py-2 max-h-32 overflow-y-auto bg-white">
          {performerList.map(p => (
            <label key={p._id} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-100 px-2 rounded">
              <input
                type="checkbox"
                value={p._id}
                checked={form.performers.includes(p._id)}
                onChange={(e) => {
                  const performerId = e.target.value;
                  setForm(prev => ({
                    ...prev,
                    performers: e.target.checked
                      ? [...prev.performers, performerId]
                      : prev.performers.filter(id => id !== performerId)
                  }));
                }}
                className="text-blue-500 focus:ring-blue-400"
              />
              <span className="text-sm">{p.nick_name}</span>
            </label>
          ))}
        </div>

        <input type="text" name="language" placeholder="Ngôn ngữ" value={form.language} onChange={handleChange} className="border rounded px-3 py-2" required />
        <input type="date" name="release_date" value={form.release_date} onChange={handleChange} className="border rounded px-3 py-2" required />
        <input type="url" name="mv_link" placeholder="Liên kết MV" value={form.mv_link} onChange={handleChange} className="border rounded px-3 py-2" required />

        <div className="flex gap-4 mt-4">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Cập nhật</button>
          <button type="button" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-400" onClick={handleDelete}>Xóa</button>
        </div>
      </form>
    </div>
  );
};

export default SongEditPage;
 