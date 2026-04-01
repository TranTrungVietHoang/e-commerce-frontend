import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Hook để sử dụng Auth context
 */
const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};

export default useAuth;