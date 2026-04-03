import React, { createContext, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import cartService from '../services/cartService';
import storageUtils from '../utils/storageUtils';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    try {
      const data = await cartService.getCart();
      setCart(data || { items: [], subtotal: 0, totalItems: 0 });
      return data;
    } catch (error) {
      message.error(error.message || 'Khong the tai gio hang');
      return null;
    }
  };

  useEffect(() => {
    // Chỉ load giỏ hàng khi đã đăng nhập
    if (storageUtils.getItem('accessToken')) {
      refreshCart();
    }
  }, []);

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
      message.error(error.message || 'Co loi xay ra voi gio hang');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(() => ({
    cart,
    loading,
    primaryShopId: cart.items?.[0]?.shopId ?? null,
    hasMultipleShops: new Set((cart.items || []).map((item) => item.shopId).filter(Boolean)).size > 1,
    refreshCart,
    addToCart: (payload) => runCartAction(() => cartService.addToCart(payload), 'Da cap nhat gio hang'),
    updateCartItem: (itemId, quantity) => runCartAction(() => cartService.updateCartItem(itemId, quantity)),
    removeCartItem: (itemId) => runCartAction(() => cartService.removeCartItem(itemId), 'Da xoa san pham'),
    clearCart: () => runCartAction(() => cartService.clearCart(), 'Da xoa toan bo gio hang'),
  }), [cart, loading]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
