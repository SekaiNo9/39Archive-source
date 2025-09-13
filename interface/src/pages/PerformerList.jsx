import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PerformerList = ({ user }) => {
  const [performers, setPerformers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerformers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/performer/all`);
        setPerformers(response.data);
      } catch (error) {
        console.error('Error fetching performers:', error);
      }
    };
    fetchPerformers();
  }, []);
 
  return (
    <main className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 animate-glow">
          🎤 Danh sách Visual Singer
        </h2>
        <p className="text-lg text-miku-darkCyan opacity-80 mb-2">
          Khám phá {performers.length} nghệ sĩ ảo 
        </p>
        <div className="w-24 h-1 bg-gradient-aqua mx-auto rounded-full"></div>
      </div>

      {/* Performers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {performers.map((performer) => (
          <div
            key={performer._id}
            className="bg-white border border-aqua-200 rounded-2xl shadow-miku p-6 hover-lift transition-all duration-300 relative"
          >
            <div className="flex gap-6">
              {/* Avatar - Đã tăng kích thước từ w-32 h-32 lên w-48 h-48 */}
              <div className="flex-shrink-0 w-48 h-48 rounded-xl overflow-hidden border-3 border-aqua-200 shadow-aqua hover:shadow-aqua-lg transition-all duration-300">
                <img
                  src={performer.url_avt}
                  onError={(e) => {
                    e.target.src = `${process.env.REACT_APP_API_URL}${performer.url_avt}`;
                  }}
                  alt={performer.nick_name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info - Điều chỉnh spacing để phù hợp với avatar lớn hơn */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 truncate">
                  {performer.nick_name}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-miku-darkCyan font-semibold min-w-[80px]">🎭 Voice:</span>
                    <span className="text-miku-deep">{performer.voice_actor}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-miku-darkCyan font-semibold min-w-[80px]">⚧️ Gender:</span>
                    <span className="text-miku-deep">{performer.gender}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-miku-darkCyan font-semibold min-w-[80px]">🎂 Age:</span>
                    <span className="text-miku-deep">{performer.age}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-miku-darkCyan font-semibold min-w-[80px]">🎯 Symbol:</span>
                    <span className="text-miku-deep">{performer.symbol}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-miku-darkCyan font-semibold min-w-[80px]">🚀 Debut:</span>
                    <span className="text-miku-deep">{new Date(performer.debut_day).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                {/* Links */}
                <div className="mt-4 flex gap-2">
                  {performer.detail_info && (
                    <a 
                      href={performer.detail_info} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-xs bg-aqua-100 text-miku-darkCyan px-2 py-1 rounded-full hover:bg-aqua-200 transition-colors"
                    >
                      🔗 Infomation
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Description - Đã tăng không gian theo chiều dọc */}
            <div className="mt-6 pt-5 border-t border-aqua-100"> {/* Tăng margin/padding từ mt-4 pt-4 lên mt-6 pt-5 */}
              <h4 className="text-base font-semibold text-miku-darkCyan mb-3 flex items-center gap-2"> {/* Tăng font-size và margin */}
                <span className="text-lg">📖</span> Mô tả:
              </h4>
              <p className="text-sm text-miku-deep leading-relaxed line-clamp-5 min-h-[100px]"> {/* Tăng từ line-clamp-3 lên line-clamp-5 và thêm min-height */}
                {performer.description}
              </p>
            </div>

            {/* Edit Button - chỉ hiển thị cho admin */}
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate(`/v-singer/edit/${performer._id}`)}
                className="absolute top-4 right-4 flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 hover-lift"
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

export default PerformerList;
