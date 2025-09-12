import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
 
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Gửi cookie tự động nhờ withCredentials
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/account/me`, { withCredentials: true });

        const user = res.data;
 
        if (requiredRole) {
          // Nếu yêu cầu role, kiểm tra
          if (user.role === requiredRole) setAuthorized(true);
          else setAuthorized(false);
        } else {
          setAuthorized(true);
        }
      } catch (err) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (loading) return <div className="text-center mt-10">Đang kiểm tra quyền truy cập...</div>;

  if (!authorized) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
