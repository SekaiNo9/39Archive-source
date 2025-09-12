import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SongTile from '../components/SongTile';
import PlaylistTile from '../components/PlaylistTile';
import { PlusIcon } from '@heroicons/react/24/outline';

const MyArchive = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [songsLoaded, setSongsLoaded] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoaded, setPlaylistsLoaded] = useState(false);

  // Đầu tiên: Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        // Nếu đã có user từ props, sử dụng luôn
        if (user) {
          // Kiểm tra xem user có chứa account không
          if (user.account) {
            // Trường hợp 1: Dữ liệu bọc trong account (từ App.jsx)
            setUserData(user.account);
          } else {
            // Trường hợp 2: Đã là dữ liệu account (đã trích xuất trước đó)
            setUserData(user);
          }
          setLoading(false);
          return;
        }
        
        // Nếu không có user, chuyển hướng đến trang đăng nhập
        setError('Bạn cần đăng nhập để xem trang này.');
        setTimeout(() => navigate('/login'), 2000); // Tự động chuyển hướng sau 2s
        setLoading(false);
      } catch (err) {
        console.error('❌ Error checking auth:', err);
        setError('Không thể xác thực người dùng. Vui lòng đăng nhập lại.');
      } finally {
        setLoading(false);
      }
    };
    
    checkUserAuth();
  }, [user, navigate]);

  // Sau khi có userData, fetch thông tin bài hát
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        if (!userData) return;
        if (songsLoaded) return;

        // Chỉ fetch songs cho user thường, admin không cần
        if (userData.role === 'user') {
          // Fetch latest songs
          const latestSongs = userData.latedSong && userData.latedSong.length > 0
            ? (await Promise.all(
                userData.latedSong.map(async (songId) => {
                  try {
                    const s = await axios.get(`${process.env.REACT_APP_API_URL}/song/${songId}`);
                    return s.data;
                  } catch (err) {
                    return null;
                  }
                })
              )).filter(Boolean)
            : [];

          // Fetch favorite songs
          const favSongs = userData.favSong && userData.favSong.length > 0
            ? (await Promise.all(
                userData.favSong.map(async (songId) => {
                  try {
                    const s = await axios.get(`${process.env.REACT_APP_API_URL}/song/${songId}`);
                    return s.data;
                  } catch (err) {
                    return null;
                  }
                })
              )).filter(Boolean)
            : [];

          setUserData(prev => ({
            ...prev,
            latedSong: latestSongs,
            favSong: favSongs
          }));
        }
        
        setSongsLoaded(true);
      } catch (err) {
        setError('Không lấy được thông tin bài hát.');
      }
    };

    fetchSongs();
  }, [userData, songsLoaded]);

  // Fetch playlists của user
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!userData?._id || playlistsLoaded) return;

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/playlist/all?userId=${userData._id}`,
          { withCredentials: true }
        );

        if (res.data.success) {
          setPlaylists(res.data.data);
        }
        setPlaylistsLoaded(true);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setPlaylistsLoaded(true);
      }
    };

    fetchPlaylists();
  }, [userData, playlistsLoaded]);

  // Hàm xử lý navigation cho admin
  const handleAdminNavigation = (path) => {
    console.log('🚀 Admin navigating to:', path);
    navigate(path);
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🎵</div>
          <h2 className="text-2xl font-bold text-miku-deep mb-4">Yêu cầu đăng nhập</h2>
          <p className="text-miku-darkCyan mb-8">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-aqua text-white px-8 py-3 rounded-full hover:shadow-aqua-lg transition-all duration-300 font-medium hover-lift"
          >
            🚀 Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-aqua-200 border-t-aqua-500 rounded-full mx-auto mb-4"></div>
          <p className="text-miku-darkCyan text-lg">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-miku-deep mb-4 animate-glow">
          👤 Bộ Lưu trữ Của Tôi
        </h1>
        <p className="text-lg text-miku-darkCyan opacity-80">
          Chào mừng trở lại, <span className="font-semibold text-miku-cyan">{userData.username}</span>!
          {userData.role === 'admin' && <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-sm rounded-full">Admin</span>}
        </p>
        {/* Debug: Hiển thị thông tin user để kiểm tra */}
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
          DEBUG: Role = "{userData.role}" | User ID = {userData._id}
        </div>
        <div className="w-24 h-1 bg-gradient-aqua mx-auto rounded-full mt-4"></div>
      </div>

      {userData.role === 'admin' ? (
        /* Admin Panel */
        <div className="space-y-8">
          <div className="glass-effect p-8 rounded-2xl shadow-miku">
            <h2 className="text-2xl font-bold text-miku-deep mb-6 flex items-center gap-3">
              ⚙️ Panel Quản trị
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <button 
                onClick={() => handleAdminNavigation('/v-singer/add')} 
                className="group bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover-lift"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🎤</div>
                <div className="font-bold text-lg mb-1">Add Performer</div>
                <div className="text-sm opacity-90">Thêm V-Singer mới</div>
              </button>

              <button 
                onClick={() => handleAdminNavigation('/composer/add')} 
                className="group bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover-lift"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🎼</div>
                <div className="font-bold text-lg mb-1">Add Composer</div>
                <div className="text-sm opacity-90">Thêm nhạc sĩ mới</div>
              </button>

              <button 
                onClick={() => handleAdminNavigation('/song-upload')} 
                className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover-lift"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🎵</div>
                <div className="font-bold text-lg mb-1">Upload Song</div>
                <div className="text-sm opacity-90">Đăng bài hát mới</div>
              </button>

              <button 
                onClick={() => handleAdminNavigation('/news/upload')} 
                className="group bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover-lift"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📰</div>
                <div className="font-bold text-lg mb-1">Upload News</div>
                <div className="text-sm opacity-90">Đăng tin tức mới</div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* User Dashboard */
        <div className="space-y-12">
          {/* Recent Songs Section */}
          <section className="glass-effect p-8 rounded-2xl shadow-miku">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-aqua rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-miku-deep">🕒 Bài hát xem gần nhất</h2>
            </div>
            
            {userData.latedSong && userData.latedSong.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {userData.latedSong.map(song => (
                  <div key={song._id} className="hover-lift">
                    <SongTile song={song} user={userData} setUser={setUser} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎵</div>
                <p className="text-miku-darkCyan text-lg mb-4">Chưa có bài hát nào được xem gần đây</p>
                <button
                  onClick={() => navigate('/song-collection')}
                  className="bg-gradient-aqua text-white px-6 py-3 rounded-full hover:shadow-aqua-lg transition-all duration-300 font-medium hover-lift"
                >
                  🎵 Khám phá ngay
                </button>
              </div>
            )}
          </section>

          {/* Favorite Songs Section */}
          <section className="glass-effect p-8 rounded-2xl shadow-miku">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-miku rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-miku-deep">❤️ Bài hát yêu thích</h2>
            </div>
            
            {userData.favSong && userData.favSong.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {userData.favSong.map(song => (
                  <div key={song._id} className="hover-lift">
                    <SongTile song={song} user={userData} setUser={setUser} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💖</div>
                <p className="text-miku-darkCyan text-lg mb-4">Chưa có bài hát yêu thích nào</p>
                <p className="text-miku-darkCyan opacity-70 text-sm mb-6">
                  Thêm bài hát vào danh sách yêu thích bằng cách nhấn vào biểu tượng trái tim
                </p>
                <button
                  onClick={() => navigate('/song-collection')}
                  className="bg-gradient-aqua text-white px-6 py-3 rounded-full hover:shadow-aqua-lg transition-all duration-300 font-medium hover-lift"
                >
                  💖 Tìm bài hát yêu thích
                </button>
              </div>
            )}
          </section>

          {/* Playlists Section */}
          <section className="glass-effect p-8 rounded-2xl shadow-miku">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-miku rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-miku-deep">🎶 Playlist của tôi</h2>
            </div>
            
            {playlists && playlists.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {playlists.map(playlist => (
                  <div key={playlist._id} className="hover-lift">
                    <PlaylistTile 
                      playlist={playlist} 
                      user={userData} 
                      showControls={false}
                    />
                  </div>
                ))}
                
                {/* Create Playlist Button */}
                <div className="hover-lift">
                  <button
                    onClick={() => navigate('/create-playlist')}
                    className="w-full aspect-square bg-gray-800 hover:bg-gray-700 border-2 border-dashed border-gray-600 hover:border-cyan-400 rounded-lg flex flex-col items-center justify-center transition-all duration-300 group"
                  >
                    <PlusIcon className="w-12 h-12 text-gray-500 group-hover:text-cyan-400 mb-2 transition-colors" />
                    <span className="text-gray-500 group-hover:text-cyan-400 font-medium transition-colors">
                      Tạo Playlist
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎶</div>
                <p className="text-miku-darkCyan text-lg mb-4">Chưa có playlist nào</p>
                <p className="text-miku-darkCyan opacity-70 text-sm mb-6">
                  Tạo playlist để sắp xếp và chia sẻ những bài hát yêu thích của bạn
                </p>
                <button
                  onClick={() => navigate('/create-playlist')}
                  className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 hover:from-emerald-300 hover:via-cyan-300 hover:to-blue-300 text-white px-8 py-4 rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-bold text-lg inline-flex items-center space-x-3"
                >
                  <PlusIcon className="w-6 h-6" />
                  <span>✨ Tạo Playlist đầu tiên ✨</span>
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default MyArchive;
