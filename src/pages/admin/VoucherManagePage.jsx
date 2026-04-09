import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Button, Space, message, Modal, Descriptions } from 'antd';
import { GiftOutlined, EyeOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';

const { Title, Text } = Typography;

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const AdminVoucherManagePage = () => {
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [isDetailVisible, setIsDetailVisible] = useState(false);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const response = await adminService.getVouchers();
            const data = response?.result || response;
            if (Array.isArray(data)) {
                setVouchers(data);
            } else {
                setVouchers([]);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách Voucher: ' + (error.message || 'Lỗi hệ thống'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const columns = [
        {
            title: 'Mã Code',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>{text}</Tag>,
        },
        {
            title: 'Tên Voucher',
            dataIndex: 'name',
            key: 'name',
            strong: true,
        },
        {
            title: 'Loại giảm giá',
            dataIndex: 'discountType',
            key: 'discountType',
            render: (type) => (
                <Tag color={type === 'PERCENTAGE' ? 'orange' : 'green'}>
                    {type === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định'}
                </Tag>
            ),
        },
        {
            title: 'Giá trị',
            key: 'value',
            render: (_, record) => (
                <Text strong>
                    {record.discountType === 'PERCENTAGE' 
                      ? `${record.discountValue}% (Tối đa ${money(record.maxDiscountValue)})` 
                      : money(record.discountValue)
                    }
                </Text>
            ),
        },
        {
            title: 'Lượt dùng',
            key: 'usage',
            render: (_, record) => (
                <Text>{record.usedCount} / {record.usageLimit || '∞'}</Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Tag color={active ? 'success' : 'default'}>
                    {active ? 'Đang hoạt động' : 'Đã tạm ngưng'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button 
                    type="link" 
                    icon={<EyeOutlined />} 
                    onClick={() => { setSelectedVoucher(record); setIsDetailVisible(true); }}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: 24 }}>
                    <Title level={3}><GiftOutlined /> Quản lý Voucher hệ thống</Title>
                    <Text type="secondary">
                        Xem và theo dõi tất cả mã giảm giá đang hoạt động trên toàn sàn thương mại điện tử.
                    </Text>
                </div>

                <Table 
                    columns={columns} 
                    dataSource={vouchers} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Chi tiết Voucher"
                open={isDetailVisible}
                onCancel={() => setIsDetailVisible(false)}
                footer={[<Button key="close" onClick={() => setIsDetailVisible(false)}>Đóng</Button>]}
                width={600}
            >
                {selectedVoucher && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Mã Voucher">{selectedVoucher.code}</Descriptions.Item>
                        <Descriptions.Item label="Tên chương trình">{selectedVoucher.name}</Descriptions.Item>
                        <Descriptions.Item label="Mô tả">{selectedVoucher.description || 'Chưa có mô tả'}</Descriptions.Item>
                        <Descriptions.Item label="Loại giảm">{selectedVoucher.discountType}</Descriptions.Item>
                        <Descriptions.Item label="Giá trị giảm">
                            {selectedVoucher.discountType === 'PERCENTAGE' 
                              ? `${selectedVoucher.discountValue}%` 
                              : money(selectedVoucher.discountValue)
                            }
                        </Descriptions.Item>
                        <Descriptions.Item label="Giảm tối đa">{money(selectedVoucher.maxDiscountValue)}</Descriptions.Item>
                        <Descriptions.Item label="Đơn tối thiểu">{money(selectedVoucher.minOrderValue)}</Descriptions.Item>
                        <Descriptions.Item label="Lượt sử dụng">{selectedVoucher.usedCount} / {selectedVoucher.usageLimit || 'Không giới hạn'}</Descriptions.Item>
                        <Descriptions.Item label="Thời gian">
                            {new Date(selectedVoucher.startAt).toLocaleString('vi-VN')} - {new Date(selectedVoucher.endAt).toLocaleString('vi-VN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="ID Gian hàng">{selectedVoucher.shopId || 'Hệ thống'}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default AdminVoucherManagePage;
