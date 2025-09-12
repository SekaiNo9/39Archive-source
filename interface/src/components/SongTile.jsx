import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMiniPlayer } from '../contexts/MiniPlayerContext';

export default function SongTile({ song, user, setUser }) {
  const navigate = useNavigate();
  const base = process.env.REACT_APP_API_URL || '';
  const [isFav, setIsFav] = useState(user?.favSong?.includes(song._id));
  const { playSong } = useMiniPlayer();

  // Format duration to mm:ss
  const formatDuration = (duration) => {
    if (!duration) return '00:00';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format views count
  const formatViews = (views) => {
    const numViews = parseInt(views) || 0;
    if (numViews >= 1000000) return `${(numViews / 1000000).toFixed(1)}M`;
    if (numViews >= 1000) return `${(numViews / 1000).toFixed(1)}K`;
    return numViews.toLocaleString();
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích!');
      return;
    }
    
    try {
      console.log('❤️ Toggling favorite for song:', song._id);
      
      const res = await axios.put(
        `${base}/account/${user._id}/update-fav`,
        { songId: song._id },
        { withCredentials: true }
      );
      
      console.log('✅ Favorite update response:', res.data);
      
      // Cập nhật user state
      setUser(prev => ({ 
        ...prev, 
        favSong: res.data.favSong 
      }));
      
      // Cập nhật local state
      setIsFav(res.data.favSong.includes(song._id));
      
    } catch (err) {
      console.error('❌ Error toggling favorite:', err);
      alert('Không thể cập nhật yêu thích!');
    }
  };
 
  return (
    <div className="bg-white border border-aqua-200 rounded-xl shadow-miku p-4 flex flex-col hover-lift transition-all duration-300">
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={song.url_cover?.startsWith('http') ? song.url_cover : `${base}${song.url_cover}`}
          alt={song.title}
          onError={(e) => {
            // Fallback to old URL format if Cloudinary URL fails
            e.target.src = `${base}${song.url_cover}`;
          }}
          className="w-full h-40 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => navigate(`/song-detail/${song._id}`)}
        />
        <div className="absolute inset-0 bg-gradient-aqua opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
      </div>

      <h3
        className="text-lg font-semibold cursor-pointer text-miku-deep mb-2 truncate hover:text-miku-cyan transition-colors"
        onClick={() => navigate(`/song-detail/${song._id}`)}
      >
        {song.title}
      </h3>

      <div className="space-y-2 mb-4 flex-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-xs md:text-sm text-miku-darkCyan">
            <span className="text-sm md:text-lg">⏰</span>
            <span className="font-medium">{formatDuration(song.duration)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs md:text-sm text-miku-darkCyan">
            <span className="text-sm md:text-lg">👁️</span>
            <span className="font-medium">{formatViews(song.views)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2">
        <button
          className="flex items-center gap-1 md:gap-2 bg-gradient-aqua text-white px-2 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium hover:shadow-aqua-lg transition-all duration-300 hover-lift flex-1 justify-center"
          onClick={() => {
            console.log('SongTile play button clicked for:', song.title);
            console.log('🔍 Full song object:', song);
            playSong(song);
          }}
        >
          <span className="text-sm md:text-lg">▶️</span>
          <span className="hidden sm:inline">Phát nhạc</span>
          <span className="sm:hidden">Play</span>
        </button>
        <button 
          onClick={toggleFavorite} 
          className={`text-lg md:text-2xl transition-all duration-300 hover:scale-125 p-1 md:p-2 rounded-full ${
            isFav 
              ? 'text-red-500 hover:bg-red-50' 
              : 'text-gray-400 hover:text-red-400 hover:bg-red-50'
          }`}
          title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  );
}
