import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';

const ProfilePage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!user);
  const [form, setForm] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState(null);

  // Fetch user data if not provided as prop
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Nếu đã có user từ props
        if (user) {
          // Xác định userData dựa trên cấu trúc của user
          let actualUserData;
          if (user.account) {
            // Trường hợp 1: Dữ liệu bọc trong account (từ App.jsx)
            actualUserData = user.account;
          } else {
            // Trường hợp 2: Đã là dữ liệu account (đã trích xuất trước đó)
            actualUserData = user;
          }
          
          setUserData(actualUserData);
          setLoading(false);
          
          // Initialize form with user data
          setForm(prev => ({
            ...prev,
            username: actualUserData.username || '',
            email: actualUserData.email || ''
          }));
          
          // Set avatar preview if user has one
          const avatarField = actualUserData.avt || actualUserData.avatar;
          if (avatarField) {
            // Check if avatar URL already includes the API URL
            const avatarUrl = avatarField.startsWith('http') 
              ? avatarField 
              : `${process.env.REACT_APP_API_URL}${avatarField}`;
            setPreview(avatarUrl);
          }
          return;
        }

        // Nếu chưa có, fetch từ API
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/account/me`,
          { withCredentials: true }
        );
        
        if (response.data && response.data.account) {
          console.log('✅ Fetched user data:', response.data.account);
          
          // Update global user state if setUser is provided
          if (setUser) {
            // Lưu nguyên cấu trúc response để đồng nhất với App.jsx
            setUser(response.data); 
          }
          
          // Set userData state với account object
          setUserData(response.data.account);
          
          // Initialize form với dữ liệu account
          setForm(prev => ({
            ...prev,
            username: response.data.account.username || '',
            email: response.data.account.email || ''
          }));
          
          // Set avatar preview if user has one
          const avatarField = response.data.account.avt || response.data.account.avatar;
          if (avatarField) {
            const avatarUrl = avatarField.startsWith('http')
              ? avatarField
              : `${process.env.REACT_APP_API_URL}${avatarField}`;
            setPreview(avatarUrl);
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('❌ Error fetching user data:', err);
        setError('Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
        
        // Redirect to login after a short delay
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, setUser, navigate]);

  // Update form when user data changes
  useEffect(() => {
    if (userData) {
      setForm(prev => ({
        ...prev,
        username: userData.username || '',
        email: userData.email || ''
      }));
      
      const avatarField = userData.avt || userData.avatar;
      if (avatarField) {
        const avatarUrl = avatarField.startsWith('http')
          ? avatarField
          : `${process.env.REACT_APP_API_URL}${avatarField}`;
        setPreview(avatarUrl);
      }
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (!userData) {
        throw new Error('Không có thông tin người dùng');
      }

      // Lấy ID từ userData
      const userId = userData._id;
      
      console.log('🔍 User data:', userData);
      console.log('🔍 Using userId:', userId);
      
      if (!userId) {
        throw new Error('Không tìm thấy ID người dùng');
      }

      console.log('🔍 Updating profile with data:', {
        userId: userId,
        formData: form,
        apiUrl: process.env.REACT_APP_API_URL
      });

      if (!form.username?.trim()) {
        throw new Error('Username không được để trống');
      }
      if (!form.email?.trim()) {
        throw new Error('Email không được để trống');
      }

      const formData = new FormData();
      formData.append('username', form.username.trim());
      formData.append('email', form.email.trim());
      
      // Nếu có avatar mới
      if (avatar) {
        formData.append('url_avt', avatar);
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/account/${userId}/profile`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Profile updated successfully:', response.data);
      
      if (response.data?.user) {
        // Cập nhật userData local
        setUserData(response.data.user);
        
        // Update global user state
        if (setUser && user) {
          if (user.account) {
            // Nếu user object có cấu trúc { account: {...} }
            setUser({
              ...user,
              account: response.data.user
            });
          } else {
            // Nếu user object trực tiếp là account data
            setUser(response.data.user);
          }
        }
        
        // Cập nhật preview với URL mới từ server
        if (response.data.user.avt) {
          const avatarUrl = response.data.user.avt.startsWith('http')
            ? response.data.user.avt
            : `${process.env.REACT_APP_API_URL}${response.data.user.avt}`;
          setPreview(avatarUrl);
        }
      }
      
      setToast({ message: 'Cập nhật thông tin thành công!', type: 'success' });
      setIsEditing(false);
      setAvatar(null);

    } catch (err) {
      console.error('❌ Profile update error:', err);

      if (err.response?.status === 400) {
        const errorMsg = err.response.data?.message || 'Dữ liệu không hợp lệ';
        setError(`Lỗi: ${errorMsg}`);
      } else if (err.response?.status === 401) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền cập nhật thông tin này.');
      } else if (err.response?.status === 404) {
        setError('Không tìm thấy người dùng hoặc API endpoint.');
      } else if (err.response?.status === 500) {
        const errorMsg = err.response.data?.message || 'Lỗi server';
        setError(`Lỗi server: ${errorMsg}. Vui lòng thử lại sau.`);
      } else if (err.code === 'ECONNREFUSED') {
        setError('Không thể kết nối đến server. Kiểm tra backend có đang chạy không.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Yêu cầu bị timeout. Vui lòng thử lại.');
      } else {
        setError(`Lỗi không xác định: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!form.currentPassword || !form.newPassword) {
      setError('Vui lòng nhập đầy đủ thông tin mật khẩu!');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      if (!userData || !userData._id) {
        throw new Error('Không có thông tin người dùng');
      }
      
      const passwordData = new FormData();
      passwordData.append('currentPassword', form.currentPassword);
      passwordData.append('newPassword', form.newPassword);
      
      await axios.put(
        `${process.env.REACT_APP_API_URL}/account/${userData._id}/password`,
        passwordData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true 
        }
      );

      setToast({ message: 'Cập nhật mật khẩu thành công!', type: 'success' });
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu!';
      setError(errorMsg);
      console.error('❌ Password update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-aqua-200 border-t-aqua-500 rounded-full mx-auto mb-4"></div>
          <p className="text-miku-darkCyan text-lg">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  // Show login required state
  if (!userData && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-miku-deep mb-4">Yêu cầu đăng nhập</h2>
          <p className="text-miku-darkCyan mb-8">Bạn cần đăng nhập để xem trang cá nhân</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-aqua text-white px-8 py-3 rounded-full hover:shadow-aqua-lg transition-all duration-300 font-medium hover-lift"
          >
            🚀 Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  // Phần JSX return giữ nguyên
  return (
    <div className="max-w-6xl mx-auto p-6">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}

      {/* Debug info - có thể xóa sau khi đã ổn định */}
      <div className="hidden">
        <p>Debug: User ID = {userData?._id}</p>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-miku-deep mb-4 animate-glow">
          👤 Thông tin cá nhân
        </h1>
        <p className="text-lg text-miku-darkCyan opacity-80">
          Quản lý thông tin tài khoản của bạn
        </p>
        <div className="w-24 h-1 bg-gradient-aqua mx-auto rounded-full mt-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left Column - Personal Info & Avatar */}
        <div className="glass-effect rounded-2xl p-8 shadow-miku">
          <h2 className="text-2xl font-bold text-miku-deep mb-6 flex items-center gap-3">
            📝 Thông tin cá nhân
          </h2>
          
          {/* Avatar Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <img
                src={preview || '/default.png'}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-aqua-300 shadow-aqua-lg hover-lift transition-all duration-300"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-gradient-aqua text-white p-3 rounded-full hover:shadow-aqua-lg transition-all duration-300 hover-lift"
              >
                📷
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Basic Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-miku-darkCyan mb-2">
                👤 Tên hiển thị
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full p-4 border border-aqua-200 rounded-xl focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all duration-300 bg-white/70"
                placeholder="Nhập tên hiển thị..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-miku-darkCyan mb-2">
                📧 Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-4 border border-aqua-200 rounded-xl focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all duration-300 bg-white/70"
                placeholder="Nhập email..."
              />
            </div>
          </div>
        </div>

        {/* Right Column - Change Password */}
        <div className="glass-effect rounded-2xl p-8 shadow-miku">
          <h2 className="text-2xl font-bold text-miku-deep mb-6 flex items-center gap-3">
            🔒 Đổi mật khẩu
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-miku-darkCyan mb-2">
                🔑 Mật khẩu hiện tại
              </label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                className="w-full p-4 border border-aqua-200 rounded-xl focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all duration-300 bg-white/70"
                placeholder="Nhập mật khẩu hiện tại..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-miku-darkCyan mb-2">
                🔐 Mật khẩu mới
              </label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full p-4 border border-aqua-200 rounded-xl focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all duration-300 bg-white/70"
                placeholder="Nhập mật khẩu mới..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-miku-darkCyan mb-2">
                ✅ Xác nhận mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full p-4 border border-aqua-200 rounded-xl focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all duration-300 bg-white/70"
                placeholder="Xác nhận mật khẩu mới..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 font-medium text-center">❌ {error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <button
            onClick={handleUpdateInfo}
            disabled={isLoading}
            className="bg-gradient-aqua text-white px-8 py-4 rounded-xl hover:shadow-aqua-lg transition-all duration-300 font-semibold hover-lift disabled:opacity-50"
          >
            {isLoading ? '⏳ Đang cập nhật...' : '💾 Cập nhật thông tin'}
          </button>
          
          <button
            onClick={handleUpdatePassword}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:shadow-green-lg transition-all duration-300 font-semibold hover-lift disabled:opacity-50"
          >
            {isLoading ? '⏳ Đang đổi...' : '🔒 Cập nhật mật khẩu'}
          </button>
        </div>
        
        <button
          onClick={() => navigate('/my-archive')}
          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-xl hover:shadow-gray-lg transition-all duration-300 font-semibold hover-lift"
        >
          🔙 Quay lại
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
