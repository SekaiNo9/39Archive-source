// AudioContext.jsx
import React, { createContext, useRef, useState } from 'react';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (songUrl) => {
    if (audioRef.current.src !== songUrl) {
      audioRef.current.src = songUrl;
    }
    audioRef.current.play();
    setIsPlaying(true);
  };
  
  const pauseSong = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  return (
    <AudioContext.Provider
      value={{ audioRef, currentSong, setCurrentSong, isPlaying, setIsPlaying, playSong, pauseSong }}
    >
      {children}
    </AudioContext.Provider>
  );
};
