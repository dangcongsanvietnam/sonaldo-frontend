import React, { useState, useEffect, useCallback } from 'react';
import {
    Layout, Tabs, Input, Button, Select, Space,
    Form, Divider, List, Card,
    Dropdown,
    Tag,
} from 'antd';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { searchUsers } from '../../services/userService';
import {
    getBirthdayEmailTemplates,
    createBirthdayEmailTemplate,
    updateBirthdayEmailTemplate,
    deleteBirthdayEmailTemplate,
    sendPromotionEmail,
} from '../../services/emailService';
import TextEditor from '../../components/TextEditor';
import { useOutletContext } from 'react-router-dom';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import { useLoading } from '../../provider/LoadingProvider';
import { debounce } from 'lodash'; // Import debounce from lodash

const { Content } = Layout;

const EmailPage = () => {
    const { startLoading, stopLoading } = useLoading();
    const [form] = Form.useForm();
    const [promotionForm] = Form.useForm();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [promotionEmailContent, setPromotionEmailContent] = useState('');
    const [birthdayTemplates, setBirthdayTemplates] = useState([]);
    const [visibleBirthdayTemplates, setVisibleBirthdayTemplates] = useState([]);
    const [showMoreTemplates, setShowMoreTemplates] = useState(false);
    const [selectLoading, setSelectLoading] = useState(false);
    const [template, setTemplate] = useState(true);
    const { vnMode } = useOutletContext();

    useEffect(() => {
        fetchBirthdayTemplates();
    }, [dispatch]);

    const fetchBirthdayTemplates = async () => {
        startLoading();
        setIsLoading(true);
        try {
            const res = await dispatch(getBirthdayEmailTemplates()).unwrap();
            setBirthdayTemplates(res);
            setVisibleBirthdayTemplates(res.slice(0, 5));
            setShowMoreTemplates(res.length > 5);
        } catch (error) {
        } finally {
            setIsLoading(false);
            stopLoading();
        }
    };

    const handleSelectChange = (value) => {
        if (value.includes('all')) {
            setSelectedUsers(['all']);
            setUsers([]);
        } else {
            setSelectedUsers(value);
            setUsers([]);
        }
    };

    const debouncedSearch = useCallback(
        debounce(async (value) => {
            try {
                setSelectLoading(true);
                if (value === '') {
                    setUsers([]);
                    setSelectLoading(false);
                    return;
                }

                const res = await dispatch(searchUsers({
                    name: value,
                    role: '',
                    status: '',
                })).unwrap().finally(() => {
                    setSelectLoading(false);
                })

                setUsers(res);

            } catch (error) {
                setUsers([]);
            }
        }, 300), // 300ms debounce time
        [] // Dependencies array for useCallback
    );


    const handleSearchUser = (value) => {
        debouncedSearch(value);
    }

    const handleSendPromotionEmail = async (values) => {
        setIsLoading(true);
        try {
            const request = {
                ...values,
                recipientEmails: selectedUsers.includes('all') ? [] : selectedUsers,
            };

            await dispatch(sendPromotionEmail(request)).unwrap().finally(() => {
                setIsLoading(false)
            })
            toast.success(vnMode ? 'Đang gửi email trong background...' : 'Sending email in the background...');
            form.resetFields();
            setSelectedUsers([]);
        } catch (error) {
            toast.error(vnMode ? 'Gửi email khuyến mãi thất bại!' : 'Send promotion email failed!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateBirthdayTemplate = async (values) => {
        setIsLoading(true);
        try {
            await dispatch(createBirthdayEmailTemplate(values)).unwrap();
            toast.success(vnMode ? 'Tạo mẫu email sinh nhật thành công!' : 'Create birthday email template successfully!');
            form.resetFields();
            await fetchBirthdayTemplates();
        } catch (error) {
            toast.error(vnMode ? 'Tạo mẫu email sinh nhật thất bại!' : 'Create birthday email template failed!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateBirthdayTemplate = async (values) => {
        setIsLoading(true);

        try {
            await dispatch(updateBirthdayEmailTemplate({ ...values })).unwrap();
            toast.success(vnMode ? 'Cập nhật mẫu email sinh nhật thành công!' : 'Update birthday email template successfully!');
            await fetchBirthdayTemplates();
        } catch (error) {
            toast.error(vnMode ? 'Cập nhật mẫu email sinh nhật thất bại!' : 'Update birthday email template failed!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBirthdayTemplate = async (templateId) => {
        const isDefault = birthdayTemplates.some(template => template.templateId === templateId && template.defaultTemplate);

        if (isDefault) {
            toast.error(vnMode ? 'Không thể xóa mẫu email mặc định!' : 'Cannot delete the default email template!');
            return;
        }

        setIsLoading(true);
        try {
            await dispatch(deleteBirthdayEmailTemplate(templateId)).unwrap();
            toast.success(vnMode ? 'Xóa mẫu email sinh nhật thành công!' : 'Delete birthday email template successfully!');
            await fetchBirthdayTemplates();
        } catch (error) {
            toast.error(vnMode ? 'Xóa mẫu email sinh nhật thất bại!' : 'Delete birthday email template failed!');
        } finally {
            setIsLoading(false);
        }
    };

    const showBirthdayTemplateModal = (record) => {
        if (record) {
            const quillContent = record.content;
            form.setFieldsValue({
                ...record,
                content: quillContent,
            });
        } else {
            form.resetFields();
        }
    };

    const handleShowMoreTemplates = () => {
        setVisibleBirthdayTemplates(birthdayTemplates);
        setShowMoreTemplates(false);
    };

    const tabItems = [
        {
            key: '1',
            label: vnMode ? "Gửi email sinh nhật" : "Send birthday email",
            children: (
                <div className="flex gap-4">
                    <Form
                        form={form}
                        name="birthdayTemplateForm"
                        layout="vertical"
                        autoComplete="off"
                        onFinish={!template ? handleUpdateBirthdayTemplate : handleCreateBirthdayTemplate}
                        className='w-[70%]'
                    >
                        {!template ? (
                            <Form.Item name="templateId" hidden>
                                <Input />
                            </Form.Item>
                        ) : (<></>)}

                        <Form.Item label={vnMode ? "Tên mẫu" : "Template name"} name="templateName"
                            rules={[
                                {
                                    required: true,
                                    message: vnMode ? 'Vui lòng nhập tên mẫu!' : 'Please enter template name!',
                                },
                            ]}
                        >
                            <Input placeholder={vnMode ? "Nhập tên mẫu" : "Enter template name"} />
                        </Form.Item>
                        <Form.Item label={vnMode ? "Tiêu đề" : "Subject"} name="subject"
                            rules={[
                                {
                                    required: true,
                                    message: vnMode ? 'Vui lòng nhập tiêu đề!' : 'Please enter subject!',
                                },
                            ]}
                        >
                            <Input placeholder={vnMode ? "Nhập tiêu đề" : "Enter subject"} />
                        </Form.Item>
                        <Form.Item label={vnMode ? "Nội dung" : "Content"} name="content"
                            rules={[
                                {
                                    required: true,
                                    message: vnMode ? 'Vui lòng nhập nội dung!' : 'Please enter content!',
                                },
                            ]}
                        >
                            <TextEditor />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={isLoading}>
                                {!template ? (vnMode ? "Cập nhật" : "Update") : (vnMode ? "Tạo mẫu" : "Create template")}
                            </Button>
                        </Form.Item>
                    </Form>

                    <Divider type='vertical' style={{ height: "70vh" }} />

                    <div className='w-[30%]'>
                        <List
                            itemLayout="vertical"
                            loading={isLoading}
                            dataSource={visibleBirthdayTemplates}
                            renderItem={(item) => (
                                <List.Item
                                    key={item.templateId}
                                >
                                    <Card
                                        title={<div className='flex'>

                                            <Dropdown menu={{
                                                items: [
                                                    {
                                                        key: 'edit',
                                                        label: vnMode ? 'Sửa' : 'Edit',
                                                        onClick: () => {
                                                            showBirthdayTemplateModal(item);
                                                            setTemplate(false);
                                                        }
                                                    },
                                                    {
                                                        key: 'setDefault',
                                                        label: vnMode ? 'Đặt mặc định' : 'Set default',
                                                        disabled: item.defaultTemplate ? true : false,
                                                        onClick: () =>
                                                            handleUpdateBirthdayTemplate({
                                                                templateId: item.templateId,
                                                                templateName: item.templateName,
                                                                subject: item.subject,
                                                                imageUrl: item.imageUrl,
                                                                content: item.content,
                                                                buttonText: item.buttonText,
                                                                buttonLink: item.buttonLink,
                                                                defaultTemplate: !item.defaultTemplate,
                                                            })
                                                    },
                                                    {
                                                        key: 'delete',
                                                        label: vnMode ? 'Xóa' : 'Delete',
                                                        danger: true,
                                                        onClick: () => handleDeleteBirthdayTemplate(item.templateId),
                                                        disabled: item.defaultTemplate,
                                                    },
                                                ],
                                            }}>
                                                <a onClick={(e) => e.preventDefault()}>
                                                    <Space>
                                                        <MoreOutlined />
                                                    </Space>
                                                </a>
                                            </Dropdown>
                                            <span>
                                                {item.templateName}

                                            </span>
                                        </div>}
                                        extra={item.defaultTemplate ? <Tag color="green">{vnMode ? 'Mặc định' : 'Default'}</Tag> : null}
                                    >
                                        <p>{item.subject}</p>
                                    </Card>
                                </List.Item>
                            )}
                        />

                        {showMoreTemplates && (
                            <Button type="primary" onClick={handleShowMoreTemplates}>
                                {vnMode ? "Xem thêm" : "Show more"}
                            </Button>
                        )}

                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                form.resetFields();
                                showBirthdayTemplateModal();
                                setTemplate(true);
                            }}
                            className="mt-4 w-full"
                        >
                            {vnMode ? "Tạo mẫu mới" : "Create new template"}
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            key: '2',
            label: vnMode ? "Gửi email khuyến mãi" : "Send promotion email",
            children: (
                <Form
                    form={promotionForm}
                    name="promotionEmailForm"
                    layout="vertical"
                    onFinish={handleSendPromotionEmail}
                    autoComplete="off"
                >
                    <Form.Item label={vnMode ? "Tiêu đề" : "Subject"} name="subject">
                        <Input placeholder={vnMode ? "Nhập tiêu đề" : "Enter subject"} />
                    </Form.Item>

                    <Form.Item label={vnMode ? "Nội dung" : "Content"} name="content">
                        <TextEditor value={promotionEmailContent} onChange={setPromotionEmailContent} />
                    </Form.Item>

                    <Form.Item label={vnMode ? "Người nhận" : "Recipients"} name="usersSearch">
                        <Select
                            mode="multiple"
                            placeholder={vnMode ? "Chọn người dùng" : "Select users"}
                            onSearch={handleSearchUser}
                            onChange={handleSelectChange}
                            value={selectedUsers}
                            allowClear
                            loading={selectLoading}
                        >
                            <Select.Option key="all" value="all">
                                {vnMode ? "Chọn tất cả" : "Select all"}
                            </Select.Option>
                            {users.map((user) => (
                                <Select.Option key={user?.userId} value={user?.email} user={user}>
                                    {user?.email} - {user?.firstName} {user?.lastName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={isLoading}>
                            {vnMode ? "Gửi" : "Send"}
                        </Button>
                    </Form.Item>
                </Form>
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
            <Tabs defaultActiveKey="1" items={tabItems}>
            </Tabs>
        </Content>
    );
};

export default EmailPage;