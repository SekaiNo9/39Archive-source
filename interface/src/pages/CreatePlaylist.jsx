import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const CreatePlaylist = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_public: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const base = process.env.REACT_APP_API_URL;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tên playlist');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${base}/playlist/create`,
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        navigate('/my-archive');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo playlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/my-archive')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            ✨ Tạo Playlist Mới
          </h1>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  🎵 Tên Playlist *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tên playlist..."
                  maxLength={100}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-gray-800 placeholder-gray-400"
                  required
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.title.length}/100
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Mô Tả
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả về playlist của bạn..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all resize-none text-gray-800 placeholder-gray-400"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.description.length}/500
                </div>
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                    🌍 Công khai playlist
                  </h3>
                  <p className="text-xs text-gray-600">
                    Cho phép người khác xem và tìm kiếm playlist này
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-400 peer-checked:to-blue-500 shadow-sm"></div>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-400 mr-2">⚠️</span>
                    {error}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/my-archive')}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300"
                >
                  ❌ Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.title.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" />
                      <span>✨ Tạo Playlist</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Info */}
            <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
              <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center">
                💡 Gợi ý:
              </h4>
              <ul className="text-xs text-amber-600 space-y-1">
                <li>• Playlist riêng tư chỉ bạn mới có thể xem và chỉnh sửa</li>
                <li>• Playlist công khai có thể được người khác tìm thấy và thích</li>
                <li>• Bạn có thể thay đổi trạng thái công khai/riêng tư bất kỳ lúc nào</li>
                <li>• Thêm bài hát vào playlist từ trang chi tiết bài hát</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylist;