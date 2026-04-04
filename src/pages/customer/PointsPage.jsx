import React from 'react';
import { Card, Result, Button, Space, Typography, Tag, List } from 'antd';
import { GiftOutlined, HistoryOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const PointsPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Card 
        title={<><GiftOutlined /> Ví xu của tôi</>} 
        style={{ borderRadius: 12, textAlign: 'center', marginBottom: 24 }}
      >
        <Space direction="vertical" align="center">
          <Text type="secondary">Số xu hiện có</Text>
          <Title level={1} style={{ margin: '0 0 24px', color: '#faad14' }}>0 Xu</Title>
          <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => navigate('/')}>Mua sắm để tích thêm xu</Button>
        </Space>
      </Card>

      <Card title={<><HistoryOutlined /> Lịch sử sử dụng xu</>} style={{ borderRadius: 12 }}>
        <List
          locale={{ emptyText: 'Bạn chưa có giao dịch tích xu nào.' }}
          dataSource={[]}
          renderItem={item => <List.Item>...</List.Item>}
        />
      </Card>
    </div>
  );
};

export default PointsPage;
