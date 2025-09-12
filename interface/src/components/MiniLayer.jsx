// MiniPlayer.jsx
import React, { useContext } from 'react';
import { AudioContext } from './AudioContext';
import { useNavigate } from 'react-router-dom';

export default function MiniPlayer() {
  const { currentSong, isPlaying, playSong, pauseSong } = useContext(AudioContext);
  const navigate = useNavigate();

  if (!currentSong) return null;
 
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-2 flex items-center justify-between shadow-lg cursor-pointer"
         onClick={() => navigate(`/song/${currentSong._id}`)}>
      <div>{currentSong.title}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          isPlaying ? pauseSong() : playSong();
        }}
        className="ml-4 px-3 py-1 bg-blue-600 rounded"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
