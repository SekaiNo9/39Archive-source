import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ComposerList = ({ user }) => {
  const [composers, setComposers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComposers = async () => {
      try { 
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/composer/all`);
        setComposers(response.data);
      } catch (error) {
        console.error('Error fetching composers:', error);
      }
    };

    fetchComposers();
  }, []);

  return (
    <main className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 animate-glow">
          🎼 Danh sách Composer
        </h2>
        <p className="text-lg text-miku-darkCyan opacity-80 mb-2">
          Khám phá {composers.length} nhạc sĩ tài năng
        </p>
        <div className="w-24 h-1 bg-gradient-aqua mx-auto rounded-full"></div>
      </div>

      {/* Composers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {composers.map((composer) => (
          <div
            key={composer._id}
            className="bg-white border border-aqua-200 rounded-2xl shadow-miku p-6 hover-lift transition-all duration-300 relative"
          >
            <div className="flex gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden border-2 border-aqua-200 shadow-aqua bg-gray-100 flex items-center justify-center">
                {composer.url_avt ? (
                  <img
                    src={composer.url_avt}
                    onError={(e) => {
                      e.target.src = `${process.env.REACT_APP_API_URL}${composer.url_avt}`;
                    }}
                    alt={composer.nick_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl text-gray-400">🎼</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-slate-800 mb-3 truncate">
                  {composer.nick_name}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-miku-darkCyan font-semibold min-w-[80px]">🌍 Nation:</span>
                    <span className="text-miku-deep">{composer.country}</span>
                  </div>

                </div>

                {/* Links */}
                <div className="mt-4 flex gap-2">
                  {composer.social_link && (
                    <a
                      href={composer.social_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs bg-red-100 text-blue-600 px-2 py-1 rounded-full hover:bg-red-200 transition-colors"
                    >
                      🔗 Youtube Channel
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 pt-4 border-t border-aqua-100">
              <h4 className="text-sm font-semibold text-miku-darkCyan mb-2">📖 Mô tả:</h4>
              <p className="text-sm text-miku-deep leading-relaxed line-clamp-3">
                {composer.description || 'Chưa có thông tin mô tả'}
              </p>
            </div>

            {/* Edit Button - chỉ hiển thị cho admin */}
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate(`/composer/edit/${composer._id}`)}
                className="absolute top-4 right-4 flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 hover-lift"
              >
                <span className="text-lg">⚙️</span>
                Edit
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default ComposerList;
