import React, { useEffect, useRef, useState } from 'react';

export default function SongPlayer({ song }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Khởi tạo/cập nhật Audio khi song thay đổi
  useEffect(() => {
    if (!song?.url_song) return;
 
    // Sử dụng URL trực tiếp từ Cloudinary, fallback về server cũ nếu cần
    const url = song.url_song.startsWith('http') 
      ? song.url_song 
      : `${process.env.REACT_APP_API_URL}${song.url_song}`;
    const audio = new Audio(url);
    audioRef.current = audio;

    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', onEnded);

    // cleanup khi unmount hoặc khi đổi bài
    return () => {
      audio.pause();
      audio.removeEventListener('ended', onEnded);
    };
  }, [song?.url_song]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(prev => !prev);
  };

  if (!song) return null;

  return (
    <div className="song-player">
      <h2>{song.title}</h2>
      <button onClick={togglePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <p>{song.description}</p>
      {song.url_cover && (
        <img
          src={song.url_cover}
          onError={(e) => {
            e.target.src = `${process.env.REACT_APP_API_URL}${song.url_cover}`;
          }}
          alt={`${song.title} cover`}
        />
      )}
    </div>
  );
}
