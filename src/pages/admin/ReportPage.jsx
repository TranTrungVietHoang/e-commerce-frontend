import React from 'react';
import { Card, Result, Button, Space, DatePicker, Select } from 'antd';
import { BarChartOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const ReportPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title={<><BarChartOutlined /> Báo cáo & Thống kê hệ thống</>} style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 24 }}>
          <RangePicker />
          <Select defaultValue="revenue" style={{ width: 200 }}>
            <Select.Option value="revenue">Doanh thu tổng</Select.Option>
            <Select.Option value="order">Số lượng đơn hàng</Select.Option>
            <Select.Option value="user">Tăng trưởng người dùng</Select.Option>
          </Select>
          <Button icon={<DownloadOutlined />}>Xuất Excel</Button>
          <Button icon={<PrinterOutlined />}>In báo cáo</Button>
        </Space>
        <Result
          status="info"
          title="Tính năng báo cáo đang được hoàn thiện"
          subTitle="Hệ thống đang tổng hợp dữ liệu thời thực để cung cấp cái nhìn chi tiết nhất về hoạt động kinh doanh."
        />
      </Card>
    </div>
  );
};

export default ReportPage;
