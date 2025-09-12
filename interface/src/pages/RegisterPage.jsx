import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';

const RegisterPage = () => {
  const [form, setForm] = useState({
    login_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setToast('');

    // Kiểm tra mật khẩu khớp
    if (form.password !== form.confirmPassword) {
        setError('Mật khẩu không khớp!');
        return;
    }

    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/account/register`, {
        login_name: form.login_name,
        username: form.username,
        email: form.email,
        password: form.password
        });

        // Hiển thị thông báo
        setToast('Đăng ký thành công!');

        // Chuyển tới trang login sau 1.5 giây
        setTimeout(() => navigate('/login'), 1500);

    } catch (err) {
        setError('Đăng ký thất bại! ' + (err.response?.data?.message || err.message));
    }
    };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-5 md:top-10 right-4 md:right-20 w-24 md:w-48 h-24 md:h-48 bg-miku-mint opacity-10 rounded-full animate-float"></div>
        <div className="absolute bottom-5 md:bottom-10 left-4 md:left-20 w-18 md:w-36 h-18 md:h-36 bg-aqua-300 opacity-20 rounded-full animate-pulse-soft"></div>
        <div className="absolute top-1/2 left-2 md:left-10 w-12 md:w-24 h-12 md:h-24 bg-miku-lightCyan opacity-15 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <Toast message={toast} type="success" />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-miku-deep mb-2 animate-glow">
            ✨ Tạo tài khoản
          </h2>
          <p className="text-miku-darkCyan">Tham gia cộng đồng âm nhạc Hatsune Miku</p>
        </div>

        {/* Register Form */}
        <div className="glass-effect p-4 md:p-8 rounded-2xl shadow-miku">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  👤 Tên đăng nhập
                </label>
                <input 
                  type="text" 
                  name="login_name" 
                  placeholder="Tên đăng nhập duy nhất" 
                  value={form.login_name} 
                  onChange={handleChange} 
                  className="w-full border border-aqua-200 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-miku-darkCyan/50" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🎭 Tên hiển thị
                </label>
                <input 
                  type="text" 
                  name="username" 
                  placeholder="Tên hiển thị công khai" 
                  value={form.username} 
                  onChange={handleChange} 
                  className="w-full border border-aqua-200 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-miku-darkCyan/50" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                📧 Email
              </label>
              <input 
                type="email" 
                name="email" 
                placeholder="địa_chỉ_email@example.com" 
                value={form.email} 
                onChange={handleChange} 
                className="w-full border border-aqua-200 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-miku-darkCyan/50" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🔒 Mật khẩu
                </label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Mật khẩu mạnh" 
                  value={form.password} 
                  onChange={handleChange} 
                  className="w-full border border-aqua-200 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-miku-darkCyan/50" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🔐 Xác nhận mật khẩu
                </label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  placeholder="Nhập lại mật khẩu" 
                  value={form.confirmPassword} 
                  onChange={handleChange} 
                  className="w-full border border-aqua-200 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-miku-darkCyan/50" 
                  required 
                  onPaste={e=>e.preventDefault()} 
                  onCopy={e=>e.preventDefault()} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-aqua text-white px-6 py-3 rounded-lg hover:shadow-aqua-lg transition-all duration-300 font-medium hover-lift text-lg"
            >
              🚀 Tạo tài khoản
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-aqua-200">
            <p className="text-center text-miku-darkCyan">
              Đã có tài khoản?{" "}
              <Link 
                to="/login" 
                className="text-miku-cyan hover:text-miku-darkCyan font-medium hover:underline transition-colors"
              >
                🎵 Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
