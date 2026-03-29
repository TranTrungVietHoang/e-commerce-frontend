import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Empty, Input, InputNumber, List, Space, Table, Tag, Typography, message } from 'antd';
import useCart from '../../hooks/useCart';
import voucherService from '../../services/voucherService';

const { Title, Text } = Typography;

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const CartPage = () => {
  const { cart, updateCartItem, removeCartItem, clearCart, primaryShopId, hasMultipleShops } = useCart();
  const [voucherCode, setVoucherCode] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [voucherResult, setVoucherResult] = useState(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  useEffect(() => {
    setVoucherResult(null);
  }, [cart.subtotal, cart.totalItems]);

  useEffect(() => {
    if (!cart.items?.length || hasMultipleShops || !primaryShopId || !cart.subtotal) {
      setAvailableVouchers([]);
      return;
    }
    voucherService
      .getAvailableVouchers(primaryShopId, cart.subtotal)
      .then(setAvailableVouchers)
      .catch(() => setAvailableVouchers([]));
  }, [cart.items, cart.subtotal, primaryShopId, hasMultipleShops]);

  const finalAmount = useMemo(() => voucherResult?.finalAmount ?? cart.subtotal ?? 0, [voucherResult, cart.subtotal]);

  if (!cart.items?.length) {
    return <Empty description="Gio hang dang trong" style={{ marginTop: 80 }} />;
  }

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      message.warning('Nhap ma voucher truoc khi ap dung');
      return;
    }
    if (hasMultipleShops || !primaryShopId) {
      message.warning('Gio hang co nhieu shop, chua ho tro ap voucher cho nhieu shop cung luc');
      return;
    }
    setApplyingVoucher(true);
    try {
      const result = await voucherService.applyVoucher(voucherCode.trim(), cart.subtotal || 0, primaryShopId);
      setVoucherResult(result);
      message.success('Ap dung voucher thanh cong');
    } catch (error) {
      setVoucherResult(null);
      message.error(error.message || 'Khong ap dung duoc voucher');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const columns = [
    {
      title: 'San pham',
      dataIndex: 'productName',
      render: (_, record) => (
        <Space>
          <img src={record.imageUrl || 'https://via.placeholder.com/72'} alt={record.productName} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} />
          <div>
            <Text strong>{record.productName}</Text>
            <div><Text type="secondary">{record.shopName}</Text></div>
            {record.variantName && <div><Text type="secondary">{record.variantName}</Text></div>}
            {record.flashSaleActive && <Tag color="red">Flash sale den {new Date(record.flashSaleEndAt).toLocaleString()}</Tag>}
          </div>
        </Space>
      ),
    },
    {
      title: 'So luong',
      dataIndex: 'quantity',
      width: 160,
      render: (quantity, record) => (
        <InputNumber
          min={1}
          max={record.availableStock}
          style={{ width: '100%' }}
          value={quantity}
          onChange={(value) => {
            if (!value) return;
            updateCartItem(record.id, value);
          }}
        />
      ),
    },
    {
      title: 'Don gia',
      width: 180,
      render: (_, record) => (
        <div>
          <Text>{formatCurrency(record.unitPrice)}</Text>
          {record.flashSaleActive && record.basePrice !== record.unitPrice && (
            <div><Text delete type="secondary">{formatCurrency(record.basePrice)}</Text></div>
          )}
        </div>
      ),
    },
    {
      title: 'Thanh tien',
      dataIndex: 'lineTotal',
      width: 180,
      render: (value) => <Text strong>{formatCurrency(value)}</Text>,
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => <Button danger onClick={() => removeCartItem(record.id)}>Xoa</Button>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Gio hang</Title>
      <Space align="start" size={24} style={{ width: '100%' }}>
        <Card style={{ flex: 1 }}>
          {hasMultipleShops && (
            <Alert
              type="info"
              showIcon
              message="Gio hang dang co san pham tu nhieu shop"
              description="Voucher hien duoc toi uu cho tung shop. Hay tach don neu muon ap voucher chinh xac."
              style={{ marginBottom: 16 }}
            />
          )}
          <Table rowKey="id" columns={columns} dataSource={cart.items} pagination={false} />
        </Card>
        <Space direction="vertical" size={16} style={{ width: 360 }}>
          <Card>
            <Title level={4}>Voucher</Title>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Nhap ma voucher"
                disabled={hasMultipleShops}
              />
              <Button type="primary" loading={applyingVoucher} onClick={handleApplyVoucher} disabled={hasMultipleShops}>
                Ap dung
              </Button>
            </Space.Compact>
            <List
              size="small"
              style={{ marginTop: 16 }}
              locale={{ emptyText: hasMultipleShops ? 'Khong hien voucher khi gio hang co nhieu shop' : 'Khong co voucher phu hop' }}
              dataSource={availableVouchers}
              renderItem={(voucher) => (
                <List.Item actions={[<Button type="link" onClick={() => setVoucherCode(voucher.code)}>Chon</Button>]}>
                  <List.Item.Meta
                    title={`${voucher.code} - ${voucher.name}`}
                    description={`Toi thieu ${formatCurrency(voucher.minOrderValue || 0)} | Giam ${voucher.discountType === 'PERCENT' ? `${voucher.discountValue}%` : formatCurrency(voucher.discountValue)}`}
                  />
                </List.Item>
              )}
            />
          </Card>
          <Card>
            <Title level={4}>Tong ket</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>Tong san pham: {cart.totalItems}</Text>
              <Text>Tam tinh: {formatCurrency(cart.subtotal)}</Text>
              {voucherResult && <Text>Giam gia: -{formatCurrency(voucherResult.discountAmount)}</Text>}
              <Text strong style={{ fontSize: 18 }}>Thanh toan: {formatCurrency(finalAmount)}</Text>
              <Button danger onClick={() => clearCart()}>Xoa gio hang</Button>
            </Space>
          </Card>
        </Space>
      </Space>
    </div>
  );
};

export default CartPage;
