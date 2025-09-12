import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const MiniPlayerContext = createContext();

export const useMiniPlayer = () => {
  const context = useContext(MiniPlayerContext);
  if (!context) {
    throw new Error('useMiniPlayer must be used within a MiniPlayerProvider');
  }
  return context;
};

export const MiniPlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // Playlist features
  const [playlist, setPlaylist] = useState([]); // Current playlist
  const [currentIndex, setCurrentIndex] = useState(0); // Current song index in playlist
  const [playMode, setPlayMode] = useState('linear'); // 'linear', 'repeat', 'shuffle'
  const [shuffleHistory, setShuffleHistory] = useState([]); // For shuffle mode
  
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Auto play next song based on play mode (will be handled by useEffect)
      // We'll implement this after all functions are defined
    };

    const handleCanPlay = () => {
      // Audio ready to play
    };

    const handleError = (e) => {
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      // Audio loading started
    };

    const handleProgress = () => {
      // Audio loading progress
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('progress', handleProgress);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('progress', handleProgress);
      audio.pause();
    };
  }, []);

  // Handle auto-play next song when current song ends
  useEffect(() => {
    if (!isPlaying && currentTime === 0 && currentSong && playlist.length > 0) {
      const nextIndex = getNextSongIndex();
      if (nextIndex >= 0 && playlist[nextIndex]) {
        const timer = setTimeout(() => {
          setCurrentIndex(nextIndex);
          playSong(playlist[nextIndex]);
        }, 500); // Small delay for smooth transition
        
        return () => clearTimeout(timer);
      }
    }
  }, [isPlaying, currentTime, currentSong, playlist, currentIndex, playMode]);

  const playSong = async (song, playlistSongs = null) => {
    if (!audioRef.current) {
      return;
    }

    try {
      const audio = audioRef.current;
      
      // If playlist is provided, update playlist state
      if (playlistSongs && Array.isArray(playlistSongs)) {
        setPlaylist(playlistSongs);
        const songIndex = playlistSongs.findIndex(s => s._id === song._id);
        setCurrentIndex(songIndex >= 0 ? songIndex : 0);
        setShuffleHistory([songIndex >= 0 ? songIndex : 0]); // Reset shuffle history
      }
      
      if (currentSong?._id !== song._id) {
        let fullSong = song;
        
        // Nếu không có url_song, fetch thông tin đầy đủ từ API
        const songUrl = song.url_song || song.audioUrl || song.songUrl;
        if (!songUrl) {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/song/${song._id}`);
            if (response.ok) {
              fullSong = await response.json();
            } else {
              throw new Error(`Failed to fetch song details: ${response.status}`);
            }
          } catch (fetchError) {
            alert('Không thể tải thông tin chi tiết bài hát!');
            return;
          }
        }
        
        setCurrentSong(fullSong);
        
        const finalSongUrl = fullSong.url_song || fullSong.audioUrl || fullSong.songUrl;
        if (!finalSongUrl) {
          alert('Không tìm thấy đường dẫn file nhạc!');
          return;
        }
        
        // Sử dụng URL trực tiếp từ Cloudinary, fallback về server cũ nếu cần
        const audioUrl = finalSongUrl.startsWith('http') 
          ? finalSongUrl 
          : `${process.env.REACT_APP_API_URL}${finalSongUrl}`;
        
        // Test if URL is accessible
        try {
          const response = await fetch(audioUrl, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (fetchError) {
          alert(`Không thể truy cập file nhạc: ${fetchError.message}`);
          return;
        }
        
        // Set audio source
        audio.src = audioUrl;
        
        // Wait for audio to load with timeout
        const loadPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio load timeout'));
          }, 10000); // 10 second timeout
          
          const handleCanPlay = () => {
            clearTimeout(timeout);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            resolve();
          };
          
          const handleError = () => {
            clearTimeout(timeout);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            reject(new Error('Audio load error'));
          };
          
          audio.addEventListener('canplay', handleCanPlay);
          audio.addEventListener('error', handleError);
          
          audio.load();
        });
        
        await loadPromise;
      }
      
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      alert(`Lỗi phát nhạc: ${error.message}`);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong || !audioRef.current.src) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(error => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  // Playlist navigation functions
  const getNextSongIndex = () => {
    if (playlist.length === 0) return -1;
    
    switch (playMode) {
      case 'shuffle':
        // Get random index that hasn't been played recently
        const availableIndices = playlist
          .map((_, index) => index)
          .filter(index => !shuffleHistory.includes(index));
        
        if (availableIndices.length === 0) {
          // All songs played, reset history and pick random
          setShuffleHistory([currentIndex]);
          return Math.floor(Math.random() * playlist.length);
        }
        
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        setShuffleHistory(prev => [...prev, randomIndex].slice(-Math.floor(playlist.length / 2))); // Keep history limited
        return randomIndex;
        
      case 'repeat':
        // Stay on current song
        return currentIndex;
        
      case 'linear':
      default:
        // Next song, or stop if at end
        return currentIndex + 1 < playlist.length ? currentIndex + 1 : -1;
    }
  };

  const getPrevSongIndex = () => {
    if (playlist.length === 0) return -1;
    
    switch (playMode) {
      case 'shuffle':
        // Go back in shuffle history if available
        const historyIndex = shuffleHistory.indexOf(currentIndex);
        if (historyIndex > 0) {
          return shuffleHistory[historyIndex - 1];
        }
        return currentIndex; // Stay on current if no history
        
      case 'repeat':
        // Stay on current song
        return currentIndex;
        
      case 'linear':
      default:
        // Previous song, or stop if at beginning
        return currentIndex - 1 >= 0 ? currentIndex - 1 : -1;
    }
  };

  const playNext = async () => {
    const nextIndex = getNextSongIndex();
    if (nextIndex >= 0 && playlist[nextIndex]) {
      setCurrentIndex(nextIndex);
      await playSong(playlist[nextIndex]);
    } else {
      // End of playlist
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const playPrevious = async () => {
    const prevIndex = getPrevSongIndex();
    if (prevIndex >= 0 && playlist[prevIndex]) {
      setCurrentIndex(prevIndex);
      await playSong(playlist[prevIndex]);
    }
  };

  const togglePlayMode = () => {
    const modes = ['linear', 'repeat', 'shuffle'];
    const currentModeIndex = modes.indexOf(playMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setPlayMode(nextMode);
    
    // Reset shuffle history when changing modes
    if (nextMode === 'shuffle') {
      setShuffleHistory([currentIndex]);
    }
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolumeLevel = (vol) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolume(vol);
    }
  };

  // Reset tất cả state về mặc định
  const resetPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.currentTime = 0;
    }
    
    setCurrentSong(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVolume(1);
  };

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playSong,
    togglePlayPause,
    seek,
    setVolume: setVolumeLevel,
    resetPlayer,
    
    // Playlist features
    playlist,
    currentIndex,
    playMode,
    playNext,
    playPrevious,
    togglePlayMode,
    
    // Playlist info
    hasNext: () => playlist.length > 0 && getNextSongIndex() >= 0,
    hasPrevious: () => playlist.length > 0 && getPrevSongIndex() >= 0,
  };

  return (
    <MiniPlayerContext.Provider value={value}>
      {children}
    </MiniPlayerContext.Provider>
  );
};
