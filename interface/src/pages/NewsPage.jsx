import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NewsPage = ({ user }) => {
  const [newsList, setNewsList] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fetchNews = () => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    
    axios.get(`${process.env.REACT_APP_API_URL}/news`, { params })
      .then(res => setNewsList(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchNews();
  }, []);
 
  const handleFilter = e => {
    e.preventDefault();
    fetchNews();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteNews = async (newsId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/news/${newsId}`);
      setNewsList(prev => prev.filter(news => news._id !== newsId));
      setShowDeleteConfirm(null);
      // You can add a toast notification here
    } catch (error) {
      console.error('Lỗi xóa tin tức:', error);
      alert('Có lỗi xảy ra khi xóa tin tức!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-800 animate-glow">
          📰 Tin tức
        </h2>
        <div className="w-24 h-1 bg-gradient-aqua mx-auto rounded-full"></div>
      </div>

      {/* Filter Form */}
      <div className="glass-effect p-6 rounded-2xl shadow-miku mb-8">
        <form 
          onSubmit={handleFilter} 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-miku-darkCyan mb-1">Từ ngày</label>
              <input 
                type="date" 
                value={from} 
                onChange={e => setFrom(e.target.value)} 
                className="border border-aqua-200 rounded-lg px-4 py-2 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-miku-darkCyan mb-1">Đến ngày</label>
              <input 
                type="date" 
                value={to} 
                onChange={e => setTo(e.target.value)} 
                className="border border-aqua-200 rounded-lg px-4 py-2 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all"
              />
            </div>
            <button 
              type="submit" 
              className="bg-gradient-aqua text-white px-6 py-2 rounded-lg hover:shadow-aqua-lg transition-all duration-300 font-medium hover-lift mt-6 sm:mt-0"
            >
              🔍 Lọc
            </button>
          </div>
        </form>
      </div>
 
      {/* News List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {newsList.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="text-8xl mb-6">📰</div>
            <h3 className="text-2xl font-bold text-miku-deep mb-2">Chưa có tin tức nào</h3>
            <p className="text-miku-darkCyan">Hãy quay lại sau để xem những tin tức mới nhất!</p>
          </div>
        ) : (
          newsList.map(news => (
            <div key={news._id} className="group">
              {/* News Card với nền trắng, chữ đen */}
              <div className="bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden hover:shadow-aqua-xl transition-all duration-500 hover-lift border border-gray-200">
                
                {/* News Image */}
                {news.image && (
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        console.error(`Failed to load image: ${e.target.src}`);
                        e.target.onerror = null; // Ngăn vòng lặp vô tận
                        e.target.src = '/news-placeholder.jpg'; // Ảnh placeholder
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    
                    {/* Delete Button for Admin */}
                    {user?.role === 'admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn click xuyên qua đến card
                          setShowDeleteConfirm(news._id);
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors duration-200 shadow-lg"
                        title="Xóa tin tức"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}

                <div className="p-6 relative">
                  {/* Delete Button for Admin (if no image) */}
                  {!news.image && user?.role === 'admin' && (
                    <button
                      onClick={() => setShowDeleteConfirm(news._id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors duration-200 shadow-lg"
                      title="Xóa tin tức"
                    >
                      ×
                    </button>
                  )}
                  
                  {/* News Title - Màu aqua giữ nguyên */}
                  <h3 className="text-2xl font-bold text-aqua-500 mb-3 group-hover:text-aqua-600 transition-colors duration-300">
                    {news.title}
                  </h3>

                  {/* News Content - Màu đen trên nền trắng */}
                  <div className="text-gray-800 mb-4 leading-relaxed">
                    <p className="line-clamp-4">{news.body}</p>
                  </div>

                  {/* News Footer */}
                  <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-lg">👤</span>
                      <span className={`font-medium ${
                        news.artist === 'admin' || news.artist === 'Admin' 
                          ? 'text-red-500' 
                          : 'text-green-600'
                      }`}>
                        {news.artist || 'Admin'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="text-lg">🕒</span>
                      <span>{formatDate(news.uploadDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-red-600 mb-4">Xác nhận xóa tin tức</h3>
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa tin tức này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteNews(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
