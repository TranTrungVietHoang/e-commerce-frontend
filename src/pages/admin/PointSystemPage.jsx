import React from 'react';
import { Card, Result, Button } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const PointSystemPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <Card style={{ borderRadius: 12 }}>
        <Result
          icon={<ToolOutlined />}
          title="Hệ thống tích điểm đang được xây dựng"
          subTitle="Tính năng này sẽ sớm ra mắt để giúp người dùng tích lũy điểm khi mua hàng."
          extra={<Button type="primary" onClick={() => navigate('/admin')}>Quay lại Dashboard</Button>}
        />
      </Card>
    </div>
  );
};

export default PointSystemPage;
