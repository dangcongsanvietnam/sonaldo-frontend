import React, { useEffect, useState } from 'react';
import { Layout, Card, Tabs, List, Avatar, Space, Modal, Button, Form, Input, Collapse, Table, Dropdown, Tag, DatePicker, InputNumber, Pagination, Tooltip, Select } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, FilterOutlined, LeftOutlined, MoreOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUserAddress, GetUser, updateUser } from '../../services/userService';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import moment from 'moment';
import { deleteOrder, updateOrderStatus } from '../../services/orderService';
import { deleteQuestion, updateQuestionState } from '../../services/questionService';
import { deleteReview } from '../../services/reviewService';
import dayjs from 'dayjs';
import { Bounce, toast, ToastContainer } from 'react-toastify';

const { Content } = Layout;
const { RangePicker } = DatePicker;

const DetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userDetail = useSelector((state) => state.user.userInfo);
  const { email } = useParams();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [deleteReviewModalVisible, setDeleteReviewModalVisible] = useState(false);
  const [deleteQuestionModalVisible, setDeleteQuestionModalVisible] = useState(false);
  const [updateQuestionStateModalVisible, setUpdateQuestionStateModalVisible] = useState(false);
  const [currentQuestionState, setCurrentQuestionState] = useState(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [changelogPage, setChangelogPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [questionPage, setQuestionPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [birthday, setBirthday] = useState(userDetail.birthday ? userDetail.birthday : null);
  const [orderFilter, setOrderFilter] = useState({
    date: null,
    total: null,
    status: null,
  });
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [formValues, setFormValues] = useState({
    firstName: userDetail?.firstName,
    lastName: userDetail?.lastName,
    phoneNumber: userDetail?.phoneNumber,
    role: userDetail.role,
    status: userDetail.status,
  });
  const [reviewFilter, setReviewFilter] = useState({
    startTime: null,
    endTime: null,
    rating: null,
  });
  const [questionFilter, setQuestionFilter] = useState({
    startTime: null,
    endTime: null,
  });
  const { vnMode } = useOutletContext();
  const [loadingUpdateButton, setLoadingUpdateButton] = useState(false);
  const [loadingDeleteAddressButton, setloadingDeleteAddressButton] = useState(false);
  const [loadingDeleteReviewButton, setLoadingDeleteReviewButton] = useState(false);
  const [loadingDeleteQuestionButton, setLoadingDeleteQuestionButton] = useState(false);
  const [loadingUpdateQuestionStateButton, setLoadingUpdateQuestionStateButton] = useState(false);

  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updateForm] = Form.useForm();
  const [loadingUpdateOrderButton, setLoadingUpdateOrderButton] = useState(false);
  const [loadingDeleteOrderButton, setLoadingDeleteOrderButton] = useState(false);

  useEffect(() => {
    dispatch(GetUser(email)).unwrap().then((res) => {
      setFormValues(res.data);
      setBirthday(res.data?.birthday)
    })
  }, [dispatch, email]);

  const toggleEdit = () => {
    setEditing(!editing);
  };

  const handleUpdateStatus = (record) => {
    setSelectedRecord(record);
    updateForm.setFieldsValue({ status: record.orderStatus });
    setUpdateModalVisible(true);
  };

  const handleFilterReviews = (reviews) => {
    return reviews.filter((review) => {
      const createdAt = moment(review.createdAt);
      const matchStartTime = !reviewFilter.startTime || createdAt.isSameOrAfter(moment(reviewFilter.startTime), 'day');
      const matchEndTime = !reviewFilter.endTime || createdAt.isSameOrBefore(moment(reviewFilter.endTime), 'day');
      const matchRating = !reviewFilter.rating || review.voting === reviewFilter.rating;
      return matchStartTime && matchEndTime && matchRating;
    });
  };

  const handleFilterQuestions = (questions) => {
    return questions.filter((question) => {
      const createdAt = moment(question.createdAt);
      const matchStartTime = !questionFilter.startTime || createdAt.isSameOrAfter(moment(questionFilter.startTime), 'day');
      const matchEndTime = !questionFilter.endTime || createdAt.isSameOrBefore(moment(questionFilter.endTime), 'day');
      return matchStartTime && matchEndTime;
    });
  };

  const handleOrderChange = (pagination) => {
    setOrderPage(pagination.current);
  };

  const handleConfirmUpdate = async (values) => {
    setLoadingUpdateOrderButton(true);
    try {
      await dispatch(updateOrderStatus({ orderId: selectedRecord.orderId, status: values.status })).unwrap();
      toast.success(vnMode ? 'Cập nhật trạng thái đơn hàng thành công!' : 'Update order state successfully!');
      await dispatch(GetUser(email));
    } catch (error) {
      toast.error(vnMode ? 'Cập nhật trạng thái đơn hàng thất bại!' : 'Update order state failed!');
    } finally {
      setLoadingUpdateOrderButton(false);
      setUpdateModalVisible(false);
      setSelectedRecord(null);
    }
  };

  const handleDeleteOrder = (record) => {
    setSelectedRecord(record);
    setDeleteModalVisible(true);
  };
  const handleConfirmDelete = async () => {
    setLoadingDeleteOrderButton(true);
    try {
      await dispatch(deleteOrder(selectedRecord.orderId)).unwrap();
      toast.success(vnMode ? 'Xóa đơn hàng thành công!' : 'Delete order successfully!');
      await dispatch(GetUser(email));
    } catch (error) {
      toast.error(vnMode ? 'Xóa đơn hàng thất bại!' : 'Delete order failed!');
    } finally {
      setLoadingDeleteOrderButton(false);
      setDeleteModalVisible(false);
      setSelectedRecord(null);

    }
  };

  const handleConfirmUpdateUser = async () => {
    setLoadingUpdateButton(true);
    try {
      const formattedValues = {
        ...formValues,
        birthday: dayjs(birthday).format('YYYY-MM-DDTHH:mm:ss.SSS') || null,
      };
      await dispatch(updateUser({ email, updateValue: formattedValues })).unwrap();
      toast.success(vnMode ? 'Cập nhật thông tin người dùng thành công!' : 'Update user information successfully!');
      setEditing(false);
      await dispatch(GetUser(email));
    } catch (error) {
      toast.error(vnMode ? 'Lỗi khi cập nhật thông tin người dùng' : 'Failed to update user');
    } finally {
      setLoadingUpdateButton(false);
    }
  };

  const handleDeleteAddress = (addressId) => {
    setSelectedAddressId(addressId);
    setConfirmDeleteModalVisible(true);
  };

  const handleConfirmDeleteAddress = async () => {
    setConfirmDeleteModalVisible(false);
    setloadingDeleteAddressButton(true);
    try {
      await dispatch(deleteUserAddress({ email, addressId: selectedAddressId })).unwrap();
      toast.success(vnMode ? 'Xóa địa chỉ thành công!' : 'Delete address successfully!'
      );
      await dispatch(GetUser(email));
    } catch (error) {
      toast.error(vnMode ? 'Xóa địa chỉ thất bại!' : 'Delete address failed!');
    } finally {
      setloadingDeleteAddressButton(false);
    }
  };

  const handleCancelDeleteAddress = () => {
    setConfirmDeleteModalVisible(false);
  };

  const handleDeleteReview = (reviewId) => {
    setCurrentReviewId(reviewId);
    setDeleteReviewModalVisible(true);
  };

  const handleConfirmDeleteReview = async () => {
    setLoadingDeleteReviewButton(true);
    try {
      const productId = userDetail.orders[0]?.cartItems[0]?.productId;
      await dispatch(deleteReview({ reviewId: currentReviewId, productId })).unwrap();
      toast.success(vnMode ? 'Xóa đánh giá thành công!' : 'Delete review successfully!');
      await dispatch(GetUser(email));
    } catch (error) {
      toast.error(vnMode ? 'Xóa đánh giá thất bại!' : 'Delete review failed!');
    } finally {
      setLoadingDeleteReviewButton(false);
      setDeleteReviewModalVisible(false);
      setCurrentReviewId(null);
    }
  };

  const handleCancelDeleteReview = () => {
    setDeleteReviewModalVisible(false);
    setCurrentReviewId(null);
  };



  const handleDeleteQuestion = (questionId) => {
    setCurrentQuestionId(questionId)
    setDeleteQuestionModalVisible(true);
  };

  const handleConfirmDeleteQuestion = async () => {
    setLoadingDeleteQuestionButton(true);
    try {
      const productId = userDetail.orders[0]?.cartItems[0]?.productId;
      await dispatch(deleteQuestion({ questionId: currentQuestionId, productId })).unwrap();
      toast.success(vnMode ? 'Xóa câu hỏi thành công!' : 'Delete question successfully!');
      await dispatch(GetUser(email));
    } catch (error) {
      toast.error(vnMode ? 'Xóa câu hỏi thất bại!' : 'Delete question failed!');
    } finally {
      setLoadingDeleteQuestionButton(false);
      setDeleteQuestionModalVisible(false);
      setCurrentQuestionId(null);
    }
  };

  const handleCancelDeleteQuestion = () => {
    setDeleteQuestionModalVisible(false);
    setCurrentQuestionId(null);
  };


  const handleUpdateQuestionState = (questionId, currentState) => {
    setCurrentQuestionId(questionId);
    setCurrentQuestionState(currentState);
    setUpdateQuestionStateModalVisible(true);
  };

  const handleConfirmUpdateQuestionState = async () => {
    setLoadingUpdateQuestionStateButton(true);
    try {
      const productId = userDetail.orders[0]?.cartItems[0]?.productId;
      await dispatch(updateQuestionState({ questionId: currentQuestionId, productId, state: !currentQuestionState })).unwrap();
      toast.success(vnMode ? 'Cập nhật trạng thái câu hỏi thành công!' : 'Update question state successfully!');
      await dispatch(GetUser(email));
    } catch (error) {
      toast.error(vnMode ? 'Cập nhật trạng thái câu hỏi thất bại!' : 'Update question state failed!');
    } finally {
      setLoadingUpdateQuestionStateButton(false);
      setUpdateQuestionStateModalVisible(false);
      setCurrentQuestionId(null);
      setCurrentQuestionState(null);
    }
  };

  const handleCancelUpdateQuestionState = () => {
    setUpdateQuestionStateModalVisible(false);
    setCurrentQuestionId(null);
    setCurrentQuestionState(null);
  }

  const renderDropdownMenu = (record) => ({
    items: [
      {
        label: (
          <div onClick={(e) => {
            navigate(`/orders/${record.orderId}`);
          }}>
            <EyeOutlined style={{ marginRight: 8 }} />
            {vnMode ? "Xem chi tiết" : "Detail"}
          </div>
        ),
        key: "2",
      },
      {
        label: (
          <div onClick={() => handleUpdateStatus(record)}>
            <EditOutlined style={{ marginRight: 8 }} />
            {vnMode ? "Cập nhật trạng thái" : "Update status"}
          </div>
        ),
        key: "3",
      },
      {
        label: (
          <div onClick={() => handleDeleteOrder(record)}>
            <DeleteOutlined style={{ marginRight: 8, color: "red" }} />
            {vnMode ? "Xóa" : "Delete"}
          </div>
        ),
        key: "1",
      },
    ],
  });

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
      render: (date) => new Date(date).toLocaleDateString(),
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
          menu={renderDropdownMenu(record)}
          trigger={["click"]}
          overlayClassName="dropdown-custom"
        >
          <MoreOutlined style={{ cursor: "pointer", fontSize: 16 }} />
        </Dropdown>
      ),
    }
  ];

  const filteredOrders = userDetail.orders
    ? userDetail.orders.filter((order) => {
      const matchSearch = order.orderId.toLowerCase().includes(orderSearch.toLowerCase());
      const matchDate = !orderFilter.date || new Date(order.createdAt).toLocaleDateString() === orderFilter.date;
      const matchTotal = !orderFilter.total || order.totalPrice === parseFloat(orderFilter.total);
      const matchStatus = !orderFilter.status || order.orderStatus === orderFilter.status;
      return matchSearch && matchDate && matchTotal && matchStatus;
    })
    : [];


  const orderStatusItems = [
    {
      key: "PENDING",
      label: vnMode ? 'Chờ xử lý' : 'Pending',
      onClick: () => setOrderFilter({ ...orderFilter, status: "PENDING" }),
    },
    {
      key: "COMPLETED",
      label: vnMode ? 'Hoàn thành' : 'Completed',
      onClick: () => setOrderFilter({ ...orderFilter, status: "COMPLETED" }),
    },
    {
      key: "FAILED",
      label: vnMode ? 'Thất bại' : 'Failed',
      onClick: () => setOrderFilter({ ...orderFilter, status: "FAILED" }),
    },
  ];

  const tabItems = [
    {
      key: "1",
      label: vnMode ? 'Đơn hàng' : 'Order',
      children: (
        <div>
          <div className="flex items-center mb-4">
            <Input
              placeholder={vnMode ? 'Tìm kiếm theo mã đơn hàng' : 'Search by Order ID'}
              prefix={<SearchOutlined />}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="mr-2 w-[30%]"
            />
            <Space>
              <Dropdown menu={{ items: orderStatusItems }} overlayClassName="submenu">
                <Button>
                  <FilterOutlined /> {vnMode ? 'Lọc theo trạng thái' : 'Filter by Status'}
                </Button>
              </Dropdown>
              <DatePicker placeholder={vnMode ? 'Chọn ngày' : 'Select Date'} onChange={(date, dateString) => setOrderFilter({ ...orderFilter, date: dateString })} />
              <InputNumber
                placeholder={vnMode ? 'Lọc theo tổng tiền' : 'Filter by Total'}
                prefix="$"
                className='w-[100%]'
                onChange={(value) => setOrderFilter({ ...orderFilter, total: value })}
              />
            </Space>
          </div>
          <Table
            scroll={{ x: true }}
            columns={columns}
            dataSource={filteredOrders.slice((orderPage - 1) * 5, orderPage * 5)}
            onChange={handleOrderChange}
            pagination={{
              pageSize: 5,
              total: filteredOrders.length,
              current: orderPage,
            }}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: vnMode ? 'Nhật ký thay đổi' : 'Changelog',
      children: (
        <div>
          <List
            itemLayout="vertical"
            dataSource={userDetail.userLogs?.slice((changelogPage - 1) * 5, changelogPage * 5)}
            renderItem={(item) => (
              <List.Item key={item.eventId}>
                <Card>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.email}
                    description={
                      <div>
                        <span>{item.eventType} - {item.details}</span>
                        <br />
                        <span className="text-gray-500 text-sm">
                          {new Date(item.timestamp).toLocaleDateString()} - {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
          <Pagination
            current={changelogPage}
            pageSize={5}
            total={userDetail.userLogs?.length}
            onChange={setChangelogPage}
            className="mt-4"
          />
        </div>
      ),
    },
    {
      key: "3",
      label: vnMode ? 'Đánh giá' : 'Reviews',
      children: (
        <div>
          <Space>
            <RangePicker
              placeholder={vnMode ? ['Ngày bắt đầu', 'Ngày kết thúc'] : ['Start date', 'End date']}
              onChange={(dates, dateStrings) => {
                setReviewFilter({
                  ...reviewFilter,
                  startTime: dateStrings[0],
                  endTime: dateStrings[1],
                });
              }}
            />
            <Select
              placeholder={vnMode ? 'Lọc theo đánh giá' : 'Filter by Rating'}
              onChange={(value) => setReviewFilter({ ...reviewFilter, rating: value })}
              allowClear
            >
              {[...Array(5)].map((_, i) => (
                <Select.Option key={i + 1} value={i + 1}>
                  {vnMode ? `${i + 1} sao` : `${i + 1} star`}
                </Select.Option>
              ))}
            </Select>
          </Space>
          <List
            itemLayout="vertical"
            dataSource={handleFilterReviews(userDetail.reviews || []).slice((reviewPage - 1) * 5, reviewPage * 5)}
            renderItem={(item) => (
              <List.Item key={item.reviewId} actions={[
                <DeleteOutline
                  key="delete"
                  onClick={() => handleDeleteReview(item.reviewId)}
                  className='cursor-pointer text-red-400'
                />
              ]}>
                <Card>
                </Card>
              </List.Item>
            )}
          />
          <Pagination
            current={reviewPage}
            pageSize={5}
            total={userDetail.reviews?.length}
            onChange={setReviewPage}
            className="mt-4"
          />
        </div>
      )
    },
    {
      key: "4",
      label: vnMode ? 'Câu hỏi' : 'Questions',
      children: (
        <div>
          <RangePicker
            placeholder={vnMode ? ['Ngày bắt đầu', 'Ngày kết thúc'] : ['Start date', 'End date']}
            onChange={(dates, dateStrings) => {
              setQuestionFilter({
                ...questionFilter,
                startTime: dateStrings[0],
                endTime: dateStrings[1],
              });
            }}
          />
          <List
            itemLayout="vertical"
            dataSource={handleFilterQuestions(userDetail.questions || []).slice((questionPage - 1) * 5, questionPage * 5)}
            renderItem={(item) => (
              <List.Item key={item.questionId} actions={[
                <div
                  key="state"
                  onClick={() => handleUpdateQuestionState(item.questionId, item.state)}
                  className="cursor-pointer"
                >
                  {vnMode ? (item.state ? 'Ẩn' : 'Hiển thị') : (item.state ? 'Hide' : 'Show')}
                </div>,
                <DeleteOutlined
                  key="delete"
                  onClick={() => handleDeleteQuestion(item.questionId)}
                  className='cursor-pointer text-red-400'
                />
              ]}>
                <Card>
                </Card>
              </List.Item>
            )}
          />
          <Pagination
            current={questionPage}
            pageSize={5}
            total={userDetail.questions?.length}
            onChange={setQuestionPage}
            className="mt-4"
          />
        </div>
      )
    }
  ];

  const collapseItems = [
    {
      key: "1",
      label: (
        <div className="flex items-center justify-between">
          <span onClick={(e) => e.stopPropagation()}>{vnMode ? 'Thông tin khách hàng' : 'Client details'}</span>
          <div className="flex items-center">
            <EditOutlined
              onClick={(e) => {
                e.stopPropagation();
                toggleEdit();
              }}
              className="cursor-pointer"
            />
          </div>
        </div>
      ),
      children: (
        <div>
          {editing ? (
            <Form form={form} onFinish={handleConfirmUpdateUser} initialValues={formValues}>
              <div className="grid grid-cols-1">
                <div>
                  <Form.Item label={vnMode ? 'Họ' : 'First name'} name="firstName">
                    <Input onChange={(e) => setFormValues({ ...formValues, firstName: e.target.value })} />
                  </Form.Item>
                  <Form.Item label={vnMode ? 'Tên' : 'Last name'} name="lastName">
                    <Input onChange={(e) => setFormValues({ ...formValues, lastName: e.target.value })} />
                  </Form.Item>
                  <Form.Item label={vnMode ? 'Số điện thoại' : 'Phone number'} name="phoneNumber">
                    <Input onChange={(e) => setFormValues({ ...formValues, phoneNumber: e.target.value })} />
                  </Form.Item>
                  <Form.Item label={vnMode ? 'Ngày sinh' : 'Birthday'}>
                    <DatePicker
                      format="DD-MM-YYYY"
                      defaultValue={dayjs(birthday)}
                      onChange={(date) => setBirthday(date)}
                    />
                  </Form.Item>
                  <Form.Item label={vnMode ? 'Vai trò' : 'Role'} name="role">
                    <Select onChange={(value) => setFormValues({ ...formValues, role: value })}>
                      <Select.Option value="ROLE_USER">
                        {vnMode ? 'Người dùng' : 'ROLE_USER'}
                      </Select.Option>
                      <Select.Option value="ROLE_MANAGER">
                        {vnMode ? 'Quản lý' : 'ROLE_MANAGER'}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Status" name="status">
                    <Select onChange={(value) => setFormValues({ ...formValues, status: value })}>
                      <Select.Option value="Lock">{vnMode ? 'Khóa' : 'Lock'}</Select.Option>
                      <Select.Option value="Unlock">{vnMode ? 'Mở khóa' : 'Unlock'}</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>
              <Button htmlType="submit" type="primary" loading={loadingUpdateButton}>
                {vnMode ? 'Lưu' : 'Save'}
              </Button>
            </Form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">{vnMode ? 'Email:' : 'Email:'}</p>
                <p>{userDetail.email}</p>
                <p className="text-gray-600 mt-2">{vnMode ? 'Số điện thoại:' : 'Phone number:'}</p>
                <p>{userDetail.phoneNumber}</p>
                <p className="text-gray-600 mt-2">{vnMode ? 'Ngày sinh:' : 'Birthday:'}</p>
                <p>{new Date(userDetail.birthday).toLocaleDateString('en-GB')}</p>
                <p className="text-gray-600 mt-2">{vnMode ? 'Vai trò:' : 'Role:'}</p>
                <p>{userDetail.role === "ROLE_MANAGER" ? (vnMode ? "Quản lý" : "Manager") : (vnMode ? "Người dùng" : "User")}</p>
                <p className="text-gray-600 mt-2">{vnMode ? 'Trạng thái:' : 'Status:'}</p>
                <p>{userDetail.status === "Unlock" ? (vnMode ? "Mở khóa" : "Unlock") : (vnMode ? "Khóa" : "Lock")}</p>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "2",
      label: vnMode ? 'Địa chỉ' : 'Addresses',
      children: (
        <List
          itemLayout="horizontal"
          dataSource={userDetail.addresses}
          renderItem={(item) => (
            <List.Item
              actions={[
                <DeleteOutline
                  key="delete"
                  onClick={() => handleDeleteAddress(item.addressId)}
                  className="cursor-pointer text-red-400"
                />
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<EnvironmentOutlined />} />}
                title={
                  <div>
                    {item.address}
                    {item.defaultAddress && (
                      <Tag color="blue" className="ml-2">
                        {vnMode ? 'Mặc định' : 'Default'}
                      </Tag>
                    )}
                  </div>
                }
                description={`${item.commune}, ${item.district}, ${item.province}`}
              />
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <Content className="p-6">
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
      <Tooltip title={vnMode ? 'Danh sách khách hàng' : 'Clients list'}>
        <Button
          icon={<LeftOutlined className="text-blue-600" />}
          onClick={() => navigate('/super-admin/users')}
          shape="circle"
          size="small"
          className="bg-blue-100 hover:bg-blue-200 mb-10 mr-2"
        />
        {vnMode ? 'Danh sách người đùng' : 'Clients list'}
      </Tooltip>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {userDetail.avatar ? (
                <Avatar src={`data:image/jpeg;base64,${userDetail?.avatar?.file?.data}`} size={40} className="mr-3" />
              ) : (
                <Avatar icon={<UserOutlined />} size={40} className="mr-3" />
              )}
              <span className="text-lg font-medium">{userDetail.firstName} {userDetail.lastName}</span>
            </div>
          </div>
          <Collapse
            bordered={false}
            defaultActiveKey={['1']}
            expandIconPosition="end"
            ghost
            onClick={() => { }}
            items={collapseItems}
          >
          </Collapse>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultActiveKey="1" items={tabItems}>
          </Tabs>
        </div>

      </div>

      <Modal
        title={vnMode ? 'Xác nhận xóa' : 'Confirm Delete'}
        open={deleteReviewModalVisible}
        onOk={handleConfirmDeleteReview}
        onCancel={handleCancelDeleteReview}
        okText={vnMode ? 'Xóa' : 'Delete'}
        cancelText={vnMode ? 'Hủy' : 'Cancel'}
        loading={loadingDeleteReviewButton}
      >
        <p>{vnMode ? 'Bạn có chắc chắn muốn xóa đánh giá này?' : 'Are you sure you want to delete this review?'}</p>
      </Modal>

      <Modal
        title={vnMode ? 'Xác nhận xóa' : 'Confirm Delete'}
        open={deleteQuestionModalVisible}
        onOk={handleConfirmDeleteQuestion}
        onCancel={handleCancelDeleteQuestion}
        okText={vnMode ? 'Xóa' : 'Delete'}
        cancelText={vnMode ? 'Hủy' : 'Cancel'}
        loading={loadingDeleteQuestionButton}
      >
        <p>{vnMode ? 'Bạn có chắc chắn muốn xóa câu hỏi này?' : 'Are you sure you want to delete this question?'}</p>
      </Modal>

      {/* Update Question State Modal */}
      <Modal
        title={vnMode ? 'Xác nhận cập nhật trạng thái' : 'Confirm Update Status'}
        open={updateQuestionStateModalVisible}
        onOk={handleConfirmUpdateQuestionState}
        onCancel={handleCancelUpdateQuestionState}
        okText={vnMode ? 'Xác nhận' : 'Confirm'}
        cancelText={vnMode ? 'Hủy' : 'Cancel'}
        loading={loadingUpdateQuestionStateButton}
      >
        <p>{vnMode
          ? `Bạn có chắc chắn muốn ${currentQuestionState ? 'ẩn' : 'hiển thị'} câu hỏi này?`
          : `Are you sure you want to ${currentQuestionState ? 'hide' : 'show'} this question?`}</p>
      </Modal>

      <Modal
        title={vnMode ? 'Xác nhận xóa' : 'Confirm Delete'}
        open={confirmDeleteModalVisible}
        onOk={handleConfirmDeleteAddress}
        onCancel={handleCancelDeleteAddress}
        loading={loadingDeleteAddressButton}
      >
        <p>{vnMode ? 'Bạn có chắc chắn muốn xóa địa chỉ này?' : 'Are you sure you want to delete this address?'}</p>
      </Modal>

      <Modal
        title={vnMode ? 'Cập nhật trạng thái đơn hàng' : 'Update Order Status'}
        open={updateModalVisible}
        onCancel={() => { setUpdateModalVisible(false); setSelectedRecord(null) }}
        footer={null}
      >
        <Form
          form={updateForm}
          onFinish={handleConfirmUpdate}
          layout="vertical"
        >
          <Form.Item label={vnMode ? 'Trạng thái' : 'Status'} name="status"
            rules={[{ required: true, message: vnMode ? "Vui lòng chọn trạng thái" : "Please select status" }]}
          >
            <Select>
              <Select.Option value="PENDING">
                {vnMode ? 'Chờ xử lý' : 'Pending'}
              </Select.Option>
              <Select.Option value="COMPLETED">
                {vnMode ? 'Hoàn thành' : 'Completed'}
              </Select.Option>
              <Select.Option value="FAILED">{vnMode ? 'Thất bại' : 'Failed'}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button key="submit" htmlType="submit" type="primary" loading={loadingUpdateOrderButton}>
              {vnMode ? 'Cập nhật' : 'Update'}
            </Button>
            <Button key="cancel" onClick={() => { setUpdateModalVisible(false); setSelectedRecord(null) }} style={{ marginLeft: 8 }}>
              {vnMode ? "Hủy" : "Cancel"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={vnMode ? 'Xác nhận xóa' : 'Confirm Delete'}
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => { setDeleteModalVisible(false); setSelectedRecord(null) }}
        okText={vnMode ? 'Xóa' : 'Delete'}
        cancelText={vnMode ? 'Hủy' : 'Cancel'}
        okButtonProps={{ type: 'primary', danger: true, loading: loadingDeleteOrderButton }}
      >
        <p>{vnMode
          ? 'Bạn có chắc chắn muốn xóa đơn hàng này?'
          : 'Are you sure you want to delete this order?'}</p>
      </Modal>
    </Content>
  );
};

export default DetailPage;