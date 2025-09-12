import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMiniPlayer } from '../contexts/MiniPlayerContext';

const MiniPlayer = () => {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    seek,
    setVolume
  } = useMiniPlayer();

  // Debug logging
  React.useEffect(() => {
    console.log('MiniPlayer state:', {
      currentSong: currentSong?.title,
      isPlaying,
      currentTime,
      duration,
      volume
    });
  }, [currentSong, isPlaying, currentTime, duration, volume]);

  if (!currentSong) return null;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-aqua-200 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-2 md:px-6 py-2 md:py-4">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Song Info - Responsive */}
          <div 
            className="flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
            onClick={() => navigate(`/song-detail/${currentSong._id}`)}
          >
            <img
              src={currentSong.url_cover}
              onError={(e) => {
                e.target.src = `${process.env.REACT_APP_API_URL}${currentSong.url_cover}`;
              }}
              alt={currentSong.title}
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-aqua"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-slate-800 truncate text-sm md:text-base">{currentSong.title}</h4>
              <p className="text-xs md:text-sm text-miku-darkCyan truncate">
                {Array.isArray(currentSong.performers)
                  ? currentSong.performers.map(p => p.nick_name || p).join(', ')
                  : currentSong.performers || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 flex items-center gap-2 md:gap-4 overflow-hidden">
            {/* Play/Pause */}
            <button
              onClick={() => {
                console.log('MiniPlayer toggle button clicked');
                togglePlayPause();
              }}
              className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gradient-aqua text-white rounded-full hover:shadow-aqua-lg transition-all duration-300 hover-lift flex-shrink-0"
            >
              <span className="text-sm md:text-lg">
                {isPlaying ? '⏸️' : '▶️'}
              </span>
            </button>

            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-1 md:gap-2 min-w-0">
              <span className="text-xs text-miku-darkCyan font-mono w-8 md:w-10 hidden sm:inline">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative min-w-0">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-1 md:h-2 bg-aqua-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #39d0d8 0%, #39d0d8 ${(currentTime / duration) * 100}%, #e2e8f0 ${(currentTime / duration) * 100}%, #e2e8f0 100%)`
                  }}
                />
              </div>
              <span className="text-xs text-miku-darkCyan font-mono w-8 md:w-10 hidden sm:inline">
                {formatTime(duration)}
              </span>
            </div>

            {/* Volume - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <span className="text-sm">🔊</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-16 lg:w-20 h-1 bg-aqua-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #39d0d8 0%, #39d0d8 ${volume * 100}%, #e2e8f0 ${volume * 100}%, #e2e8f0 100%)`
                }}
              />
            </div>

            {/* Go to Song Button - Responsive */}
            <button
              onClick={() => navigate(`/song-detail/${currentSong._id}`)}
              className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm bg-aqua-100 text-miku-darkCyan rounded-lg hover:bg-aqua-200 transition-colors flex-shrink-0"
            >
              <span>🔍</span>
              <span className="hidden sm:inline">Chi tiết</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
