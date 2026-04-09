import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Alert, Button, Card, Empty, Input, InputNumber, List, Space, Table, Tag, Typography, message, Modal, Select, Checkbox } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import voucherService from '../../services/voucherService';

const { Title, Text } = Typography;

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);


// ── ShopItemsSection (defined outside CartPage to prevent remount on every re-render) ──
const ShopItemsSection = React.memo(({ shopData, shopId, selectedItems, selectAllShopItems, columns }) => {
  const shopItemsSelected = shopData.items.filter(it => selectedItems[it.id]).length;
  const allShopItemsSelected = shopItemsSelected === shopData.items.length && shopData.items.length > 0;

  return (
    <Card
      style={{ marginBottom: 16 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Checkbox
            checked={allShopItemsSelected}
            indeterminate={shopItemsSelected > 0 && !allShopItemsSelected}
            onChange={() => selectAllShopItems(shopId)}
          />
          <Text strong style={{ fontSize: 16 }}>{shopData.shopName}</Text>
          <Tag color="blue">{shopItemsSelected}/{shopData.items.length} sản phẩm</Tag>
        </div>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={shopData.items}
        pagination={false}
        size="small"
      />
      {shopData.items.length > 1 && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Text>
            Tổng cộng: <Text strong>{formatCurrency(shopData.items.reduce((sum, item) => sum + item.lineTotal, 0))}</Text>
          </Text>
        </div>
      )}
    </Card>
  );
});
ShopItemsSection.displayName = 'ShopItemsSection';

const CartPage = () => {
  const { cart, updateCartItem, removeCartItem, clearCart, primaryShopId, hasMultipleShops, loading } = useCart();
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [vouchersByShop, setVouchersByShop] = useState({});
  const [selectedItems, setSelectedItems] = useState({});  // { itemId: true/false }
  const [quantityChanges, setQuantityChanges] = useState({}); // Track pending quantity changes

  // Nhóm sản phẩm theo shopId
  const groupedByShop = useMemo(() => {
    if (!cart.items?.length) return {};
    return cart.items.reduce((acc, item) => {
      const shopId = item.shopId || 0;
      if (!acc[shopId]) {
        acc[shopId] = { shopName: item.shopName || 'Unknown Shop', items: [] };
      }
      acc[shopId].items.push(item);
      return acc;
    }, {});
  }, [cart.items]);

  // Tính tổng tiền của shop được chọn
  const selectedShopTotal = useMemo(() => {
    if (!selectedShopId || !groupedByShop[selectedShopId]) return 0;
    return groupedByShop[selectedShopId].items.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [selectedShopId, groupedByShop]);

  // Tính tổng tiền toàn giỏ (với voucher nếu có) - chỉ tính những item được chọn
  const totalSummary = useMemo(() => {
    let totalSubtotal = 0;
    let totalDiscount = 0;

    Object.entries(groupedByShop).forEach(([shopId, shopData]) => {
      // Chỉ tính những item được chọn của shop này
      const shopSubtotal = shopData.items
        .filter(item => selectedItems[item.id])
        .reduce((sum, item) => sum + item.lineTotal, 0);
      totalSubtotal += shopSubtotal;

      // Chỉ áp voucher nếu có item được chọn của shop này
      if (shopSubtotal > 0 && vouchersByShop[shopId]) {
        totalDiscount += vouchersByShop[shopId].discountAmount || 0;
      }
    });

    return {
      subtotal: totalSubtotal,
      discount: totalDiscount,
      final: totalSubtotal - totalDiscount
    };
  }, [groupedByShop, vouchersByShop, selectedItems]);

  // Xử lý debounce khi thay đổi số lượng
  useEffect(() => {
    if (Object.keys(quantityChanges).length === 0) return;

    const timer = setTimeout(() => {
      Object.entries(quantityChanges).forEach(([itemId, qty]) => {
        updateCartItem(parseInt(itemId), qty);
      });
      setQuantityChanges({});
    }, 800); // Debounce 800ms

    return () => clearTimeout(timer);
  }, [quantityChanges, updateCartItem]);

  // Mặc định chọn shop đầu tiên - chỉ chạy 1 lần khi có shop
  useEffect(() => {
    const shopIds = Object.keys(groupedByShop);
    if (shopIds.length > 0 && !selectedShopId) {
      setSelectedShopId(parseInt(shopIds[0]));
    }
  }, [Object.keys(groupedByShop).length > 0 ? 'has-shops' : 'no-shops']); // Chỉ phụ thuộc vào có shop hay không

  // Mặc định chọn TẤT CẢ items khi giỏ hàng được tải lần đầu
  useEffect(() => {
    if (cart.items?.length > 0 && Object.keys(selectedItems).length === 0) {
      const init = {};
      cart.items.forEach(item => { init[item.id] = true; });
      setSelectedItems(init);
    }
  }, [cart.items?.length]);

  // Lấy voucher khả dụng cho shop được chọn - chỉ gọi khi shop thay đổi
  useEffect(() => {
    if (!cart.items?.length || !selectedShopId) {
      setAvailableVouchers([]);
      return;
    }
    const timer = setTimeout(() => {
      voucherService
        .getAvailableVouchers(selectedShopId, selectedShopTotal)
        .then(setAvailableVouchers)
        .catch(() => setAvailableVouchers([]));
    }, 500); // Debounce 500ms để tránh gọi API quá thường xuyên khi điều chỉnh giá

    return () => clearTimeout(timer);
  }, [selectedShopId]); // Bỏ selectedShopTotal khỏi dependency để tránh gọi lại khi thay đổi quantity


  // Toggle chon/bo chon 1 item
  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  }, []);

  // Khi nhấn vào item, tự động chọn shop đó
  const handleItemClick = useCallback((itemShopId) => {
    setSelectedShopId(itemShopId);
  }, []);

  const handleApplyVoucher = useCallback(async () => {
    if (!voucherCode.trim()) {
      message.warning('Nhap ma voucher truoc khi ap dung');
      return;
    }
    if (!selectedShopId) {
      message.warning('Vui long chon shop');
      return;
    }
    setApplyingVoucher(true);
    try {
      const result = await voucherService.applyVoucher(voucherCode.trim(), selectedShopTotal, selectedShopId);
      setVouchersByShop(prev => ({
        ...prev,
        [selectedShopId]: {
          code: voucherCode.trim(),
          ...result
        }
      }));
      setVoucherCode('');
      message.success('Ap dung voucher thanh cong cho shop nay');
    } catch (error) {
      message.error(error.message || 'Khong ap dung duoc voucher');
    } finally {
      setApplyingVoucher(false);
    }
  }, [voucherCode, selectedShopTotal, selectedShopId]);

  const handleRemoveVoucher = useCallback((shopId) => {
    setVouchersByShop(prev => {
      const updated = { ...prev };
      delete updated[shopId];
      return updated;
    });
    message.success('Xoa voucher thanh cong');
  }, []);

  // Chon tất cả items của 1 shop
  const selectAllShopItems = useCallback((shopId) => {
    setSelectedItems(prev => {
      if (!groupedByShop[shopId]) return prev;
      const shopItems = groupedByShop[shopId].items;
      const allSelected = shopItems.every(item => prev[item.id]);

      const updated = { ...prev };
      shopItems.forEach(item => {
        updated[item.id] = !allSelected;
      });
      return updated;
    });
  }, [groupedByShop]);

  const handleCheckout = useCallback(() => {
    if (!cart.items?.length) {
      message.warning('Gio hang trong, khong the thanh toan');
      return;
    }

    // Kiem tra co item nao duoc chon hay khong
    const hasSelectedItems = Object.values(selectedItems).some(v => v);
    if (!hasSelectedItems) {
      message.warning('Vui long chon it nhat 1 san pham de thanh toan');
      return;
    }

    // Lọc chỉ lấy các item đã chọn
    const selectedItemsForCheckout = cart.items.filter(item => selectedItems[item.id]);

    // Kiểm tra tính hợp lệ của các sản phẩm được chọn
    const invalidItems = selectedItemsForCheckout.filter(item => !item.active || !item.isStockSufficient);
    if (invalidItems.length > 0) {
      const firstInvalid = invalidItems[0];
      if (!firstInvalid.active) {
        message.error(`"${firstInvalid.productName}" hiện đã ngừng kinh doanh. Vui lòng xóa khỏi giỏ hàng.`);
      } else {
        message.error(`"${firstInvalid.productName}" đã hết hàng hoặc không đủ số lượng. Vui lòng điều chỉnh.`);
      }
      return;
    }

    if (hasMultipleShops) {
      Modal.confirm({
        title: 'Canh bao',
        content: 'Gio hang cua ban co san pham tu nhieu shop. Chung toi se tach don hang theo shop. Ban co muon tiep tuc?',
        okText: 'Tiep tuc',
        cancelText: 'Huy',
        onOk() {
          navigate('/checkout', { state: { vouchersByShop, selectedItemsForCheckout } });
        },
      });
    } else {
      navigate('/checkout', { state: { vouchersByShop, selectedItemsForCheckout } });
    }
  }, [cart.items, selectedItems, hasMultipleShops, vouchersByShop, navigate]);

  const columns = useMemo(() => [
    {
      title: 'Chon',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedItems[record.id] || false}
          onChange={() => toggleItemSelection(record.id)}
          disabled={!record.active}
        />
      ),
    },
    {
      title: 'San pham',
      dataIndex: 'productName',
      render: (_, record) => (
        <Space
          onClick={() => handleItemClick(record.shopId)}
          style={{ cursor: 'pointer' }}
        >
          <img src={record.imageUrl || 'https://via.placeholder.com/72'} alt={record.productName} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong style={{ color: record.active ? 'inherit' : '#999' }}>{record.productName}</Text>
              {!record.active && <Tag color="default">Ngừng kinh doanh</Tag>}
              {!record.isStockSufficient && record.active && <Tag color="orange">Hết hàng/Không đủ</Tag>}
            </div>
            {record.variantName && <div><Text type="secondary">{record.variantName}</Text></div>}
            {record.flashSaleActive && record.active && <Tag color="red">Flash sale den {new Date(record.flashSaleEndAt).toLocaleString()}</Tag>}
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
          value={quantityChanges[record.id] !== undefined ? quantityChanges[record.id] : quantity}
          onChange={(value) => {
            if (!value) return;
            setQuantityChanges(prev => ({
              ...prev,
              [record.id]: value
            }));
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
      width: 80,
      render: (_, record) => <Button danger icon={<DeleteOutlined />} onClick={() => removeCartItem(record.id)} />,
    },
  ], [selectedItems, toggleItemSelection, handleItemClick, removeCartItem, quantityChanges]);

  if (loading && !cart.items?.length) {
    return (
      <div style={{ padding: 24, textAlign: 'center', marginTop: 100 }}>
        <Title level={3}>DANG TAI GIO HANG...</Title>
      </div>
    );
  }

  if (!cart.items?.length) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Title level={2}>Giỏ hàng</Title>
        <Empty description="Giỏ hàng đang trống" style={{ marginTop: 80 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Gio hang</Title>
      <Space align="start" size={24} style={{ width: '100%' }}>
        <Card style={{ flex: 1 }}>
          {hasMultipleShops && (
            <Alert
              type="info"
              showIcon
              message="Gio hang co san pham tu nhieu shop"
              description="Hay chon shop ben phai de ap voucher. Cac don hang se tach theo shop khi thanh toan."
              style={{ marginBottom: 16 }}
            />
          )}

          <div>
            {Object.entries(groupedByShop).map(([shopId, shopData]) => (
              <ShopItemsSection
                key={shopId}
                shopId={parseInt(shopId)}
                shopData={shopData}
                selectedItems={selectedItems}
                selectAllShopItems={selectAllShopItems}
                columns={columns}
              />
            ))}
          </div>
        </Card>
        <Space direction="vertical" size={16} style={{ width: 380 }}>
          <Card>
            <Title level={4}>Voucher</Title>
            {selectedShopId && (
              <>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Nhap ma voucher"
                  />
                  <Button type="primary" loading={applyingVoucher} onClick={handleApplyVoucher}>
                    Ap dung
                  </Button>
                </Space.Compact>

                {vouchersByShop[selectedShopId] && (
                  <div style={{ marginTop: 12, padding: 8, backgroundColor: '#f0f5ff', borderRadius: 4 }}>
                    <Text type="success">
                      {vouchersByShop[selectedShopId].code} - Giam {formatCurrency(vouchersByShop[selectedShopId].discountAmount || 0)}
                    </Text>
                    <Button
                      danger
                      size="small"
                      style={{ float: 'right' }}
                      onClick={() => handleRemoveVoucher(selectedShopId)}
                    >
                      Xoa
                    </Button>
                  </div>
                )}

                <List
                  size="small"
                  style={{ marginTop: 16 }}
                  locale={{ emptyText: 'Khong co voucher phu hop' }}
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
              </>
            )}
          </Card>

          <Card>
            <Title level={4}>Tong ket</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>Tong san pham: {cart.totalItems}</Text>
              <Text>Tam tinh: {formatCurrency(totalSummary.subtotal)}</Text>
              {totalSummary.discount > 0 && (
                <Text type="success">Giam gia: -{formatCurrency(totalSummary.discount)}</Text>
              )}
              <Text strong style={{ fontSize: 18, color: '#1890ff' }}>Thanh toan: {formatCurrency(totalSummary.final)}</Text>
              <Button type="primary" size="large" block onClick={handleCheckout}>
                Tien hanh thanh toan
              </Button>
              <Button danger block onClick={() => clearCart()}>
                Xoa gio hang
              </Button>
            </Space>
          </Card>
        </Space>
      </Space>
    </div>
  );
};

export default CartPage;
