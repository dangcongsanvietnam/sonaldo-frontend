import React, { useEffect, useState } from 'react';
import {
  Table, Space, Button, Input, Tag, Popconfirm,
  Layout,
  Select,
  Modal,
  Form,
} from 'antd';
import {
  DeleteOutlined, SearchOutlined, EditOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import moment from 'moment';
import { deleteFeedback, getAllFeedbacks, replyFeedback } from '../../services/feedbackService';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import { useLoading } from '../../provider/LoadingProvider';

const { Content } = Layout;

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
  });
  const [isLoading, setIsLoading] = useState(false);
  const { vnMode } = useOutletContext();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      startLoading();
      setIsLoading(true);
      try {
        await dispatch(getAllFeedbacks({ ...feedbackFilter, page: feedbackPage - 1 })).unwrap();
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

  const handleDeleteFeedback = async (feedbackId) => {
    setIsLoading(true);
    try {
      await dispatch(deleteFeedback(feedbackId)).unwrap();
      toast.success(
        vnMode
          ? "Xóa feedback thành công!"
          : "Feedback deleted successfully!"
      );
      await dispatch(getAllFeedbacks({ ...feedbackFilter, page: feedbackPage - 1 }));
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'feedbackId',
      key: 'feedbackId',
    },
    {
      title: vnMode ? 'Tên' : 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: vnMode ? 'Email' : 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: vnMode ? 'Nội dung' : 'Content',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
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
      render: (state) => (state ? <Tag color="green">{vnMode ? 'Đã phản hồi' : 'Replied'}</Tag> : <Tag color="red">{vnMode ? 'Chưa phản hồi' : 'Unreplied'}</Tag>),
    },
    {
      title: vnMode ? 'Thao tác' : 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleReplyFeedback(record.feedbackId)}>
            {vnMode ? 'Phản hồi' : 'Reply'}
          </Button>
          <Popconfirm
            title={vnMode ? 'Bạn có chắc chắn muốn xóa feedback này?' : 'Are you sure you want to delete this feedback?'}
            onConfirm={() => handleDeleteFeedback(record.feedbackId)}
            okText={vnMode ? 'Xóa' : 'Delete'}
            cancelText={vnMode ? 'Hủy' : 'Cancel'}
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              {vnMode ? 'Xóa' : 'Delete'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredFeedbacks = feedbacks.content
    ? feedbacks.content.filter((feedback) => {
      const matchSearch = feedback.name.toLowerCase().includes(feedbackSearch.toLowerCase())
        || feedback.email.toLowerCase().includes(feedbackSearch.toLowerCase())
        || feedback.content.toLowerCase().includes(feedbackSearch.toLowerCase());
      const matchState = feedbackFilter.state === null || feedback.state === feedbackFilter.state;
      return matchSearch && matchState;
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
        footer={null} // Use custom footer inside the form
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
            placeholder={vnMode ? 'Tìm kiếm theo tên, email, nội dung' : 'Search by name, email, or content'}
            prefix={<SearchOutlined />}
            value={feedbackSearch}
            onChange={(e) => setFeedbackSearch(e.target.value)}
            className="mr-2 w-[30%]"
          />
          <Space>
            <Select
              placeholder={vnMode ? 'Lọc theo trạng thái' : 'Filter by status'}
              value={feedbackFilter.state}
              onChange={(value) => setFeedbackFilter({ ...feedbackFilter, state: value })}
              allowClear
            >
              <Select.Option value={false}>{vnMode ? 'Chưa phản hồi' : 'Unreplied'}</Select.Option>
              <Select.Option value={true}>{vnMode ? 'Đã phản hồi' : 'Replied'}</Select.Option>
            </Select>
            <Button icon={<CloseCircleOutlined />} onClick={handleClearFilter}>
              {vnMode ? 'Xóa bộ lọc' : 'Clear filter'}
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredFeedbacks}
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