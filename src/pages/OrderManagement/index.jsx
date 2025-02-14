import React, { useEffect, useState } from 'react';
import {
  Table, Space, Button, Input, Dropdown, Select, DatePicker, InputNumber, Spin,
  Modal,
  Form
} from 'antd';
import {
  DeleteOutlined, SearchOutlined, LoadingOutlined, DownloadOutlined,
  EyeOutlined, EditOutlined, CloseCircleOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
import jsPDF from 'jspdf';
import {
  deleteOrder,
  searchOrders,
  updateOrderStatus,
} from '../../services/orderService';
import { font_data } from '../../utils/roboto';
import debounce from 'lodash/debounce';
import moment from 'moment';
import { Bounce, toast, ToastContainer } from 'react-toastify';

const { RangePicker } = DatePicker;

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector((state) => state.orders);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState({
    status: null,
    minPrice: null,
    maxPrice: null,
    createdBefore: null,
    createdAfter: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { vnMode } = useOutletContext();
  const [form] = Form.useForm();
  const [visibleModal, setVisibleModal] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState({});

  useEffect(() => {
    fetchOrders();
  }, [dispatch, orderFilter, orderPage]);

  const debouncedSetOrderFilter = debounce((newOrderFilter) => {
    setOrderFilter(newOrderFilter);
  }, 300)

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      await dispatch(searchOrders({ ...orderFilter, page: orderPage - 1 })).unwrap().then(() => {
        toast.success(vnMode ? "Tải dữ liệu thành công" : "Successfully loaded data");
      })
    } catch {
      toast.error(vnMode ? "Tải dữ liệu thất bại" : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderChange = (pagination) => {
    setOrderPage(pagination.current);
  };

  const handleUpdateStatus = async (values) => {
    setIsLoading(true);
    try {
      await dispatch(updateOrderStatus({ orderId: selectedOrder.orderId, status: values.status })).unwrap();
      toast.success(vnMode ? "Cập nhật trạng thái đơn hàng thành công!" : "Order status updated successfully!");
      await fetchOrders();
      setVisibleModal(null);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    setIsLoading(true);
    try {
      await dispatch(deleteOrder(selectedOrder.orderId)).unwrap();
      toast.success(vnMode ? "Xóa đơn hàng thành công!" : "Order deleted successfully!");
      await fetchOrders();
      setVisibleModal(null);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMultipleOrders = async () => {
    setIsLoading(true);
    try {
      for (const orderId of selectedRowKeys) {
        await dispatch(deleteOrder(orderId)).unwrap();
      }
      toast.success(vnMode ? `Xóa ${selectedRowKeys.length} đơn hàng thành công!` : `Successfully deleted ${selectedRowKeys.length} orders!`);
      setSelectedRowKeys([]);
      await dispatch(searchOrders({ ...orderFilter, page: orderPage - 1 }));
      setVisibleModal(null);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMultipleOrderStatus = async (values) => {
    setIsLoading(true);
    try {
      for (const orderId of selectedRowKeys) {
        await dispatch(updateOrderStatus({ orderId, status: values.status })).unwrap();
      }
      toast.success(vnMode ? `Cập nhật trạng thái ${selectedRowKeys.length} đơn hàng thành công!` : `Updated status for ${selectedRowKeys.length} orders successfully!`);
      setSelectedRowKeys([]);
      await dispatch(searchOrders({ ...orderFilter, page: orderPage - 1 }));
      setVisibleModal(null);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const dropdownMenu = (record) => ({
    items: [
      {
        key: "1",
        label: (
          <div onClick={() => navigate(`/super-admin/order-details/${record.orderId}`)}>
            <EyeOutlined style={{ marginRight: 8 }} />
            {vnMode ? "Xem chi tiết" : "View details"}
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <div onClick={() => {
            setVisibleModal("updateStatus");
            setSelectedOrder(record);
            }}>
            <EditOutlined style={{ marginRight: 8 }} />
            {vnMode ? "Cập nhật trạng thái" : "Update status"}
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div onClick={() => {
            setVisibleModal("deleteOrder");
            setSelectedOrder(record);
          }}>
            <DeleteOutlined style={{ marginRight: 8, color: "red" }} />
            {vnMode ? "Xóa" : "Delete"}
          </div>
        ),
      },
    ]
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.addFileToVFS("Roboto-Regular.ttf", font_data);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    const tableData = (selectedRowKeys.length > 0 ? selectedRowKeys.map(key => orders.content.find(order => order.orderId === key)) : orders.content).map((order) => [
      order.orderId,
      new Date(order.createdAt).toLocaleDateString(),
      order.orderStatus,
      order.totalPrice,
    ]);

    doc.autoTable({
      head: [["Mã đơn hàng", "Ngày tạo", "Trạng thái", "Tổng tiền"]],
      body: tableData,
      styles: {
        font: "Roboto",
      },
    });

    doc.save("orders.pdf");
  };

  const handleClearFilter = () => {
    setOrderSearch('');
    setOrderFilter({
      status: null,
      minPrice: null,
      maxPrice: null,
      startTime: null,
      endTime: null,
    });
    setOrderPage(1);
  };

  const columns = [
    {
      title: vnMode ? 'Mã đơn hàng' : 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: vnMode ? 'Ngày' : 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: vnMode ? 'Trạng thái' : 'Status',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
    },
    {
      title: vnMode ? 'Tổng tiền' : 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: vnMode ? "Thao tác" : "Action",
      key: "operation",
      fixed: "right",
      render: (record) => (
        <Dropdown
          menu={dropdownMenu(record)}
          trigger={["click"]}
          overlayClassName="dropdown-custom"
        >
          <MoreOutlined style={{ cursor: "pointer", fontSize: 16 }} />
        </Dropdown>
      ),
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />

      <div>
        <div className="flex items-center mb-4">
          <Input
            placeholder={vnMode ? "Tìm kiếm theo mã đơn hàng" : "Search by order ID"}
            prefix={<SearchOutlined />}
            value={orderSearch}
            onChange={(e) => {
              setOrderSearch(e.target.value);
              debouncedSetOrderFilter({ ...orderFilter, keyword: e.target.value });
            }}
            className="mr-2 w-[30%]"
          />
          <Space>
            <Select
              placeholder={vnMode ? "Lọc theo trạng thái" : "Filter by status"}
              value={orderFilter.status}
              onChange={(value) => debouncedSetOrderFilter({ ...orderFilter, status: value })}
              allowClear
            >
              <Select.Option value="PENDING">{vnMode ? 'Chờ xử lý' : 'Pending'}</Select.Option>
              <Select.Option value="COMPLETED">{vnMode ? 'Hoàn thành' : 'Completed'}</Select.Option>
              <Select.Option value="FAILED">{vnMode ? 'Thất bại' : 'Failed'}</Select.Option>
            </Select>
            <InputNumber
              placeholder={vnMode ? "Giá tối thiểu" : "Min price"}
              prefix="₫"
              value={orderFilter.minPrice}
              onChange={(value) => debouncedSetOrderFilter({ ...orderFilter, minPrice: value })}
            />
            <InputNumber
              placeholder={vnMode ? "Giá tối đa" : "Max price"}
              prefix="₫"
              value={orderFilter.maxPrice}
              onChange={(value) => debouncedSetOrderFilter({ ...orderFilter, maxPrice: value })}
            />
            <RangePicker
              placeholder={vnMode ? ['Ngày bắt đầu', 'Ngày kết thúc'] : ['Start date', 'End date']}
              onChange={(dates, dateStrings) => {
                const formattedStartTime = dateStrings[0] ? moment(dateStrings[0]).format('YYYY-MM-DDTHH:mm:ss') : null;
                const formattedEndTime = dateStrings[1] ? moment(dateStrings[1]).format('YYYY-MM-DDTHH:mm:ss') : null;

                if (dates && dates[0] && dates[1] && dates[0].isAfter(dates[1])) {
                  setOrderFilter({
                    ...orderFilter,
                    createdAfter: formattedEndTime,
                    createdBefore: formattedStartTime,
                  });
                } else {
                  setOrderFilter({
                    ...orderFilter,
                    createdAfter: formattedStartTime,
                    createdBefore: formattedEndTime,
                  });
                }
              }}
            />
            <Button icon={<CloseCircleOutlined />} onClick={handleClearFilter}>
              {vnMode ? 'Xóa bộ lọc' : 'Clear filter'}
            </Button>
          </Space>
        </div>

        <div className="mb-4">
          <Space>
            <Button
              type="primary"
              danger
              onClick={handleDeleteMultipleOrders}
              disabled={selectedRowKeys.length === 0}
            >
              {vnMode ? 'Xóa nhiều đơn hàng' : 'Delete multiple orders'}
            </Button>
            <Button
              type="primary"
              onClick={handleUpdateMultipleOrderStatus}
              disabled={selectedRowKeys.length === 0}
            >
              {vnMode ? 'Cập nhật trạng thái' : 'Update status'}
            </Button>
            <Dropdown menu={{
              items: [
                {
                  key: '1',
                  label: vnMode ? 'Xuất tất cả' : 'Export all',
                  onClick: () => handleExportPDF()
                },
                {
                  key: '2',
                  label: vnMode ? 'Xuất các mục đã chọn' : 'Export selected items',
                  onClick: () => handleExportPDF(),
                  disabled: selectedRowKeys.length === 0
                }
              ]
            }}>
              <Button icon={<DownloadOutlined />}>
                {vnMode ? 'Xuất PDF' : 'Export PDF'}
              </Button>
            </Dropdown>
          </Space>
        </div>

        <Table
          rowKey="orderId"
          columns={columns}
          dataSource={orders.content}
          loading={loading === 'pending'}
          pagination={{
            current: orderPage,
            pageSize: 10,
            total: orders.totalElements,
            onChange: handleOrderChange,
          }}
          rowSelection={rowSelection}
        />
        <Modal
          title={vnMode ? "Cập nhật trạng thái đơn hàng" : "Update order status"}
          open={visibleModal === "updateStatus"}
          onCancel={() => setVisibleModal(null)}
          footer={null}
        >
          <Form form={form} initialValues={{ status: selectedOrder.orderStatus }} onFinish={handleUpdateStatus}>
            <Form.Item label={vnMode ? "Trạng thái" : "Status"} name="status">
              <Select>
                <Select.Option value="PENDING">{vnMode ? "Chờ xử lý" : "Pending"}</Select.Option>
                <Select.Option value="COMPLETED">{vnMode ? "Hoàn thành" : "Completed"}</Select.Option>
                <Select.Option value="FAILED">{vnMode ? "Thất bại" : "Failed"}</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button onClick={() => setVisibleModal(null)}>{vnMode ? "Hủy" : "Cancel"}</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {vnMode ? "Cập nhật" : "Update"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={vnMode ? "Xác nhận xóa" : "Confirm delete"}
          open={visibleModal === "deleteOrder"}
          onCancel={() => setVisibleModal(null)}
          onOk={handleDeleteOrder}
          okText={vnMode ? "Xóa" : "Delete"}
          cancelText={vnMode ? "Hủy" : "Cancel"}
          confirmLoading={loading}
        >
          <p>{vnMode ? "Bạn có chắc chắn muốn xóa đơn hàng này?" : "Are you sure you want to delete this order?"}</p>
        </Modal>

        <Modal
          title={vnMode ? "Xác nhận xóa" : "Confirm delete"}
          open={visibleModal === "deleteMultipleOrders"}
          onCancel={() => setVisibleModal(null)}
          onOk={handleDeleteMultipleOrders}
          okText={vnMode ? "Xóa" : "Delete"}
          cancelText={vnMode ? "Hủy" : "Cancel"}
          confirmLoading={loading}
        >
          <p>{vnMode ? `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} đơn hàng này?` : `Are you sure you want to delete these ${selectedRowKeys.length} orders?`}</p>
        </Modal>

        <Modal
          title={vnMode ? "Cập nhật trạng thái nhiều đơn hàng" : "Update multiple orders status"}
          open={visibleModal === "updateMultipleStatus"}
          onCancel={() => setVisibleModal(null)}
          footer={null}
        >
          <Form form={form} initialValues={{ status: "PENDING" }} onFinish={handleUpdateMultipleOrderStatus}>
            <Form.Item label={vnMode ? "Trạng thái" : "Status"} name="status">
              <Select>
                <Select.Option value="PENDING">{vnMode ? "Chờ xử lý" : "Pending"}</Select.Option>
                <Select.Option value="COMPLETED">{vnMode ? "Hoàn thành" : "Completed"}</Select.Option>
                <Select.Option value="FAILED">{vnMode ? "Thất bại" : "Failed"}</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button onClick={() => setVisibleModal(null)}>{vnMode ? "Hủy" : "Cancel"}</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {vnMode ? "Cập nhật" : "Update"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default OrderManagement;