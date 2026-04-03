import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute: Bảo vệ route chỉ cho user đã đăng nhập.
 * Lưu lại trang định truy cập (location) để có thể quay lại sau khi login.
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>;
  }

  // Nếu chưa đăng nhập, chuyển về login và lưu lại state 'from'
  return isAuthenticated 
    ? children 
    : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
