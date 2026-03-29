import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — bảo vệ route bằng Auth và Role.
 *
 * Props:
 *   children    — component cần bảo vệ
 *   roles       — mảng role được phép, ví dụ ['ROLE_ADMIN']
 *                 Nếu không truyền → chỉ cần đăng nhập là đủ
 *   redirectTo  — route redirect khi không đủ quyền (default '/login')
 */
const ProtectedRoute = ({ children, roles = [], redirectTo = '/login' }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Đang kiểm tra phiên đăng nhập..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Lưu lại URL định đến, sau khi login sẽ redirect về đó
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles.length > 0) {
    const hasRole = roles.some((r) => user?.roles?.includes(r));
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
