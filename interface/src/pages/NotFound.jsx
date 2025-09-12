import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound(){
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-miku-mint opacity-20 rounded-full animate-float"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-aqua-300 opacity-30 rounded-full animate-pulse-soft"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-miku-lightCyan opacity-25 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      </div>
 
      <div className="text-center z-10 max-w-2xl px-6">
        {/* 404 Number */}
        <div className="text-9xl md:text-[12rem] font-bold text-transparent bg-gradient-aqua bg-clip-text mb-4 animate-glow">
          404
        </div>
        
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-miku-deep">
          🎵 Oops! Trang không tìm thấy
        </h1>
        
        {/* Description */}
        <div className="glass-effect p-6 rounded-2xl shadow-miku mb-8">
          <p className="text-lg text-miku-darkCyan mb-4">
            Có vẻ như bạn đã lạc vào một giai điệu chưa được sáng tác...
          </p>
          <p className="text-base text-miku-darkCyan opacity-80">
            Trang này sẽ được cập nhật trong tương lai. Hãy quay lại trang chủ để khám phá thêm nhiều bài hát hay nhé!
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => nav('/home')} 
            className="group bg-gradient-aqua text-white px-8 py-3 rounded-full shadow-aqua-lg hover:shadow-glow transition-all duration-300 font-medium hover-lift"
          >
            <span className="flex items-center gap-2">
              🏠 <span>Về trang chủ</span>
            </span>
          </button>
          
          <button 
            onClick={() => nav(-1)} 
            className="group glass-effect text-miku-darkCyan px-8 py-3 rounded-full hover:bg-white/20 transition-all duration-300 font-medium hover-lift"
          >
            <span className="flex items-center gap-2">
              ← <span>Quay lại</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
 