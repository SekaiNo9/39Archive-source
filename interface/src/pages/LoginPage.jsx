import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Toast from "../components/Toast";

export default function LoginPage({ setUser }) {
  const [form, setForm] = useState({ login_name: "", password: "" });
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const navigate = useNavigate();
  const base = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToast("");

    try {
      // Clear user state trước khi login để tránh conflict
      setUser(null);
      
      // Login
      await axios.post(`${base}/account/login`, form, { withCredentials: true });

      // Lấy user info ngay sau khi login
      const userRes = await axios.get(`${base}/account/me`, { withCredentials: true });
      setUser(userRes.data);

      setToast("Đăng nhập thành công!");
      navigate("/home");
    } catch (err) {
      setError(
        "Đăng nhập thất bại: " + (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 md:top-20 left-4 md:left-20 w-20 md:w-40 h-20 md:h-40 bg-miku-mint opacity-10 rounded-full animate-float"></div>
        <div className="absolute bottom-10 md:bottom-20 right-4 md:right-20 w-16 md:w-32 h-16 md:h-32 bg-aqua-300 opacity-20 rounded-full animate-pulse-soft"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Toast message={toast} type="success" />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-miku-deep mb-2 animate-glow">
            🎵 Đăng nhập
          </h2>
          <p className="text-miku-darkCyan">Chào mừng bạn quay trở lại!</p>
        </div>

        {/* Login Form */}
        <div className="glass-effect p-4 md:p-8 rounded-2xl shadow-miku">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  👤 Tên đăng nhập
                </label>
                <input
                  type="text"
                  name="login_name"
                  placeholder="Nhập tên đăng nhập của bạn"
                  value={form.login_name}
                  onChange={handleChange}
                  className="w-full border border-aqua-200 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-miku-darkCyan/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-miku-darkCyan mb-2">
                  🔒 Mật khẩu
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Nhập mật khẩu của bạn"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-aqua-200 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:border-transparent transition-all placeholder-miku-darkCyan/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-aqua text-white px-6 py-3 rounded-lg hover:shadow-aqua-lg transition-all duration-300 font-medium hover-lift text-lg"
            >
              🚀 Đăng nhập
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-aqua-200">
            <p className="text-center text-miku-darkCyan">
              Bạn chưa có tài khoản?{" "}
              <Link 
                to="/register" 
                className="text-miku-cyan hover:text-miku-darkCyan font-medium hover:underline transition-colors"
              >
                ✨ Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
