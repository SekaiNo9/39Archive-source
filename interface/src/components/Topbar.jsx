import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMiniPlayer } from '../contexts/MiniPlayerContext';

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/my-archive', label: 'My Archive' },
  { to: '/song-collection', label: 'Song List' },
  { to: '/v-singer', label: 'Visual Singers' },
  { to: '/composer', label: 'Producers' },
  { to: '/news', label: 'News' },
];

export default function Topbar({ user, setUser }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const base = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { resetPlayer } = useMiniPlayer();

  // Xử lý dữ liệu user khi prop thay đổi
  useEffect(() => {
    if (!user) {
      setUserData(null);
      return;
    }

    // Xác định userData dựa trên cấu trúc của user
    if (user.account) {
      // Trường hợp 1: Dữ liệu bọc trong account (từ App.jsx)
      setUserData(user.account);
    } else {
      // Trường hợp 2: Đã là dữ liệu account (đã trích xuất trước đó)
      setUserData(user);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.post(`${base}/account/logout`, {}, { withCredentials: true });
    } catch {}
    
    // Reset MiniPlayer state khi logout
    resetPlayer();
    
    setUser(null);
    navigate('/login');
  };

  // Xử lý hiển thị avatar
  const getAvatarUrl = () => {
    if (!userData) return null;

    // Kiểm tra các trường hợp có thể có của avatar
    const avatarField = userData.avt || userData.avatar;
    
    if (!avatarField) return null;

    // Nếu là URL đầy đủ (bắt đầu bằng http hoặc https), sử dụng luôn
    if (avatarField.startsWith('http')) {
      return avatarField;
    }
    
    // Nếu là đường dẫn tương đối, thêm base URL
    return `${base}${avatarField}`;
  };

  return (
    <header className="w-full">
      {/* Logo + Title - Responsive */}
      <div className="bg-aqua flex items-center justify-center py-4 md:py-6 lg:py-10">
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          <img
            src={`${base}/uploads/avt/icon_miku.jpg`}
            alt="icon"
            className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-cover rounded-md"
          />
          <h1 className="text-white text-2xl md:text-4xl lg:text-6xl xl:text-8xl font-extrabold tracking-wider italic drop-shadow-2xl bg-gradient-to-r from-white via-miku-lightCyan to-white bg-clip-text text-transparent animate-glow">
            39Archive
          </h1>
        </div>
      </div>
 
      {/* Navigation - Responsive */}
      <nav className="bg-blue-600 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-white hover:bg-blue-500'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-500 focus:outline-none"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {!userData ? (
                <>
                  <NavLink
                    to="/register"
                    className="hidden sm:inline-flex px-3 md:px-4 py-2 border-2 border-yellow-500 rounded-lg text-yellow-500 hover:bg-yellow-500 hover:text-white transition-all duration-300 text-sm font-medium"
                  >
                    Register
                  </NavLink>
                  <NavLink
                    to="/login"
                    className="px-3 md:px-4 py-2 border-2 border-green-500 rounded-lg text-green-500 hover:bg-green-500 hover:text-white transition-all duration-300 text-sm font-medium"
                  >
                    Login
                  </NavLink>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 border-2 border-white rounded-lg text-white hover:bg-white hover:text-blue-600 transition-all duration-300 text-sm font-medium"
                  >
                    {getAvatarUrl() ? (
                      <img
                        src={getAvatarUrl()}
                        alt="avatar"
                        className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
                      />
                    ) : (
                      <img
                        src={'/default.png'}
                        alt="avatar"
                        className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
                      />
                    )}
                    <span className="hidden sm:inline truncate max-w-20">
                      {userData.username}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-2 md:px-4 py-2 border-2 border-red-500 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-medium"
                  >
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden">⏻</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-700 rounded-b-lg">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-white text-blue-600 shadow'
                          : 'text-white hover:bg-blue-600'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                {/* Mobile Register button if not logged in */}
                {!userData && (
                  <NavLink
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block sm:hidden px-3 py-2 rounded-md text-base font-medium text-yellow-400 hover:bg-yellow-500 hover:text-white transition-colors"
                  >
                    Register
                  </NavLink>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
