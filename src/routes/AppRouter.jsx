import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

// ── Public pages ──────────────────────────────────────────────────────────────
import HomePage from '../pages/public/HomePage';
import ProductListPage from '../pages/public/ProductListPage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import SearchResultPage from '../pages/public/SearchResultPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import ShopPage from '../pages/public/ShopPage';

// ── Customer pages (Private) ──────────────────────────────────────────────────
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import ProfilePage from '../pages/customer/ProfilePage';
import OrderHistoryPage from '../pages/customer/OrderHistoryPage';
import OrderDetailPage from '../pages/customer/OrderDetailPage';
import WishlistPage from '../pages/customer/WishlistPage';

// ── Seller pages (Role: ROLE_SELLER) ──────────────────────────────────────────
import SellerDashboard from '../pages/seller/SellerDashboard';
import ProductManagePage from '../pages/seller/ProductManagePage';
import AddProductPage from '../pages/seller/AddProductPage';
import EditProductPage from '../pages/seller/EditProductPage';
import OrderManagePage from '../pages/seller/OrderManagePage';
import SellerRevenueDashboard from '../pages/seller/SellerRevenueDashboard';
import VoucherManagePage from '../pages/seller/VoucherManagePage';
import ShopRegistrationPage from '../pages/seller/ShopRegistrationPage';

// ── Admin pages (Role: ROLE_ADMIN) ────────────────────────────────────────────
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagePage from '../pages/admin/UserManagePage';
import ShopManagePage from '../pages/admin/ShopManagePage';
import CategoryManagePage from '../pages/admin/CategoryManagePage';

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
      <Route path="/unauthorized" element={<div style={{ padding: 80, textAlign: 'center', fontSize: 20 }}>🚫 Bạn không có quyền truy cập trang này.</div>} />

      {/* 2. Customer Routes (đã đăng nhập) */}
      <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
      <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
      <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
      <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />

      {/* 3. Seller Routes (Cần đăng ký hoặc Role SELLER) */}
      <Route path="/seller/shop/register" element={<PrivateRoute><ShopRegistrationPage /></PrivateRoute>} />
      <Route path="/seller">
        <Route path="shop" element={<RoleRoute allowedRoles={['ROLE_SELLER', 'ROLE_ADMIN']}><SellerDashboard /></RoleRoute>} />
        <Route path="products" element={<RoleRoute allowedRoles={['ROLE_SELLER', 'ROLE_ADMIN']}><ProductManagePage /></RoleRoute>} />
        <Route path="products/add" element={<RoleRoute allowedRoles={['ROLE_SELLER', 'ROLE_ADMIN']}><AddProductPage /></RoleRoute>} />
        <Route path="products/edit/:id" element={<RoleRoute allowedRoles={['ROLE_SELLER', 'ROLE_ADMIN']}><EditProductPage /></RoleRoute>} />
        <Route path="orders" element={<RoleRoute allowedRoles={['ROLE_SELLER', 'ROLE_ADMIN']}><OrderManagePage /></RoleRoute>} />
        <Route path="vouchers" element={<RoleRoute allowedRoles={['ROLE_SELLER', 'ROLE_ADMIN']}><VoucherManagePage /></RoleRoute>} />
        <Route path="revenue" element={<RoleRoute allowedRoles={['ROLE_SELLER', 'ROLE_ADMIN']}><SellerRevenueDashboard /></RoleRoute>} />
        <Route path="categories" element={<RoleRoute allowedRoles={['ROLE_SELLER']}><CategoryManagePage /></RoleRoute>} />
      </Route>

      {/* 4. Admin Routes (Role: ROLE_ADMIN) */}
      <Route path="/admin">
        <Route index element={<RoleRoute allowedRoles={['ROLE_ADMIN']}><AdminDashboard /></RoleRoute>} />
        <Route path="users" element={<RoleRoute allowedRoles={['ROLE_ADMIN']}><UserManagePage /></RoleRoute>} />
        <Route path="shops" element={<RoleRoute allowedRoles={['ROLE_ADMIN']}><ShopManagePage /></RoleRoute>} />
        <Route path="products" element={<RoleRoute allowedRoles={['ROLE_ADMIN']}><ProductManagePage isAdminView={true} /></RoleRoute>} />
        <Route path="categories" element={<RoleRoute allowedRoles={['ROLE_ADMIN']}><CategoryManagePage /></RoleRoute>} />
      </Route>

      {/* 5. Fallback */}
      <Route path="*" element={<div style={{ padding: 80, textAlign: 'center', fontSize: 20 }}>404 — Trang không tồn tại (404)</div>} />
    </Routes>
  );
};

export default AppRouter;