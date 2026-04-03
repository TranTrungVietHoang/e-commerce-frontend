import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  // Nếu chưa đăng nhập, đá về login và lưu lại trang đang định vào (from)
  return isAuthenticated 
    ? children 
    : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;