import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SongTile from '../components/SongTile';
import PlaylistTile from '../components/PlaylistTile';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home({ user, setUser }) {
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topPlaylists, setTopPlaylists] = useState([]);

  useEffect(() => {
    const base = process.env.REACT_APP_API_URL;
    const fetchData = async () => {
      try {
        const res = await axios.get(`${base}/song/all`);
        const songs = res.data?.data || [];

        const topViews = songs
          .sort((a, b) => (parseInt(b.views) || 0) - (parseInt(a.views) || 0))
          .slice(0, 10);

        const newest = songs
          .sort((a, b) => {
            const dateA = new Date(a.release_date || a.createdAt);
            const dateB = new Date(b.release_date || b.createdAt);
            return dateB - dateA;
          })
          .slice(0, 5);

        setTrending(topViews);
        setRecent(newest);
        
        // Fetch top playlists
        const playlistRes = await axios.get(`${base}/playlist/top?limit=5`);
        if (playlistRes.data.success) {
          setTopPlaylists(playlistRes.data.data);
        }
      } catch (err) {
        console.error('❌ Error in Home.jsx:', err);
        toast.error('Không lấy được danh sách bài hát.');
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <ToastContainer />
      <main className="max-w-7xl mx-auto p-6">
        {/* Hero section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-miku-deep mb-4 animate-glow">
            🎵 Welcome to 39Archive
          </h1>
          <p className="text-lg text-miku-darkCyan opacity-80">
            Khám phá thế giới âm nhạc Hatsune Miku và các V-Singer
          </p>
        </div>

        {/* Các bài hát nổi bật */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-aqua rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">🔥 Bài hát nổi bật</h2>
              <span className="text-sm text-miku-darkCyan bg-aqua-100 px-2 py-1 rounded-full">Top 10 views</span>
            </div>
            <button
              onClick={() => (window.location.href = '/song-collection')}
              className="group flex items-center gap-2 text-miku-cyan hover:text-miku-darkCyan transition-colors duration-300 font-medium"
            >
              <span>Xem thêm</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </div>
          <div className="glass-effect p-6 rounded-2xl shadow-miku">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {trending.map((s) => (
                <div key={s._id} className="hover-lift">
                  <SongTile song={s} user={user} setUser={setUser} />
                </div>
              ))}
            </div>
          </div>
        </section>
         {/* Các bài hát mới ra */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-miku rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">✨ Các bài hát mới ra</h2>
              <span className="text-sm text-miku-darkCyan bg-miku-mint px-2 py-1 rounded-full">Top 5 mới nhất</span>
            </div>
            <button
              onClick={() => (window.location.href = '/song-collection')}
              className="group flex items-center gap-2 text-miku-cyan hover:text-miku-darkCyan transition-colors duration-300 font-medium"
            >
              <span>Xem thêm</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </div>
          <div className="glass-effect p-6 rounded-2xl shadow-miku">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {recent.map((s) => (
                <div key={s._id} className="hover-lift">
                  <SongTile song={s} user={user} setUser={setUser} />
                </div>
              ))}
            </div>
          </div>
        </section>     
        {/* Top Playlists */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-miku rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">🎶 Playlist nổi bật</h2>
              <span className="text-sm text-miku-darkCyan bg-miku-mint px-2 py-1 rounded-full">
                {topPlaylists.length > 0 ? `Top ${topPlaylists.length} yêu thích` : 'Đang tải...'}
              </span>
            </div>
            <button
              onClick={() => navigate('/playlists')}
              className="group flex items-center gap-2 text-miku-cyan hover:text-miku-darkCyan transition-colors duration-300 font-medium"
            >
              <span>Xem thêm</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </div>
          <div className="glass-effect p-6 rounded-2xl shadow-miku">
            {topPlaylists.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {topPlaylists.map((playlist) => (
                  <div key={playlist._id} className="hover-lift">
                    <PlaylistTile playlist={playlist} user={user} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎶</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Chưa có playlist nào
                </h3>
                <p className="text-gray-500 mb-4">
                  Hãy tạo playlist đầu tiên để chia sẻ với cộng đồng
                </p>
                {user && (
                  <button
                    onClick={() => navigate('/create-playlist')}
                    className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 hover:from-yellow-300 hover:via-orange-300 hover:to-pink-300 text-white px-8 py-4 rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-bold text-lg animate-pulse hover:animate-none"
                  >
                    ✨ Tạo playlist đầu tiên ✨
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        
      </main>
    </div>
  );
}
