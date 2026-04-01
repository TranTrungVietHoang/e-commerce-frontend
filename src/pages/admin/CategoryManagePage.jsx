import React from 'react';
import { Card, Typography, Empty, Space, Tag, Table } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const CategoryManagePage = () => {
  const { isAdmin, isSeller } = useAuth();
  
  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Title level={3}>{isAdmin ? 'Quản lý danh mục sàn' : 'Danh mục shop'}</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">
            {isAdmin 
              ? 'Quản trị viên có thể tạo, sửa, xóa các danh mục chính cho toàn bộ hệ thống.' 
              : 'Người bán có thể xem danh mục đã đăng ký và danh mục sản phẩm của cửa hàng.'
            }
          </Text>
          <Empty description="Tính năng danh mục đang được hoàn thiện..." />
        </Space>
      </Card>
    </div>
  );
};

export default CategoryManagePage;
