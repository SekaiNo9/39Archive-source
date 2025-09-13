import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useMiniPlayer } from '../contexts/MiniPlayerContext';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

export default function SongPage({ user, setUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const base = process.env.REACT_APP_API_URL;

  // Sử dụng MiniPlayer context thay vì local state
  const { 
    currentSong, 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    playSong, 
    togglePlayPause, 
    seek, 
    setVolume: setVolumeLevel 
  } = useMiniPlayer();

  const [song, setSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState('');
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
 
  useEffect(() => {
    if (!id) return;
    axios
      .get(`${base}/song/${id}`)
      .then((res) => setSong(res.data?.data ? res.data.data : res.data))
      .catch((err) => {
        setError('Không tải được bài hát.');
        setSong(null);
      });
  }, [id, base]);

  // Khi song load xong, tự động play bằng MiniPlayer
  useEffect(() => {
    if (song && song._id && currentSong?._id !== song._id) {
      playSong(song);
    }
  }, [song, playSong, currentSong]);

  // Cập nhật lyrics index dựa trên currentTime từ MiniPlayer
  useEffect(() => {
    if (Array.isArray(song?.lyrics) && song.lyrics.length > 0) {
      let idx = 0;
      for (let i = 0; i < song.lyrics.length; i++) {
        if (currentTime >= song.lyrics[i].start_time) {
          idx = i;
        } else break;
      }
      setCurrentIndex(idx);
    }
  }, [currentTime, song]);

  // Auto scroll to current lyric line
  useEffect(() => {
    const container = document.getElementById('lyrics-container');
    const currentLine = document.getElementById(`lyric-line-${currentIndex}`);
    
    if (container && currentLine) {
      const containerRect = container.getBoundingClientRect();
      const lineRect = currentLine.getBoundingClientRect();
      
      // Check if current line is outside visible area
      if (lineRect.top < containerRect.top || lineRect.bottom > containerRect.bottom) {
        currentLine.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest' 
        });
      }
    }
  }, [currentIndex]);

  const togglePlay = async () => {
    console.log('🎵 Toggle play - Current state:', { isPlaying, user });
    
    // Toggle play/pause
    togglePlayPause();

    // Chỉ tăng view và update lịch sử khi bắt đầu phát (từ pause → play)
    if (!isPlaying && song) {
      try {
        // 1. Tăng view cho bài hát
        console.log('📈 Incrementing view for song:', song._id);
        const viewResponse = await axios.post(
          `${base}/song/${song._id}/increment-view`,
          {},
          { withCredentials: true }
        );
        console.log('✅ View incremented:', viewResponse.data.views);
        
        // Cập nhật local song state với view mới
        setSong(prev => ({
          ...prev,
          views: viewResponse.data.views
        }));

      } catch (err) {
        console.error('❌ Error incrementing view:', err);
      }

      // 2. Cập nhật lịch sử xem (chỉ cho user role)
      if (user?.role === 'user') {
        try {
          console.log('🕒 Updating latest songs for user:', user._id);
          
          // Tạo mảng lịch sử mới
          let latest = user.latedSong || [];
          
          // Xóa bài hát này khỏi vị trí cũ (nếu có)
          latest = latest.filter(id => id.toString() !== song._id.toString());
          
          // Thêm vào đầu danh sách
          latest.unshift(song._id);
          
          // Giới hạn 5 bài hát gần nhất
          if (latest.length > 5) {
            latest = latest.slice(0, 5);
          }

          console.log('📝 New latest songs array:', latest);

          // Gửi API cập nhật
          const historyResponse = await axios.put(
            `${base}/account/${user._id}/latest-song`,
            { latestSong: latest },
            { withCredentials: true }
          );
          
          console.log('✅ Latest songs updated:', historyResponse.data);

          // Cập nhật user state
          setUser(prev => ({ 
            ...prev, 
            latedSong: latest 
          }));

        } catch (err) {
          console.error('❌ Error updating latest songs:', err);
        }
      }
    }
  };

  const seekTo = (sec) => {
    // Dùng MiniPlayer's seek
    seek(sec);
  };

  const handleVolumeChange = (vol) => {
    const newVolume = vol / 100;
    // Dùng MiniPlayer's setVolume
    setVolumeLevel(newVolume);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!song) return <div className="text-center mt-10">Đang tải...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* Hero Section */}
      <div className="glass-effect rounded-2xl shadow-miku p-8 mb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Album Cover */}
          <div className="lg:w-1/3">
            <img
              src={song.url_cover?.startsWith('http') ? song.url_cover : `${base}${song.url_cover}`}
              alt={song.title}
              className="w-full aspect-square object-cover rounded-2xl shadow-aqua-lg hover-lift transition-all duration-300"
              onError={(e) => {
                e.target.src = `${base}${song.url_cover}`;
              }}
            />
          </div>

          {/* Song Info */}
          <div className="lg:w-2/3">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
                {song.title}
              </h1>
              
              <div className="space-y-3 text-lg">
                <p className="flex items-center gap-3">
                  <span className="text-2xl">🎼</span>
                  <span className="font-semibold text-miku-darkCyan">Composer:</span>
                  <span className="text-miku-deep">
                    {Array.isArray(song.composers) && song.composers.length > 0
                      ? song.composers.map((c) => c.nick_name || c).join(', ')
                      : 'Unknown'}
                  </span>
                </p>
                
                <p className="flex items-center gap-3">
                  <span className="text-2xl">🎤</span>
                  <span className="font-semibold text-miku-darkCyan">Performer:</span>
                  <span className="text-miku-deep">
                    {Array.isArray(song.performers) && song.performers.length > 0
                      ? song.performers.map((p) => p.nick_name || p).join(', ')
                      : 'Unknown'}
                  </span>
                </p>
                
                <p className="flex items-center gap-3">
                  <span className="text-2xl">👀</span>
                  <span className="font-semibold text-miku-darkCyan">Views:</span>
                  <span className="text-miku-deep font-bold">{song.views || 0}</span>
                </p>
                
                <p className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <span className="font-semibold text-miku-darkCyan">Release:</span>
                  <span className="text-miku-deep">{new Date(song.release_date).toLocaleDateString('vi-VN')}</span>
                </p>

                {song.mv_link && (
                  <p className="flex items-center gap-3">
                    <span className="text-2xl">🎬</span>
                    <span className="font-semibold text-miku-darkCyan">MV:</span>
                    <a 
                      href={song.mv_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-aqua-600 hover:text-aqua-800 font-medium underline"
                    >
                      Xem Music Video
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {song.description && (
              <div className="mb-6 p-4 bg-white/50 rounded-lg">
                <h3 className="font-bold text-miku-darkCyan mb-2">📖 Mô tả:</h3>
                <p className="text-miku-deep leading-relaxed">{song.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Player Controls */}
        <div className="mt-8 p-6 bg-white/80 rounded-xl">
          <div className="flex flex-col gap-6">
            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={togglePlay}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-aqua text-white rounded-full hover:shadow-aqua-lg transition-all duration-300 font-medium hover-lift text-lg"
              >
                <span className="text-2xl">
                  {isPlaying ? '⏸️' : '▶️'}
                </span>
                {isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
              </button>

              {/* Add to Playlist Button - Only show for logged in users */}
              {user && (
                <button
                  onClick={() => setShowAddToPlaylist(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full hover:shadow-cyan-lg transition-all duration-300 font-medium hover-lift"
                >
                  <PlusIcon className="w-5 h-5" />
                  Thêm vào playlist
                </button>
              )}
              
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => navigate(`/fix-lyrics/${id}`)}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full hover:shadow-purple-lg transition-all duration-300 font-medium hover-lift"
                  >
                    <span className="text-xl">📝</span>
                    Sửa lời
                  </button>
                  <button
                    onClick={() => navigate(`/song-edit/${id}`)}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:shadow-orange-lg transition-all duration-300 font-medium hover-lift"
                  >
                    <span className="text-xl">⚙️</span>
                    Chỉnh sửa
                  </button>
                </>
              )}
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-miku-darkCyan w-12">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="flex-1 h-2 bg-aqua-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #39d0d8 0%, #39d0d8 ${(currentTime / duration) * 100}%, #e2e8f0 ${(currentTime / duration) * 100}%, #e2e8f0 100%)`
                }}
              />
              <span className="text-sm font-medium text-miku-darkCyan w-12">
                {formatTime(duration)}
              </span>
            </div>
 
            {/* Volume Control */}
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">🔊</span>
              <span className="text-sm font-medium text-miku-darkCyan">Âm lượng:</span>
              <input
                type="range"
                min={0}
                max={100}
                value={volume * 100}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-32 h-2 bg-aqua-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #39d0d8 0%, #39d0d8 ${volume * 100}%, #e2e8f0 ${volume * 100}%, #e2e8f0 100%)`
                }}
              />
              <span className="text-sm font-medium text-miku-darkCyan w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lyrics Section */}
      <div className="bg-white rounded-2xl shadow-miku p-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <span className="text-4xl">🎵</span>
          Lời bài hát
        </h2>
        
        {Array.isArray(song.lyrics) && song.lyrics.length > 0 ? (
          <div 
            id="lyrics-container"
            className="space-y-2 max-h-96 overflow-y-auto pr-4 custom-scrollbar"
          >
            {song.lyrics.map((line, i) => (
              <div
                key={i}
                id={`lyric-line-${i}`}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-500 text-center ${
                  i === currentIndex
                    ? 'bg-aqua-100 text-miku-darkCyan font-bold text-xl shadow-lg border-2 border-aqua-300'
                    : 'text-gray-600 hover:text-miku-darkCyan hover:bg-gray-50 text-lg'
                }`}
                onClick={() => seekTo(line.start_time)}
              >
                <span className="leading-relaxed block">
                  {line.line}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-miku-darkCyan">
            <span className="text-6xl mb-4 block">🎵</span>
            <p className="text-xl">Chưa có lời bài hát</p>
          </div>
        )}
      </div>

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={showAddToPlaylist}
        onClose={() => setShowAddToPlaylist(false)}
        songId={song._id}
        user={user}
      />
    </main>
  );
}
