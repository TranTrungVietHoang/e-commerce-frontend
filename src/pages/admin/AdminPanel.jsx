import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar'; // Giả sử bạn có Sidebar

const { Content, Sider } = Layout;

const AdminPanel = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        {/* Menu điều hướng của Admin nằm ở đây */}
        <AdminSidebar /> 
      </Sider>
      <Layout>
        <Content style={{ padding: '24px' }}>
          {/* CỰC KỲ QUAN TRỌNG: 
              Nơi đây sẽ hiển thị CategoryPage khi bạn vào /admin/categories */}
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPanel;