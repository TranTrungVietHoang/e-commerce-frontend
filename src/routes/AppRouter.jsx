import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

// Import Pages
import Home from '../pages/Home';
import Login from '../pages/Auth/LoginPage';
import Register from '../pages/Auth/RegisterPage'; // Giả sử bạn đã tạo
import Profile from '../pages/Profile';
import CategoryPage from '../pages/Admin/CategoryPage'; // Trang quản lý danh mục
import AdminPanel from '../pages/Admin/AdminPanel';
import SellerDashboard from '../pages/Seller/SellerDashboard';

const AppRouter = () => {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 2. User Routes (Cần đăng nhập) */}
      <Route path="/profile" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />

      {/* 3. Seller Routes */}
      <Route path="/seller" element={
        <RoleRoute allowedRoles={['ROLE_SELLER']}>
          <SellerDashboard />
        </RoleRoute>
      }>
        {/* Ví dụ route con cho Seller: /seller/products */}
        {/* <Route path="products" element={<SellerProducts />} /> */}
      </Route>

      {/* 4. Admin Routes - Quan trọng: Bỏ dấu * và dùng Nested Routes */}
      <Route path="/admin" element={
        <RoleRoute allowedRoles={['ROLE_ADMIN']}>
          <AdminPanel />
        </RoleRoute>
      }>
        {/* Trang mặc định khi vào /admin */}
        <Route index element={<div>Chào mừng Admin!</div>} />
        
        {/* Đường dẫn: /admin/categories */}
        <Route path="categories" element={<CategoryPage />} />
        
        {/* Đường dẫn: /admin/users */}
        {/* <Route path="users" element={<AdminUserList />} /> */}
      </Route>

      {/* 5. Error Routes */}
      <Route path="/unauthorized" element={<div>Bạn không có quyền truy cập trang này!</div>} />
      <Route path="*" element={<div>Trang không tồn tại (404)</div>} />
    </Routes>
  );
};

export default AppRouter;