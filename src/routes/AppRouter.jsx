import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

// ── Public pages ──────────────────────────────────────────────────────────────
import HomePage from '../pages/public/HomePage';
import ProductListPage from '../pages/public/ProductListPage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import SearchResultPage from '../pages/public/SearchResultPage';
import ShopPage from '../pages/public/ShopPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import OAuth2RedirectHandler from '../pages/public/OAuth2RedirectHandler';

// ── Customer pages (Requires login) ───────────────────────────────────────────
import ProfilePage from '../pages/customer/ProfilePage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderHistoryPage from '../pages/customer/OrderHistoryPage';
import OrderDetailPage from '../pages/customer/OrderDetailPage';
import WishlistPage from '../pages/customer/WishlistPage';

// ── Admin pages (Role: ROLE_ADMIN) ────────────────────────────────────────────
import AdminPanel from '../pages/admin/AdminPanel';
import AdminDashboard from '../pages/admin/AdminDashboard';
import CategoryManagePage from '../pages/admin/CategoryManagePage';
import UserManagePage from '../pages/admin/UserManagePage';
import ShopManagePage from '../pages/admin/ShopManagePage';
import AdminOrderManagePage from '../pages/admin/OrderManagePage';
import ProductModerationPage from '../pages/admin/ProductModerationPage';
import FlashSaleManagePage from '../pages/admin/FlashSaleManagePage';
import AdminVoucherManagePage from '../pages/admin/VoucherManagePage';

// ── Seller pages (Role: ROLE_SELLER) ──────────────────────────────────────────
import ProductManagePage from '../pages/seller/ProductManagePage';
import AddProductPage from '../pages/seller/AddProductPage';
import EditProductPage from '../pages/seller/EditProductPage';
import SellerOrderManagePage from '../pages/seller/OrderManagePage';
import SellerRevenueDashboard from '../pages/seller/SellerRevenueDashboard';
import VoucherManagePage from '../pages/seller/VoucherManagePage';
import ShopRegistrationPage from '../pages/seller/ShopRegistrationPage';
import FlashSaleRegisterPage from '../pages/seller/FlashSaleRegisterPage';

const AppRouter = () => {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/search" element={<SearchResultPage />} />
      <Route path="/shop/:shopId" element={<ShopPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
      <Route path="/unauthorized" element={<div style={{ padding: 80, textAlign: 'center', fontSize: 20 }}>🚫 Bạn không có quyền truy cập trang này.</div>} />

      {/* 2. Customer Routes (đã đăng nhập) */}
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
      <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
      <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
      <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />

      {/* 3. Seller Routes */}
      <Route path="/seller/shop/register" element={<PrivateRoute><ShopRegistrationPage /></PrivateRoute>} />
      <Route path="/seller" element={
        <RoleRoute allowedRoles={['ROLE_SELLER', 'ROLE_ADMIN']}>
          <Outlet /> 
        </RoleRoute>
      }>
        <Route index element={<Navigate to="revenue" replace />} />
        <Route path="products" element={<ProductManagePage />} />
        <Route path="products/add" element={<AddProductPage />} />
        <Route path="products/edit/:id" element={<EditProductPage />} />
        <Route path="orders" element={<SellerOrderManagePage />} />
        <Route path="vouchers" element={<VoucherManagePage />} />
        <Route path="revenue" element={<SellerRevenueDashboard />} />
        <Route path="categories" element={<CategoryManagePage />} />
        <Route path="flash-sales" element={<FlashSaleRegisterPage />} />
      </Route>

      {/* 4. Admin Routes (Role: ROLE_ADMIN) */}
      <Route path="/admin" element={
        <RoleRoute allowedRoles={['ROLE_ADMIN']}>
          <AdminPanel />
        </RoleRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagePage />} />
        <Route path="shops" element={<ShopManagePage />} />
        <Route path="categories" element={<CategoryManagePage />} />
        <Route path="orders" element={<AdminOrderManagePage />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="vouchers" element={<AdminVoucherManagePage />} />
        <Route path="moderation" element={<ProductModerationPage />} />
        <Route path="flash-sales" element={<FlashSaleManagePage />} />
      </Route>

      {/* 5. Fallback */}
      <Route path="*" element={<div style={{ padding: 80, textAlign: 'center', fontSize: 20 }}>404 — Trang không tồn tại</div>} />
    </Routes>
  );
};

export default AppRouter;