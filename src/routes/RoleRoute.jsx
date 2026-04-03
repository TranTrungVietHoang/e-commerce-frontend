import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;

  // 1. Chưa đăng nhập -> Login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // 2. Đã đăng nhập nhưng sai Role -> Trang báo lỗi hoặc Home
  const hasRole = user?.roles?.some(role => allowedRoles.includes(role));
  
  return hasRole 
    ? children 
    : <Navigate to="/unauthorized" replace />;
};

export default RoleRoute;