import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);   // { userId, email, fullName, roles }
  const [loading, setLoading] = useState(true);

  // Khởi tạo lại state từ localStorage khi F5 trang
  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  // Lắng nghe event từ api.js interceptor khi token hết hạn (không hard reload)
  useEffect(() => {
    const handleAuthLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    // data = AuthResponse { accessToken, refreshToken, userId, email, fullName, roles }
    localStorage.setItem('accessToken',  data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const profile = { userId: data.userId, email: data.email, fullName: data.fullName, roles: data.roles };
    localStorage.setItem('authUser', JSON.stringify(profile));
    setUser(profile);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ignore network error */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser');
    setUser(null);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin    = user?.roles?.includes('ROLE_ADMIN')    ?? false;
  const isSeller   = user?.roles?.includes('ROLE_SELLER')   ?? false;
  const isCustomer = user?.roles?.includes('ROLE_CUSTOMER') ?? false;

  const value = useMemo(() => ({
    user, loading, isAuthenticated, isAdmin, isSeller, isCustomer, login, logout,
  }), [user, loading, isAuthenticated, isAdmin, isSeller, isCustomer, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
