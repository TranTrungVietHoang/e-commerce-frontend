import React from 'react';
import { Card, Table, Tag, Button, Space, Typography, Spin } from 'antd';
import { SafetyCertificateOutlined, EyeOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ProductModerationPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={<><SafetyCertificateOutlined /> Phê duyệt sản phẩm mới</>}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <Result
          status="info"
          title="Tính năng kiểm duyệt sản phẩm"
          subTitle="Nơi quản trị viên kiểm tra và phê duyệt các sản phẩm mới từ nhà bán hàng trước khi đăng sàn."
          extra={<Button type="primary">Xem danh sách chờ duyệt</Button>}
        />
        <Table locale={{ emptyText: 'Hiện không có sản phẩm nào cần phê duyệt.' }} />
      </Card>
    </div>
  );
};

import { Result } from 'antd';
export default ProductModerationPage;
