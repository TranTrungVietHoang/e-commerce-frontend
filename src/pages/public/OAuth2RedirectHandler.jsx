import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spin, message } from 'antd';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    // Trích xuất parameters từ URL Query Params
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get('accessToken');
    const refreshToken = queryParams.get('refreshToken');
    const userId = queryParams.get('userId');
    const email = queryParams.get('email');
    const fullName = queryParams.get('fullName');
    const avatarUrl = queryParams.get('avatarUrl');
    const roles = queryParams.get('roles');

    if (accessToken && refreshToken) {
      // Đăng nhập tự động bằng Token
      loginWithToken({
        accessToken,
        refreshToken,
        userId: parseInt(userId, 10) || null,
        email,
        fullName,
        avatarUrl,
        roles
      });

      message.success('Đăng nhập qua Google thành công!');
      // Navigate users to Home page
      navigate('/', { replace: true });
    } else {
      message.error('Lỗi xác thực OAuth2. Không tìm thấy token!');
      navigate('/login', { replace: true });
    }
  }, [location, loginWithToken, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <Spin size="large" />
      <h3 style={{ marginTop: 20 }}>Đang xác thực thông tin tài khoản Google...</h3>
    </div>
  );
};

export default OAuth2RedirectHandler;
