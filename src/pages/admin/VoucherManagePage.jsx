import React from 'react';
import { Card, Typography, Empty, Space, Button } from 'antd';
import { GiftOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const VoucherManagePage = () => {
  const { isAdmin, isSeller } = useAuth();
  
  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3}>{isAdmin ? 'Quản lý toàn bộ Voucher' : 'Voucher của Shop'}</Title>
            <Text type="secondary">
              {isAdmin 
                ? 'Theo dõi và quản lý tất cả các chương trình khuyến mãi trên toàn sàn.' 
                : 'Tạo mã giảm giá riêng để thu hút khách hàng đến với shop của bạn.'
              }
            </Text>
          </div>
          {isSeller && <Button type="primary" icon={<PlusOutlined />}>Tạo Voucher mới</Button>}
        </div>
        <Empty 
          image={<GiftOutlined style={{ fontSize: 64, color: '#f0f0f0' }} />}
          description="Chưa có dữ liệu Voucher" 
        />
      </Card>
    </div>
  );
};

export default VoucherManagePage;
