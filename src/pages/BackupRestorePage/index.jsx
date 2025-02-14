import React, { useState } from 'react';
import { Button, Upload, Space, Tabs, Collapse } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import Cookies from "js-cookie";
import { useOutletContext } from 'react-router-dom';
import { Bounce, toast, ToastContainer } from 'react-toastify';

const BackupRestorePage = () => {
  const [restoreFile, setRestoreFile] = useState(null);
  const [backupUsersLoading, setBackupUsersLoading] = useState(false);
  const [backupAllLoading, setBackupAllLoading] = useState(false);
  const [restoreUsersLoading, setRestoreUsersLoading] = useState(false);
  const [restoreAllLoading, setRestoreAllLoading] = useState(false);
  const { vnMode } = useOutletContext();

  const handleBackupUsers = async () => {
    setBackupUsersLoading(true);
    try {
        const token = Cookies.get('token');
        const response = await axios.get('http://localhost:8080/api/v1/super-admin/backup-restore/backup/users/user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '_users.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(vnMode ? 'Sao lưu dữ liệu người dùng thành công!' : 'Backup user data successfully!');
    } catch (error) {
        toast.error(vnMode ? 'Sao lưu dữ liệu người dùng thất bại!' : 'Failed to backup user data!');
        console.error(error);
    } finally {
        setBackupUsersLoading(false);
    }
};

const handleRestoreUsers = async () => {
    if (!restoreFile) {
        toast.warning(vnMode ? 'Vui lòng chọn file để phục hồi!' : 'Please select a file to restore!');
        return;
    }

    setRestoreUsersLoading(true);

    try {
        const token = Cookies.get('token');
        const formData = new FormData();
        formData.append('file', restoreFile);

        await axios.post('http://localhost:8080/api/v1/super-admin/backup-restore/restore/users/user', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        toast.success(vnMode ? 'Phục hồi dữ liệu người dùng thành công!' : 'Restore user data successfully!');
        setRestoreFile(null);
    } catch (error) {
        toast.error(vnMode ? 'Phục hồi dữ liệu người dùng thất bại!' : 'Failed to restore user data!');
        console.error(error);
    } finally {
        setRestoreUsersLoading(false);
    }
};

const handleBackupAll = async () => {
    setBackupAllLoading(true);
    try {
        const token = Cookies.get('token');
        const response = await axios.get('http://localhost:8080/api/v1/super-admin/backup-restore/backup/all', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'backup_all.zip');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(vnMode ? 'Sao lưu dữ liệu thành công!' : 'Backup data successfully!');
    } catch (error) {
        toast.error(vnMode ? 'Sao lưu dữ liệu thất bại!' : 'Failed to backup data!');
        console.error(error);
    } finally {
        setBackupAllLoading(false);
    }
};

const handleRestoreAll = async () => {
    if (!restoreFile) {
        toast.warning(vnMode ? 'Vui lòng chọn file để phục hồi!' : 'Please select a file to restore!');
        return;
    }

    setRestoreAllLoading(true);

    try {
        const token = Cookies.get('token');
        const formData = new FormData();
        formData.append('file', restoreFile);

        await axios.post('http://localhost:8080/api/v1/super-admin/backup-restore/restore/all', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        toast.success(vnMode ? 'Phục hồi dữ liệu thành công!' : 'Restore data successfully!');
        setRestoreFile(null);
    } catch (error) {
        toast.error(vnMode ? 'Phục hồi dữ liệu thất bại!' : 'Failed to restore data!');
        console.error(error);
    } finally {
        setRestoreAllLoading(false);
    }
};

  const backupItems = [
    {
      key: '1',
      label: vnMode ? 'Dữ liệu người dùng' : 'User data',
      children: (
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleBackupUsers}
            loading={backupUsersLoading}
          >
            {vnMode ? 'Sao lưu người dùng' : 'Backup users'}
          </Button>
          {backupUsersLoading && (
            <small>{vnMode ? 'Quá trình này có thể mất nhiều thời gian...' : 'This process may take a while...'}</small>
          )}
        </Space>
      )
    },
    {
      key: '2',
      label: vnMode ? 'Dữ liệu không bao gồm người dùng' : 'Data excluding users',
      children: (
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleBackupAll}
            loading={backupAllLoading}
          >
            {vnMode ? 'Sao lưu tất cả' : 'Backup all'}
          </Button>
          {backupAllLoading && (
            <small>{vnMode ? 'Quá trình này có thể mất nhiều thời gian...' : 'This process may take a while...'}</small>
          )}
        </Space>
      )
    }
  ];

  const restoreItems = [
    {
      key: '1',
      label: vnMode ? 'Dữ liệu người dùng' : 'User data',
      children: (
        <Space>
          <Upload
            accept=".zip"
            beforeUpload={(file) => {
              setRestoreFile(file);
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} loading={restoreUsersLoading}>Chọn file người dùng</Button>
          </Upload>
          <Button
            type="primary"
            onClick={handleRestoreUsers}
            disabled={!restoreFile || restoreUsersLoading}
            loading={restoreUsersLoading}
          >
            {vnMode ? 'Phục hồi người dùng' : 'Restore users'}
          </Button>
          {restoreUsersLoading && (
            <small>{vnMode ? 'Quá trình này có thể mất nhiều thời gian...' : 'This process may take a while...'}</small>
          )}
        </Space>
      )
    },
    {
      key: '2',
      label: vnMode ? 'Dữ liệu không bao gồm người dùng' : 'Data excluding users',
      children: (
        <Space>
          <Upload
            accept=".zip"
            beforeUpload={(file) => {
              setRestoreFile(file);
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} loading={restoreAllLoading}>Chọn file phục hồi</Button>
          </Upload>
          <Button
            type="primary"
            onClick={handleRestoreAll}
            disabled={!restoreFile || restoreAllLoading}
            loading={restoreAllLoading}
          >
            {vnMode ? 'Phục hồi tất cả' : 'Restore all'}
          </Button>
          {restoreAllLoading && (
            <small>{vnMode ? 'Quá trình này có thể mất nhiều thời gian...' : 'This process may take a while...'}</small>
          )}
        </Space>
      )
    }
  ];

  const tabItems = [
    {
      key: '1',
      label: vnMode ? 'Sao lưu' : 'Backup',
      children: (
        <Collapse items={backupItems}>
        </Collapse>
      )
    },
    {
      key: '2',
      label: vnMode ? 'Phục hồi' : 'Restore',
      children: (
        <Collapse items={restoreItems}>
        </Collapse>
      )
    }
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
      <Tabs defaultActiveKey="1" items={tabItems}>
      </Tabs>
    </div>
  );
};

export default BackupRestorePage;