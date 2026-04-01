import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title } = Typography;

const ShopManagePage = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Title level={3}>Quản lý cửa hàng</Title>
        <Empty description="Tính năng quản lý cửa hàng đang được cập nhật..." />
      </Card>
    </div>
  );
};

export default ShopManagePage;
