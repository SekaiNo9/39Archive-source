import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  if (!message) return null;
 
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-white text-aqua-600 border-aqua-400 shadow-aqua-lg';
      case 'error':
        return 'bg-white text-red-600 border-red-400 shadow-red-lg';
      case 'warning':
        return 'bg-white text-orange-600 border-orange-400 shadow-orange-lg';
      default:
        return 'bg-white text-miku-deep border-aqua-200 shadow-miku';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`
        flex items-center gap-3 px-6 py-4 rounded-xl border-2 
        ${getToastStyles()} 
        shadow-xl backdrop-blur-sm font-medium max-w-sm
        transform transition-all duration-300 hover:scale-105
      `}>
        <span className="text-2xl">{getIcon()}</span>
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;