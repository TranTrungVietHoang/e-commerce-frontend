import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import storageUtils from '../utils/storageUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);   // { userId, email, fullName, avatarUrl, roles }
  const [loading, setLoading] = useState(true);

  // Khởi tạo lại state từ localStorage khi F5 trang
  useEffect(() => {
    const stored = storageUtils.getItem('authUser');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  // Lắng nghe event từ api.js interceptor khi token hết hạn
  useEffect(() => {
    const handleAuthLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    storageUtils.setItem('accessToken',  data.accessToken);
    storageUtils.setItem('refreshToken', data.refreshToken);
    const profile = {
      userId:    data.userId,
      email:     data.email,
      fullName:  data.fullName,
      avatarUrl: data.avatarUrl || null,
      roles:     data.roles,
    };
    storageUtils.setItem('authUser', JSON.stringify(profile));
    setUser(profile);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    storageUtils.removeItem('accessToken');
    storageUtils.removeItem('refreshToken');
    storageUtils.removeItem('authUser');
    setUser(null);
  }, []);

  /** Cập nhật avatarUrl trong state + localStorage (gọi sau khi upload thành công) */
  const updateAvatar = useCallback((avatarUrl) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, avatarUrl };
      storageUtils.setItem('authUser', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isAuthenticated = !!user;
  const isAdmin    = user?.roles?.includes('ROLE_ADMIN')    ?? false;
  const isSeller   = user?.roles?.includes('ROLE_SELLER')   ?? false;
  const isCustomer = user?.roles?.includes('ROLE_CUSTOMER') ?? false;

  const value = useMemo(() => ({
    user, loading, isAuthenticated, isAdmin, isSeller, isCustomer,
    login, logout, updateAvatar,
  }), [user, loading, isAuthenticated, isAdmin, isSeller, isCustomer, login, logout, updateAvatar]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
