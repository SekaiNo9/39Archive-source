import React from 'react';
import { useNavigate } from 'react-router-dom';
 
export default function Landing() {
  const navigate = useNavigate();
  const base = process.env.REACT_APP_API_URL;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-ocean relative overflow-hidden">
      {/* Enhanced floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-miku-mint opacity-20 rounded-full animate-float blur-sm"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-aqua-300 opacity-30 rounded-full animate-float blur-sm" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-miku-lightCyan opacity-25 rounded-full animate-pulse-soft blur-sm"></div>
        <div className="absolute top-32 right-1/4 w-20 h-20 bg-white opacity-15 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-miku-ice opacity-20 rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>
      
      {/* Main content */}
      <div className="text-center z-10 max-w-6xl px-6">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <img
              src="/icon_miku.jpg"
              alt="Miku Icon"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/30 shadow-2xl animate-pulse-soft hover-lift"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-spin-slow"></div>
          </div>
        </div>
 
        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl animate-glow tracking-wide">
          <span className="text-white">
            {'39Archive'.split('').map((char, index) => (
              <span 
                key={index} 
                className="inline-block animate-wave"
                style={{ animationDelay: (index * 0.1) + 's' }}
              >
                {char}
              </span>
            ))}
          </span>
        </h1>
        
        <div className="mb-8">
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto rounded-full"></div>
        </div>

        {/* Subtitle */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl text-miku-ice mb-8 drop-shadow-lg font-light tracking-wider">
          Bộ lưu trữ tiếng ca
        </h2>
        
        {/* Description */}
        <p className="text-lg md:text-xl lg:text-2xl text-miku-mint mb-6 max-w-4xl mx-auto leading-relaxed drop-shadow-md font-medium">
          Kho lưu trữ những bài hát của <span className="text-white font-semibold">Hatsune Miku</span> và các Visual Singer khác
        </p>
        
        <p className="text-base md:text-lg lg:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-sm italic">
          "Hi vọng bạn sẽ tìm thấy cho mình một khoảng lặng thanh bình trong cái thế giới đầy sôi động này!"
        </p>

        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/home')}
            className="group relative overflow-hidden bg-white text-miku-darkCyan px-10 py-4 rounded-full shadow-2xl hover:shadow-glow transition-all duration-300 font-bold text-lg hover-lift transform hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              🎵 Vào trang chủ
            </span>
            <div className="absolute inset-0 bg-gradient-aqua opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
          </button>
          
          <button
            onClick={() => window.open('https://github.com/SekaiNo9/39Archive-source', '_blank', 'noopener,noreferrer')}
            className="group relative overflow-hidden bg-transparent border-2 border-white/50 text-white px-10 py-4 rounded-full shadow-lg hover:shadow-white/20 transition-all duration-300 font-medium text-lg hover-lift transform hover:scale-105 backdrop-blur-sm"
          >
            <span className="relative z-10 flex items-center gap-2">
              💻 Open Source
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
          </button>
        </div>

      </div>

    </div>
  );
}
