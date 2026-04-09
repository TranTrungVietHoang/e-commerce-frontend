import React, { createContext, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.userId; // AuthContext stored it as 'userId'
  
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!userId) {
      setCart({ items: [], subtotal: 0, totalItems: 0 });
      return null;
    }
    setLoading(true);
    try {
      const data = await cartService.getCart(userId);
      setCart(data || { items: [], subtotal: 0, totalItems: 0 });
      return data;
    } catch (error) {
      console.error('Error refreshing cart:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load giỏ hàng khi user ID thay đổi
    if (userId) {
      refreshCart();
    } else if (!authLoading) {
      // Chỉ reset giỏ hàng khi auth đã tải xong mà không có user
      setCart({ items: [], subtotal: 0, totalItems: 0 });
    }
  }, [userId, authLoading]);

  const runCartAction = async (action, successMessage) => {
    setLoading(true);
    try {
      const data = await action();
      setCart(data);
      if (successMessage) {
        message.success(successMessage);
      }
      return data;
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra với giỏ hàng');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(() => ({
    cart,
    loading: loading || authLoading,
    primaryShopId: cart.items?.[0]?.shopId ?? null,
    hasMultipleShops: new Set((cart.items || []).map((item) => item.shopId).filter(Boolean)).size > 1,
    refreshCart,
    addToCart: (payload) => runCartAction(() => cartService.addToCart(userId, payload), 'Đã thêm sản phẩm vào giỏ hàng'),
    updateCartItem: (itemId, quantity) => runCartAction(() => cartService.updateCartItem(userId, itemId, quantity)),
    removeCartItem: (itemId) => runCartAction(() => cartService.removeCartItem(userId, itemId), 'Đã xóa sản phẩm'),
    clearCart: () => runCartAction(() => cartService.clearCart(userId), 'Đã làm trống giỏ hàng'),
  }), [cart, loading, userId]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
