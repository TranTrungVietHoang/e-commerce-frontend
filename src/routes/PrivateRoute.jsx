import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute: Bảo vệ route chỉ cho user đã đăng nhập
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Đang tải dữ liệu từ localStorage
  if (loading) {
    return <div>Đang tải...</div>;
  }

  // Chưa đăng nhập, chuyển về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập, cho phép truy cập
  return children;
};

export default PrivateRoute;
