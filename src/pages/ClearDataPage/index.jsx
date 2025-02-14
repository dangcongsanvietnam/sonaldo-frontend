import React, { useState } from 'react';
import { Button, Space, Collapse, Popconfirm, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import Cookies from "js-cookie";
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Bounce, toast, ToastContainer } from 'react-toastify';

const ClearDataPage = () => {
  const navigate = useNavigate();
  const [isLoadingAllExceptUserChangelog, setIsLoadingAllExceptUserChangelog] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isClearAllExceptModalVisible, setIsClearAllExceptModalVisible] = useState(false);
  const [isClearUsersModalVisible, setIsClearUsersModalVisible] = useState(false);
  const { vnMode } = useOutletContext();

  const confirmClearAllExceptUserChangelog = async () => {
    setIsLoadingAllExceptUserChangelog(true);
    try {
      const token = Cookies.get('token');
      await axios.delete('http://14.225.253.35:8080/api/v1/super-admin/backup-restore/clear/all-except-user-changelog', {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(vnMode ? 'Xóa dữ liệu thành công!' : 'Data cleared successfully!');
      setIsClearAllExceptModalVisible(false);
    } catch (error) {
      toast.error(vnMode ? 'Xóa dữ liệu thất bại!' : 'Failed to clear data!');
    } finally {
      setIsLoadingAllExceptUserChangelog(false);
    }
  };

  const confirmClearUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const token = Cookies.get('token');
      await axios.delete('http://14.225.253.35:8080/api/v1/super-admin/backup-restore/clear/users/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(vnMode ? 'Xóa tất cả người dùng thành công!' : 'Successfully deleted all users!');
      setIsClearUsersModalVisible(false);
    } catch (error) {
      toast.error(vnMode ? 'Xóa người dùng thất bại!' : 'Failed to delete users!');
      console.error(error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const collapseItems = [
    {
      key: '1',
      label: vnMode ? 'Dữ liệu bao gồm người dùng' : 'Including user data',
      children: (
        <Space>
          <Popconfirm
            title={vnMode ? 'Bạn có chắc chắn muốn xóa tất cả dữ liệu?' : 'Are you sure you want to delete all data?'}
            onConfirm={() => setIsClearUsersModalVisible(true)}
            okText={vnMode ? 'Xóa' : 'Delete'}
            cancelText={vnMode ? 'Hủy' : 'Cancel'}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} loading={isLoadingUsers}>
              {vnMode ? 'Xóa tất cả' : 'Delete all'}
            </Button>
          </Popconfirm>
          {isLoadingUsers && (
            <small>{vnMode ? 'Quá trình này có thể mất nhiều thời gian...' : 'This process may take a while...'}</small>
          )}
        </Space>
      ),
    },
    {
      key: '2',
      label: vnMode ? 'Dữ liệu không bao gồm người dùng' : 'Data excluding users',
      children: (
        <Space direction="vertical">
          <Space>
            <Popconfirm
              title={vnMode ? 'Bạn có chắc chắn muốn xóa tất cả dữ liệu (trừ người dùng & changelog)?' : 'Are you sure you want to delete all data (except users & changelog)?'}
              onConfirm={() => setIsClearAllExceptModalVisible(true)}
              okText={vnMode ? 'Xóa' : 'Delete'}
              cancelText={vnMode ? 'Hủy' : 'Cancel'}
            >
              <Button type="primary" danger icon={<DeleteOutlined />} loading={isLoadingAllExceptUserChangelog}>
                {vnMode ? 'Xóa tất cả (trừ người dùng & changelog)' : 'Delete all (except users & changelog)'}
              </Button>
            </Popconfirm>
            {isLoadingAllExceptUserChangelog && (
              <small>{vnMode ? 'Quá trình này có thể mất nhiều thời gian...' : 'This process may take a while...'}</small>
            )}
          </Space>
        </Space>
      ),
    },
  ];

  return (
    <div>
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
        open={isClearAllExceptModalVisible}
        title={vnMode ? 'Xác nhận xóa' : 'Confirm deletion'}
        onCancel={() => setIsClearAllExceptModalVisible(false)}
        footer={null}
      >
        <p>{vnMode ? 'Bạn có chắc chắn muốn xóa tất cả dữ liệu (trừ người dùng & changelog)?' : 'Are you sure you want to delete all data (except users & changelog)?'}</p>
        <p>{vnMode ? 'Dữ liệu bị xóa có thể không được phục hồi. Nếu chưa sao lưu dữ liệu, bạn có thể thực hiện trước khi xóa.' : 'Deleted data may not be recovered. If you have not backed up your data, you can do so before deleting.'}</p>
        <Space>
          <Button onClick={() => setIsClearAllExceptModalVisible(false)}>{vnMode ? 'Hủy' : 'Cancel'}</Button>
          <Button type="primary" onClick={() => navigate('/super-admin/backup-and-restore')}>
            {vnMode ? 'Sao lưu dữ liệu' : 'Backup data'}
          </Button>
          <Button
            type="primary"
            danger
            onClick={confirmClearAllExceptUserChangelog}
            loading={isLoadingAllExceptUserChangelog}
          >
            {vnMode ? 'Xác nhận xóa' : 'Confirm deletion'}
          </Button>
        </Space>
      </Modal>

      {/* Clear Users Modal */}
      <Modal
        open={isClearUsersModalVisible}
        title={vnMode ? 'Xác nhận xóa' : 'Confirm deletion'}
        onCancel={() => setIsClearUsersModalVisible(false)}
        footer={null}
      >
        <p>{vnMode ? 'Bạn có chắc chắn muốn xóa tất cả dữ liệu?' : 'Are you sure you want to delete all data?'}</p>
        <p>{vnMode ? 'Dữ liệu bị xóa có thể không được phục hồi. Nếu chưa sao lưu dữ liệu, bạn có thể thực hiện trước khi xóa.' : 'Deleted data may not be recovered. If you have not backed up your data, you can do so before deleting.'}</p>
        <Space>
          <Button onClick={() => setIsClearUsersModalVisible(false)}>{vnMode ? 'Hủy' : 'Cancel'}</Button>
          <Button type="primary" onClick={() => navigate('/super-admin/backup-and-restore')}>
            {vnMode ? 'Sao lưu dữ liệu' : 'Backup data'}
          </Button>
          <Button
            type="primary"
            danger
            onClick={confirmClearUsers}
            loading={isLoadingUsers}
          >
            {vnMode ? 'Xác nhận xóa' : 'Confirm deletion'}
          </Button>
        </Space>
      </Modal>
      <Collapse items={collapseItems}>
      </Collapse>
    </div>
  );
};

export default ClearDataPage;