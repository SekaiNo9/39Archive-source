import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import axios from 'axios';

// Import các components
import Topbar from './components/Topbar';
import MiniPlayer from './components/MiniPlayer';
import { MiniPlayerProvider } from './contexts/MiniPlayerContext';
import Landing from './pages/Landing';
import Home from './pages/Home';
import SongCollection from './pages/SongCollection';
import SongPage from './pages/SongPage';
import PerformerList from './pages/PerformerList';
import AddPerformerPage from './pages/AddPerformer';
import UpdatePerformerPage from './pages/UpdatePerformerPage';
import ComposerList from './pages/ComposerList';
import AddComposerPage from './pages/AddComposer';
import UpdateComposerPage from './pages/UpdateComposerPage';
import SongUpload from './pages/SongUpload';
import FixLyrics from './pages/FixLyrics';
import MyArchive from './pages/MyArchive';
import NotFound from './pages/NotFound';
import SongEditPage from './pages/SongEditPage';
import NewsPage from './pages/NewsPage';
import UploadNewsPage from './pages/UploadNewsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

// Import Playlist components
import PlaylistPage from './pages/PlaylistPage';
import CreatePlaylist from './pages/CreatePlaylist';
import AllPlaylists from './pages/AllPlaylists';

const Layout = ({ user, setUser }) => (
  <div className="min-h-screen flex flex-col pb-20">
    <Topbar user={user} setUser={setUser} />
    <main className="flex-1 container mx-auto px-4 py-6">
      <Outlet />
    </main>
    <MiniPlayer />
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi load app, fetch thông tin user từ cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Skip auto-fetch nếu đang ở trang login để tránh conflict
        const currentPath = window.location.pathname;
        console.log('🔍 App.jsx - Current path:', currentPath);
        if (currentPath === '/login' || currentPath === '/register') {
          console.log('🔍 App.jsx - Skipping auto-fetch for login/register page');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        console.log('🔍 App.jsx - Fetching user from:', `${process.env.REACT_APP_API_URL}/account/me`);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/account/me`, {
          withCredentials: true
        });
        
        // Kiểm tra và log response để debug
        console.log('✅ App.jsx - API response data:', res.data);
        console.log('✅ App.jsx - User account:', res.data.account);
        
        if (res.data && res.data.account) {
          // Tiêu chuẩn hóa user data cho toàn bộ ứng dụng
          // Lưu user trực tiếp là account object để dễ truy cập
          setUser(res.data.account);
          console.log('✅ App.jsx - User set successfully:', res.data.account.login_name);
        } else {
          console.warn('⚠️ App.jsx - Unexpected user data format:', res.data);
          setUser(null);
        }
      } catch (err) {
        console.error('❌ App.jsx - Error fetching user:', err);
        console.error('❌ App.jsx - Error details:', err.response?.data);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  // Sửa ProtectedRoute để xử lý đúng quyền
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin w-12 h-12 border-4 border-aqua-200 border-t-aqua-500 rounded-full"></div>
        </div>
      );
    }
    
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/home" replace />;
    }
    
    return children;
  };

  return (
    <MiniPlayerProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page không cần Topbar */}
          <Route path="/" element={<Landing />} />

          {/* Layout có Topbar và MiniPlayer */}
          <Route element={<Layout user={user} setUser={setUser} />}>
            {/* Public routes */}
            <Route path="/home" element={<Home user={user} setUser={setUser} />} />
            <Route path="/song-collection" element={<SongCollection user={user} setUser={setUser} />} />
            <Route path="/song-detail/:id" element={<SongPage user={user} setUser={setUser} />} />
            <Route path="/composer" element={<ComposerList user={user} />} />
            <Route path="/v-singer" element={<PerformerList user={user} />} />
            <Route path="/news" element={<NewsPage user={user} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />

            {/* Playlist routes */}
            <Route path="/playlists" element={<AllPlaylists user={user} />} />
            <Route path="/playlist/:id" element={<PlaylistPage user={user} />} />

            {/* User-only */}
            <Route path="/my-archive" element={<MyArchive user={user} setUser={setUser} />} />
            <Route
              path="/create-playlist"
              element={
                <ProtectedRoute>
                  <CreatePlaylist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />

            {/* Admin-only */}
            <Route
              path="/v-singer/add"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AddPerformerPage user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/v-singer/edit/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UpdatePerformerPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/composer/add"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AddComposerPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/composer/edit/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UpdateComposerPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/song-upload"
              element={
                <ProtectedRoute requiredRole="admin">
                  <SongUpload user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/song-edit/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <SongEditPage user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fix-lyrics/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <FixLyrics user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/news/upload"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UploadNewsPage user={user} setUser={setUser}/>
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MiniPlayerProvider>
  );
}
