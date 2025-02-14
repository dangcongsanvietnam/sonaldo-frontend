import React, { useState, useEffect } from "react";
import {
    Layout,
    Button,
    Form,
    List,
    Card,
    Dropdown,
    Space,
    Modal,
    Input,
    DatePicker,
    InputNumber,
    Tag,
    Checkbox,
    Image,
} from "antd";
import {
    MoreOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
    getAllInformation,
    createInformation,
    updateInformation,
    deleteInformation,
    setDefaultInformation,
} from "../../services/informationService";
import TextEditor from "../../components/TextEditor";
import "react-quill/dist/quill.snow.css";
import { useOutletContext } from "react-router-dom";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { useLoading } from "../../provider/LoadingProvider";
import ImageUpload from "../../components/ImageUpload";
import dayjs from "dayjs";

const { Content } = Layout;

const InformationPage = () => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const { informationList } = useSelector((state) => state.information);
    const { vnMode } = useOutletContext();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingInformation, setEditingInformation] = useState(null);
    const { startLoading, stopLoading } = useLoading();
    const [fileList, setFileList] = useState([]);
    const [isFormValid, setIsFormValid] = useState(true);
    const [isIntroModalVisible, setIsIntroModalVisible] = useState(false);
    const [introContent, setIntroContent] = useState('');

    useEffect(() => {
        fetchInformation();
    }, [dispatch]);

    const fetchInformation = () => {
        startLoading();
        dispatch(getAllInformation()).unwrap().then(() => {
            toast.success(vnMode ? 'Tải dữ liệu thành công' : 'Load data successfully')
        }).catch(() => {
            toast.error(vnMode ? "Đã xảy ra lỗi!" : "An error occurred!")
        }).finally(() => {
            stopLoading();
        })
    }

    const handleFormChange = () => {
        const errors = form.getFieldsError();
        setIsFormValid(errors.every(({ errors }) => errors.length === 0));
    };

    const handleCreateInformation = async (values) => {
        setIsLoading(true);
        try {
            const newInformation = {
                ...values,
                images: fileList.length > 0 ? fileList.map((file) => file?.originFileObj) : null,
                state: values.state === true ? 1 : 0 || 0,
            };

            await dispatch(createInformation(newInformation)).unwrap().then(() => {
                fetchInformation();
            });
            toast.success(vnMode ? "Tạo thông tin thành công!" : "Create information successfully!");
            form.resetFields();
            setFileList([]);
            setIsModalVisible(false);
        } catch (error) {
            toast.error(vnMode ? "Tạo thông tin thất bại!" : "Create information failed!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateInformation = async (values) => {
        setIsLoading(true);
        try {
            const newInformation = {
                ...values,
                images: fileList.length > 0 ? fileList.map((file) => file?.originFileObj) : null,
                state: values.state === true ? 1 : 0 || 0,
            };
            await dispatch(
                updateInformation({ informationId: editingInformation.informationId, newInformation })
            ).unwrap();
            fetchInformation();
            toast.success(vnMode ? "Cập nhật thông tin thành công!" : "Update information successfully!");
            setIsModalVisible(false);
            setEditingInformation(null);
        } catch (error) {
            toast.error(vnMode ? "Cập nhật thông tin thất bại!" : "Update information failed!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteInformation = async (informationId) => {
        setIsLoading(true);
        try {
            const informationToDelete = informationList.find(
                (info) => info.informationId === informationId
            );

            if (informationToDelete.default) {
                toast.warning(vnMode ? "Không thể xóa thông tin mặc định!" : "Cannot delete default information!");
                return;
            }

            await dispatch(deleteInformation(informationId)).unwrap();
            toast.success(vnMode ? "Xóa thông tin thành công!" : "Delete information successfully!");
            fetchInformation();
        } catch (error) {
            toast.error(vnMode ? "Xóa thông tin thất bại!" : "Delete information failed!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetDefaultInformation = async (informationId) => {
        setIsLoading(true);
        try {
            await dispatch(setDefaultInformation(informationId)).unwrap();
            toast.success(vnMode ? "Đặt thông tin mặc định thành công!" : "Set default information successfully!");
            fetchInformation();
        } catch (error) {
            toast.error(vnMode ? "Đặt thông tin mặc định thất bại!" : "Set default information failed!");
        } finally {
            setIsLoading(false);
        }
    };

    const showModal = (information) => {
        setEditingInformation(information);
        if (information) {
            form.setFieldsValue({
                informationId: information.informationId,
                companyName: information.companyName,
                slogan: information.slogan,
                address: information.address,
                phone: information.phone,
                email: information.email,
                website: information.website,
                facebookLink: information.facebookLink,
                otherLinks: information.otherLinks,
                taxCode: information.taxCode,
                businessLicense: information.businessLicense,
                businessLicenseIssuedDate: dayjs(information.businessLicenseIssuedDate),
                establishedYear: information.establishedYear,
                introduction: information.introduction,
                certification: information.certification,
                state: information.default
            });
            const newFileList = information?.images.map((img, index) => {
                const file = base64ToFile(img.file.data, `image${index + 1}.jpg`);
                return {
                    uid: index.toString(),
                    name: file.name,
                    status: "done",
                    originFileObj: file,
                };
            });
            if (fileList.length === 0) {
                setFileList(newFileList);
            }
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const base64ToFile = (base64Data, filename) => {
        if (!base64Data || !base64Data.startsWith("data:")) {
            const defaultMimeType = "image/jpeg";
            const arr = base64Data.split(",");
            const mime =
                arr.length > 1 ? arr[0].match(/:(.*?);/)[1] : defaultMimeType;
            const bstr = atob(arr[arr.length - 1]);
            const n = bstr.length;
            const u8arr = new Uint8Array(n);

            for (let i = 0; i < n; i++) {
                u8arr[i] = bstr.charCodeAt(i);
            }

            return new File([u8arr], filename, { type: mime });
        }

        try {
            const arr = base64Data.split(",");
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            const n = bstr.length;
            const u8arr = new Uint8Array(n);

            for (let i = 0; i < n; i++) {
                u8arr[i] = bstr.charCodeAt(i);
            }

            return new File([u8arr], filename, { type: mime });
        } catch (error) {
            return null;
        }
    };

    const handleIntroClick = (content) => {
        setIntroContent(content);
        setIsIntroModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsIntroModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingInformation(null);
        form.resetFields();
    };

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
            <div>
                <List
                    itemLayout="vertical"
                    dataSource={informationList}
                    loading={isLoading}
                    renderItem={(item) => (
                        <List.Item key={item.informationId}>
                            <Card
                                title={
                                    <div className="flex justify-between items-center">
                                        <Space>{item.companyName}
                                            {item.default ? <Tag color="green">{vnMode ? "Mặc định" : "Default"}</Tag> : null}
                                        </Space>
                                        <Dropdown
                                            menu={{
                                                items: [
                                                    {
                                                        key: "edit",
                                                        label: vnMode ? "Sửa" : "Edit",
                                                        icon: <EditOutlined />,
                                                        onClick: () => showModal(item),
                                                    },
                                                    {
                                                        key: "setDefault",
                                                        label: vnMode ? "Đặt mặc định" : "Set default",
                                                        disabled: item.default,
                                                        onClick: () => handleSetDefaultInformation(item.informationId),
                                                    },
                                                    {
                                                        key: "delete",
                                                        label: vnMode ? "Xóa" : "Delete",
                                                        icon: <DeleteOutlined />,
                                                        danger: true,
                                                        onClick: () => handleDeleteInformation(item.informationId),
                                                    },
                                                ],
                                            }}
                                        >
                                            <a onClick={(e) => e.preventDefault()}>
                                                <Space>
                                                    <MoreOutlined />
                                                </Space>
                                            </a>
                                        </Dropdown>
                                    </div>
                                }

                            >
                                <div
                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                />
                                <div>
                                    <p><strong>{vnMode ? 'Địa chỉ: ' : 'Address: '}</strong> {item.address}</p>
                                    <p><strong>{vnMode ? 'Số điện thoại: ' : 'Phone number: '}</strong> {item.phone}</p>
                                    <p><strong>{vnMode ? 'Email: ' : 'Email: '}</strong> {item.email}</p>
                                    <p><strong>{vnMode ? 'Slogan: ' : 'Slogan: '}</strong> “{item.slogan}”</p>
                                    <p><strong>{vnMode ? 'Website: ' : 'Website: '}</strong> {item.website}</p>
                                    <p><strong>{vnMode ? 'Facebook: ' : 'Facebook: '}</strong> {item.facebookLink}</p>
                                    <p><strong>{vnMode ? 'Mã số thuế: ' : 'Tax code: '}</strong> {item.taxCode}</p>
                                    <p><strong>{vnMode ? 'Giấy phép kinh doanh: ' : 'Business license: '}</strong> {item.businessLicense}</p>
                                    <p>
                                        <strong>{vnMode ? 'Ngày cấp giấy phép kinh doanh: ' : 'Business license issued date: '}</strong>
                                        {item.businessLicenseIssuedDate
                                            ? dayjs(item.businessLicenseIssuedDate).format('DD/MM/YYYY')
                                            : ''}
                                    </p>
                                    <p><strong>{vnMode ? 'Năm thành lập: ' : 'Established year: '}</strong> {item.establishedYear}</p>
                                    <div>
                                        <strong><span onClick={() => handleIntroClick(item.introduction)} className="text-blue-400 hover:text-blue-500 cursor-pointer">{vnMode ? 'Giới thiệu' : 'Introduction'}</span></strong>
                                    </div>
                                    <p><strong>{vnMode ? 'Chứng nhận: ' : 'Certification: '}</strong> {item.certification}</p>
                                    <p><strong>{vnMode ? 'Ảnh thương hiệu: ' : 'Logo: '}</strong></p>
                                    {item?.images?.length > 0 ? (
                                        item.images.map((image, index) => (
                                            <Image
                                                key={index}
                                                alt="Information"
                                                src={`data:image/jpeg;base64,${image.file?.data}`}
                                                className="object-cover rounded border border-black border-solid"
                                                width={200}
                                            />
                                        ))
                                    ) : (<></>)}
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                    className="mt-4 w-full"
                >
                    {vnMode ? "Thêm thông tin" : "Add Information"}
                </Button>
            </div>
            <Modal
                title={vnMode ? "Giới thiệu" : "Introduction"}
                open={isIntroModalVisible}
                onCancel={handleModalCancel}
                footer={null}
            >
                <div dangerouslySetInnerHTML={{ __html: introContent }} />
            </Modal>
            <Modal
                title={editingInformation ? "Chỉnh sửa thông tin" : "Thêm thông tin"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        {vnMode ? "Hủy" : "Cancel"}
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={isLoading}
                        onClick={() => form.submit()}
                        disabled={!isFormValid}
                    >
                        {editingInformation ? (vnMode ? "Cập nhật" : "Update") : (vnMode ? "Lưu" : "Save")}
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={
                        editingInformation ? handleUpdateInformation : handleCreateInformation
                    }
                    onFieldsChange={handleFormChange}
                >
                    {editingInformation ? (
                        <Form.Item name="informationId" hidden>
                            <Input />
                        </Form.Item>
                    ) : (<></>)}
                    <Form.Item
                        label={vnMode ? "Tên công ty" : "Company name"}
                        name="companyName"
                        rules={[{ required: true, message: vnMode ? "Vui lòng nhập tên công ty!" : "Please enter company name!" }]}
                    >
                        <Input placeholder={vnMode ? "Nhập tên công ty" : "Enter company name"} />
                    </Form.Item>
                    <Form.Item label={vnMode ? "Logo" : "Logo"} name="images" className="">
                        <ImageUpload fileList={fileList} setFileList={setFileList} vnMode={vnMode} info={true} />
                    </Form.Item>
                    <Form.Item label={vnMode ? "Slogan" : "Slogan"} name="slogan">
                        <Input placeholder={vnMode ? "Nhập slogan" : "Enter slogan"} />
                    </Form.Item>
                    <Form.Item
                        label={vnMode ? "Địa chỉ" : "Address"}
                        name="address"
                        rules={[{ required: true, message: vnMode ? "Vui lòng nhập địa chỉ!" : "Please enter address!" }]}
                    >
                        <Input placeholder={vnMode ? "Nhập địa chỉ" : "Enter address"} />
                    </Form.Item>
                    <Form.Item
                        label={vnMode ? "Số điện thoại" : "Phone number"}
                        name="phone"
                        rules={[{ required: true, message: vnMode ? "Vui lòng nhập số điện thoại!" : "Please enter phone number!" }]}
                    >
                        <Input placeholder={vnMode ? "Nhập số điện thoại" : "Enter phone number"} />
                    </Form.Item>
                    <Form.Item
                        label={vnMode ? "Email" : "Email"}
                        name="email"
                        rules={[{ required: true, message: vnMode ? "Vui lòng nhập email!" : "Please enter email!" }]}
                    >
                        <Input type="email" placeholder={vnMode ? "Nhập email" : "Enter email"} />
                    </Form.Item>
                    <Form.Item label={vnMode ? "Website" : "Website"} name="website">
                        <Input placeholder={vnMode ? "Nhập website" : "Enter website"} />
                    </Form.Item>
                    <Form.Item label={vnMode ? "Facebook" : "Facebook"} name="facebookLink">
                        <Input placeholder={vnMode ? "Nhập liên kết Facebook" : "Enter Facebook link"} />
                    </Form.Item>
                    <Form.Item label={vnMode ? "Các liên kết khác" : "Other links"} name="otherLinks">
                        <Input placeholder={vnMode ? "Nhập các liên kết khác" : "Enter other links"} />
                    </Form.Item>
                    <Form.Item
                        label={vnMode ? "Mã số thuế" : "Tax code"}
                        name="taxCode"
                        rules={[{ required: true, message: vnMode ? "Vui lòng nhập mã số thuế!" : "Please enter tax code!" }]}
                    >
                        <Input placeholder={vnMode ? "Nhập mã số thuế" : "Enter tax code"} />
                    </Form.Item>
                    <Form.Item label={vnMode ? "Giấy phép kinh doanh" : "Business license"} name="businessLicense">
                        <Input placeholder={vnMode ? "Nhập giấy phép kinh doanh" : "Enter business license"} />
                    </Form.Item>
                    <Form.Item
                        label={vnMode ? "Ngày cấp giấy phép kinh doanh" : "Business license issued date"}
                        name="businessLicenseIssuedDate"
                    >
                        <DatePicker placeholder={vnMode ? "Chọn ngày" : "Select date"} />
                    </Form.Item>
                    <Form.Item label={vnMode ? "Năm thành lập" : "Established year"} name="establishedYear">
                        <InputNumber placeholder={vnMode ? "Nhập năm thành lập" : "Enter established year"} />
                    </Form.Item>
                    <Form.Item label={vnMode ? "Giới thiệu" : "Introduction"} name="introduction">
                        <TextEditor />
                    </Form.Item>
                    <Form.Item label={vnMode ? "Chứng nhận" : "Certification"} name="certification">
                        <Input placeholder={vnMode ? "Nhập chứng nhận" : "Enter certification"} />
                    </Form.Item>
                    <Form.Item
                        label={vnMode ? "Mặc định" : "Default"}
                        name="state"
                        valuePropName="checked"
                    >
                        <Checkbox
                            disabled={editingInformation && editingInformation.default === true}
                        >
                            {vnMode ? "Đặt làm mặc định" : "Set as default"}
                        </Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </Content>
    );
};

export default InformationPage;