import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Avatar, Badge, Button, Card, Input, Modal, Space, Table, Tag, Typography, message, Select,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, UserOutlined,
} from '@ant-design/icons';
import adminService from '../../services/adminService';

const { Title, Text } = Typography;

const roleColor = (role) => {
  if (role?.includes('ADMIN'))  return 'red';
  if (role?.includes('SELLER')) return 'blue';
  return 'green';
};

const UserManagePage = () => {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [keyword, setKeyword]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const debounceRef = useRef(null);

  const fetchUsers = useCallback(async (page = 1, kw = '', st = '') => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        keyword: kw || undefined,
        status: st || undefined,
        page: page - 1,
        size: pagination.pageSize,
      });
      
      // data = PageResponse { content, totalElements, totalPages, pageNumber }
      setUsers(data.content || data.items || []);
      setPagination(prev => ({ ...prev, current: page, total: data.totalElements || 0 }));
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err);
      message.error(err?.message || 'Không thể tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  // Load dữ liệu lần đầu khi component mount
  useEffect(() => { 
    fetchUsers();
  }, [fetchUsers]);

  // Debounce tìm kiếm 300ms
  const handleSearch = (value) => {
    setKeyword(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(1, value, statusFilter), 300);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(1, keyword, value), 300);
  };

  const handleToggleStatus = (record) => {
    const isActive = record.status === 'ACTIVE';
    const action   = isActive ? 'khóa' : 'mở khóa';
    Modal.confirm({
      title: `Xác nhận ${action} tài khoản`,
      content: (
        <span>
          Bạn muốn <strong>{action}</strong> tài khoản của{' '}
          <strong>{record.fullName}</strong> ({record.email})?
          {isActive && <><br /><Text type="danger">Người dùng sẽ bị đăng xuất ngay lập tức!</Text></>}
        </span>
      ),
      okText: action.charAt(0).toUpperCase() + action.slice(1),
      okType: isActive ? 'danger' : 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const newStatus = isActive ? 'LOCKED' : 'ACTIVE';
          await adminService.updateUserStatus(record.id, newStatus);
          message.success(`Đã ${action} tài khoản thành công!`);
          fetchUsers(pagination.current);
        } catch (err) {
          message.error(err?.message || `Không thể ${action} tài khoản`);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Người dùng', key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.avatarUrl}
            icon={!record.avatarUrl && <UserOutlined />}
            style={{ backgroundColor: '#1677ff' }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{record.fullName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'SĐT', dataIndex: 'phone', width: 130,
      render: (v) => v || <Text type="secondary">—</Text>,
    },
    {
      title: 'Vai trò', key: 'roles', width: 130,
      render: (_, record) => (record.roles || []).map(r => (
        <Tag key={r} color={roleColor(r)} style={{ marginBottom: 2 }}>
          {r.replace('ROLE_', '')}
        </Tag>
      )),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 120,
      render: (status) => (
        <Badge
          status={status === 'ACTIVE' ? 'success' : 'error'}
          text={<Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status}</Tag>}
        />
      ),
    },
    {
      title: 'Thao tác', key: 'action', width: 140,
      render: (_, record) => {
        const isActive = record.status === 'ACTIVE';
        const isAdmin  = record.roles?.some(r => r.includes('ADMIN'));
        return (
          <Button
            size="small"
            danger={isActive}
            type={isActive ? 'default' : 'primary'}
            disabled={isAdmin}
            title={isAdmin ? 'Không thể thay đổi tài khoản Admin' : ''}
            onClick={() => handleToggleStatus(record)}
          >
            {isActive ? 'Khóa' : 'Mở khóa'}
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>Quản lý người dùng</Title>
            <Text type="secondary">Tổng cộng {pagination.total} tài khoản</Text>
          </div>
          <Button icon={<ReloadOutlined />} onClick={() => fetchUsers(1)}>Làm mới</Button>
        </div>

        {/* Filters */}
        <Space style={{ marginBottom: 16, width: '100%' }} wrap>
          <Input.Search
            placeholder="Tìm theo tên hoặc email..."
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 320 }}
            value={keyword}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={(v) => fetchUsers(1, v, statusFilter)}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 200 }}
            value={statusFilter || undefined}
            onChange={handleStatusFilter}
            options={[
              { value: 'ACTIVE', label: 'Hoạt động' },
              { value: 'LOCKED', label: 'Bị khóa' },
            ]}
          />
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `${total} người dùng`,
            onChange: (page) => fetchUsers(page, keyword, statusFilter),
          }}
          style={{ borderRadius: 8, overflow: 'hidden' }}
        />
      </Card>
    </div>
  );
};

export default UserManagePage;
