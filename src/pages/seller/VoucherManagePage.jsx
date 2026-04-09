import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import voucherService from '../../services/voucherService';

const { Title } = Typography;

const VoucherManagePage = () => {
  const [form] = Form.useForm();
  const [vouchers, setVouchers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const discountType = Form.useWatch('discountType', form) || 'PERCENT';

  const fetchVouchers = async () => {
    try {
      setVouchers(await voucherService.getSellerVouchers());
    } catch (error) {
      message.error(error.message || 'Khong the tai voucher');
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const resetModal = () => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const openCreateModal = () => {
    setEditing(null);
    form.setFieldsValue({
      discountType: 'PERCENT',
      active: true,
      minOrderValue: 0,
    });
    setOpen(true);
  };

  const normalizedPayload = useMemo(() => (values) => {
    let start = values.startAt;
    let end = values.endAt;
    if (start && start.length === 16) start += ':00';
    if (end && end.length === 16) end += ':00';
    
    return {
      ...values,
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      description: values.description?.trim() || '',
      discountType: values.discountType,
      startAt: start,
      endAt: end,
      maxDiscountValue: values.maxDiscountValue ?? null,
      usageLimit: values.usageLimit ?? null,
      minOrderValue: values.minOrderValue ?? 0,
      active: values.active ?? true,
    };
  }, []);

  const submit = async (values) => {
    setSubmitting(true);
    try {
      const payload = normalizedPayload(values);
      if (editing) {
        await voucherService.updateVoucher(editing.id, payload);
        message.success('Da cap nhat voucher');
      } else {
        await voucherService.createVoucher(payload);
        message.success('Da tao voucher');
      }
      resetModal();
      fetchVouchers();
    } catch (error) {
      message.error(error.message || 'Khong the luu voucher');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Quan ly voucher</Title>
        <Button type="primary" onClick={openCreateModal}>
          Tao voucher
        </Button>
      </Space>
      <Table
        rowKey="id"
        dataSource={vouchers}
        columns={[
          { title: 'Code', dataIndex: 'code' },
          { title: 'Ten', dataIndex: 'name' },
          { title: 'Loai', dataIndex: 'discountType', render: (value) => <Tag>{value}</Tag> },
          { title: 'Gia tri', dataIndex: 'discountValue', render: (value, record) => record.discountType === 'PERCENT' ? `${value}%` : value },
          { title: 'Da dung', render: (_, record) => `${record.usedCount}/${record.usageLimit || '∞'}` },
          { title: 'Thoi gian', render: (_, record) => `${dayjs(record.startAt).format('DD/MM HH:mm')} - ${dayjs(record.endAt).format('DD/MM HH:mm')}` },
          {
            title: 'Thao tac',
            render: (_, record) => (
              <Space>
                <Button onClick={() => {
                  setEditing(record);
                  form.setFieldsValue({
                    ...record,
                    startAt: record.startAt ? record.startAt.slice(0, 16) : null,
                    endAt: record.endAt ? record.endAt.slice(0, 16) : null,
                  });
                  setOpen(true);
                }}>
                  Sua
                </Button>
                <Popconfirm title="Xoa voucher?" onConfirm={() => voucherService.deleteVoucher(record.id).then(fetchVouchers)}>
                  <Button danger>Xoa</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        open={open}
        title={editing ? 'Cap nhat voucher' : 'Tao voucher'}
        onCancel={resetModal}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submit}
          initialValues={{ discountType: 'PERCENT', active: true, minOrderValue: 0 }}
        >
          <Form.Item
            name="code"
            label="Code"
            rules={[
              { required: true, message: 'Nhap ma voucher' },
              { pattern: /^[A-Za-z0-9_-]+$/, message: 'Code chi gom chu, so, gach ngang hoac gach duoi' },
            ]}
          >
            <Input placeholder="VD: SALE10" onChange={(e) => form.setFieldValue('code', e.target.value.toUpperCase())} />
          </Form.Item>
          <Form.Item name="name" label="Ten" rules={[{ required: true, message: 'Nhap ten voucher' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mo ta">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="discountType" label="Loai" rules={[{ required: true }]}>
            <Select options={[{ value: 'PERCENT', label: 'Phan tram' }, { value: 'FIXED', label: 'So tien co dinh' }]} />
          </Form.Item>
          <Form.Item
            name="discountValue"
            label={discountType === 'PERCENT' ? 'Gia tri giam (%)' : 'Gia tri giam'}
            rules={[
              { required: true, message: 'Nhap gia tri giam' },
              () => ({
                validator(_, value) {
                  if (value == null || value <= 0) {
                    return Promise.reject(new Error('Gia tri giam phai lon hon 0'));
                  }
                  if (discountType === 'PERCENT' && value > 100) {
                    return Promise.reject(new Error('Voucher phan tram khong duoc vuot qua 100'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber min={1} max={discountType === 'PERCENT' ? 100 : undefined} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="minOrderValue" label="Don toi thieu">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="maxDiscountValue"
            label="Giam toi da"
            tooltip="Khuyen nghi dung cho voucher phan tram"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="usageLimit" label="So luong">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="startAt" label="Bat dau" rules={[{ required: true, message: 'Chon thoi gian bat dau' }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item
            name="endAt"
            label="Ket thuc"
            dependencies={['startAt']}
            rules={[
              { required: true, message: 'Chon thoi gian ket thuc' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startAt = getFieldValue('startAt');
                  if (!startAt || !value) {
                    return Promise.resolve();
                  }
                  if (dayjs(value).isAfter(dayjs(startAt))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Thoi gian ket thuc phai sau thoi gian bat dau'));
                },
              }),
            ]}
          >
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="active" label="Kich hoat" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VoucherManagePage;
