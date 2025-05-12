import React, { useEffect, useState } from 'react';
import {
  Table, Space, Button, Input, Tag, Popconfirm,
  Layout,
  Select,
  Modal,
  Form,
  DatePicker,
  Dropdown,
} from 'antd';
import {
  SearchOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  PlusOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
import moment from 'moment';
import { changeStatus, deleteFeedback, getAllFeedbacks, replyFeedback } from '../../services/feedbackService';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import { useLoading } from '../../provider/LoadingProvider';

const { Content } = Layout;
const { RangePicker } = DatePicker;

const FeedbackManagementPage = () => {
  const { startLoading, stopLoading } = useLoading();
  const dispatch = useDispatch();
  const { feedbacks } = useSelector((state) => state.feedbacks);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState({
    state: null,
    dateRange: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const { vnMode } = useOutletContext();
  const navigate = useNavigate();
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      startLoading();
      setIsLoading(true);
      try {
        await dispatch(getAllFeedbacks()).unwrap();
      } catch (error) {
        toast.error(
          vnMode
            ? error?.message || "Đã xảy ra lỗi khi tải feedback."
            : error?.message || "An error occurred while fetching feedbacks."
        );
      } finally {
        setIsLoading(false);
        stopLoading();
      }
    };
    fetchFeedbacks();
  }, [dispatch, feedbackFilter, feedbackPage]);

  const handleReplyFeedback = (feedbackId) => {
    setSelectedFeedbackId(feedbackId);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      await dispatch(replyFeedback({ feedbackId: selectedFeedbackId, content: values.content })).unwrap();
      toast.success(
        vnMode
          ? "Phản hồi feedback thành công!"
          : "Feedback reply successfully!"
      );
      await dispatch(getAllFeedbacks({ ...feedbackFilter, page: feedbackPage - 1 }));
      setIsModalVisible(false);
    } catch (error) {
      toast.error(
        vnMode
          ? error?.message || "Đã xảy ra lỗi!"
          : error?.message || "An error occurred!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFeedbackChange = (pagination) => {
    setFeedbackPage(pagination.current);
  };

  const handleDeleteFeedback = async (blogId) => {
    setIsLoading(true);
    try {
      await dispatch(deleteFeedback(blogId)).unwrap();
      toast.success(
        vnMode
          ? "Xóa feedback thành công!"
          : "Feedback deleted successfully!"
      );
      await dispatch(getAllFeedbacks());
    } catch (error) {
      toast.error(
        vnMode
          ? error?.message || "Đã xảy ra lỗi!"
          : error?.message || "An error occurred!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilter = () => {
    setFeedbackSearch('');
    setFeedbackFilter({
      state: null,
    });
    setFeedbackPage(1);
  };

  const handleChangeStatus = (item) => {
    setStatusLoading(true);
    let state = "Unlock";
    if (item.state === "Unlock") {
      state = "Lock";
    }
    try {
      const data = {
        blogId: item.blogId,
        state: state
      }
      dispatch(changeStatus(data)).then(() => {
        setStatusLoading(false);
        toast.success(vnMode ? "Thay đổi thành công" : "Changed successfully");
        dispatch(getAllFeedbacks());
      });
    } catch {
      setStatusLoading(false);
      toast.success(vnMode ? "Thay đổi thất bại" : "Failed to change");
    }
  }

  const menuItems = (record) => [
    {
      key: "view",
      label: (
        <span onClick={() => navigate(`/super-admin/feedbacks/${record.blogId}`)}>
          View Blog
        </span>
      ),
    },
    {
      key: "change-status",
      label: (
        <span onClick={() => handleChangeStatus(record)}>
          {statusLoading && (<LoadingOutlined />)}
          Change Status
        </span>
      ),
    },
    {
      key: "delete",
      label: (
        <Popconfirm title="Are you sure?" onConfirm={() => handleDeleteFeedback(record.blogId)}>
          {isLoading && (<LoadingOutlined />)}
          Delete
        </Popconfirm>
      ),
    },
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'blogId',
      key: 'blogId',
    },
    {
      title: vnMode ? 'Tác giả' : 'Writer',
      dataIndex: 'writer',
      key: 'writer',
    },
    {
      title: vnMode ? 'Tiêu đề' : 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (text) => (text.length > 20 ? `${text.substring(0, 20)}...` : text),
    },
    {
      title: vnMode ? 'Thời gian' : 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: vnMode ? 'Trạng thái' : 'Status',
      dataIndex: 'state',
      key: 'state',
      render: (state) => (state === "Unlock" ? <Tag color="green">{vnMode ? 'Mở khoá' : 'Unlock'}</Tag> : <Tag color="red">{vnMode ? 'Ẩn' : 'Hide'}</Tag>),
    },
    {
      title: vnMode ? 'Thao tác' : 'Action',
      key: 'action',
      render: (_, record) => (
        <Dropdown menu={{ items: menuItems(record) }} trigger={["click"]}>
          <MoreOutlined className="cursor-pointer" />
        </Dropdown>
      ),
    },
  ];

  const filteredFeedbacks = feedbacks ? feedbacks?.filter((feedback) => {
    const matchSearch =
      feedback.writer.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
      feedback.subject.toLowerCase().includes(feedbackSearch.toLowerCase());

    const matchState =
      feedbackFilter.state === null || feedback.state === feedbackFilter.state;

    const createdAt = new Date(feedback.createdAt);

    const startDate = feedbackFilter.dateRange?.[0]?.startOf("day");
    const endDate = feedbackFilter.dateRange?.[1]?.endOf("day");

    const matchDate =
      (!startDate || createdAt >= new Date(startDate)) &&
      (!endDate || createdAt <= new Date(endDate));

    return matchSearch && matchState && matchDate;
  })
    : [];

  return (
    <Content>
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

      <Modal
        title={vnMode ? 'Phản hồi feedback' : 'Reply Feedback'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form onFinish={handleSubmit}>
          <Form.Item
            label={vnMode ? 'Nội dung' : 'Content'}
            name="content"
            rules={[{ required: true, message: vnMode ? 'Nội dung không được để trống!' : 'Content cannot be empty!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button key="submit" htmlType="submit" type="primary" loading={isLoading}>
              {vnMode ? 'Gửi' : 'Send'}
            </Button>
            <Button key="cancel" loading={isLoading} onClick={handleCancel} style={{ marginLeft: 8 }}>
              {vnMode ? 'Hủy' : 'Cancel'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <div>
        <div className="flex items-center mb-4">
          <Input.Search
            placeholder={vnMode ? 'Tìm kiếm theo tên tác giả, tiêu đề' : 'Search by author, subject'}
            prefix={<SearchOutlined />}
            value={feedbackSearch}
            onChange={(e) => setFeedbackSearch(e.target.value)}
            className="mr-2 w-[30%]"
          />
          <Space>
            <RangePicker
              format="DD/MM/YYYY"
              onChange={(dates) =>
                setFeedbackFilter({
                  ...feedbackFilter,
                  dateRange: dates,
                })
              }
            />
            <Select
              placeholder={vnMode ? 'Lọc theo trạng thái' : 'Filter by status'}
              value={feedbackFilter.state}
              onChange={(value) => setFeedbackFilter({ ...feedbackFilter, state: value })}
              allowClear
            >
              <Select.Option value="Unlock">{vnMode ? 'Mở khoá' : 'Unlock'}</Select.Option>
              <Select.Option value="Lock">{vnMode ? 'Ẩn' : 'Hide'}</Select.Option>
            </Select>
            <Button icon={<CloseCircleOutlined />} onClick={handleClearFilter}>
              {vnMode ? 'Xóa bộ lọc' : 'Clear filter'}
            </Button>
            <Button type='primary' icon={<PlusOutlined />} onClick={() => navigate("/super-admin/add-blog")}>
              {vnMode ? 'Thêm Blog' : 'Add Blog'}
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredFeedbacks.map((feedback) => ({
            ...feedback,
            key: feedback.blogId,
          }))}
          loading={isLoading}
          pagination={{
            current: feedbackPage,
            pageSize: 10,
            total: feedbacks.totalElements,
            onChange: handleFeedbackChange,
          }}
        />
      </div>
    </Content>
  );
};

export default FeedbackManagementPage;