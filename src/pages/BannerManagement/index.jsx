import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout, Table, Button, Modal, Form, Input, Upload, Switch, Select, message, Cascader, Tag } from "antd";
import { PlusOutlined, UploadOutlined, EyeOutlined } from "@ant-design/icons";
import {
    getAllBanners,
    createBanner,
    deleteBanner,
    setDefaultBanner,
} from "../../services/bannerService";
import { useLoading } from "../../provider/LoadingProvider";
import { toast } from "react-toastify";
import { getAdminCategories } from "../../services/categoryService";

const { Content } = Layout;
const { Option } = Select;

const BannerManagementPage = () => {
    const dispatch = useDispatch();
    const { bannerList, loading } = useSelector((state) => state.banner);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const { startLoading, stopLoading } = useLoading();
    const [selectedBanner, setSelectedBanner] = useState(null);
    const categoryItem = useSelector((state) => state?.category?.categories?.data);

    useEffect(() => {
        fetchBanners();
        dispatch(getAdminCategories());
    }, [dispatch]);

    const fetchBanners = () => {
        startLoading();
        dispatch(getAllBanners())
            .unwrap()
            .catch(() => toast.error("Failed to load banners!"))
            .finally(() => stopLoading());
    };

    const categoryOptions = Array.isArray(categoryItem)
        ? categoryItem.map((category) => ({
            label: category?.categoryName,
            value: category?.categoryId,
            children: Array.isArray(category.categoryItems)
                ? category.categoryItems.map((subCategory) => ({
                    label: subCategory?.name,
                    value: subCategory?.categoryItemId,
                }))
                : [],
        }))
        : [];

    const handleCreateBanner = async (values) => {

        const categoryId = values.category?.[0] ?? null;
        const categoryItemId = values.category?.[1] ?? null;

        const category = categoryOptions.find((cat) => cat.value === categoryId);
        const subCategory = category?.children?.find((sub) => sub.value === categoryItemId);

        const formattedCategory = {
            categoryItemId: subCategory ? `${subCategory.value}` : null,
            categoryItemName: subCategory ? `${subCategory.label}` : null,
        };


        const newInformation = {
            content: values.content,
            titles: values.titles,
            name: values.name,
            categoryItemId: formattedCategory.categoryItemId,
            categoryItemName: formattedCategory.categoryItemName,
            image: fileList.length > 0 ? fileList[0].originFileObj : null,
            isActive: values.isActive === true ? 1 : 0,
            categoryId: categoryId
        };

        dispatch(createBanner(newInformation))
            .unwrap()
            .then(() => {
                toast.success("Banner created successfully!");
                fetchBanners();
                setIsModalVisible(false);
                form.resetFields();
                setFileList([]);
            })
            .catch(() => toast.error("Failed to create banner!"));
    };

    const handleDeleteBanner = (bannerId) => {
        dispatch(deleteBanner(bannerId))
            .unwrap()
            .then(() => {
                toast.success("Banner deleted successfully!");
                fetchBanners();
            })
            .catch(() => toast.error("Failed to delete banner!"));
    };

    const handleSetDefaultBanner = (bannerId) => {
        dispatch(setDefaultBanner(bannerId))
            .unwrap()
            .then(() => {
                toast.success("Banner set as default!");
                fetchBanners();
            })
            .catch(() => toast.error("Failed to set default banner!"));
    };

    const handleViewBanner = (banner) => {
        setSelectedBanner(banner);
        setIsViewModalVisible(true);
    };

    const columns = [
        { title: "ID", dataIndex: "bannerId", key: "bannerId" },
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Content", dataIndex: "content", key: "content" },
        {
            title: "Image",
            dataIndex: "images",
            key: "images",
            render: (image) => <img src={`data:image/jpeg;base64,${image[0]?.file.data}`} alt="banner" width={100} />,
        },
        {
            title: "Default",
            dataIndex: "active",
            key: "active",
            render: (isDefault) => (
                isDefault ? <Tag color="green">Default</Tag> : <Tag color="red">Not Default</Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <>
                    <Button icon={<EyeOutlined />} onClick={() => handleViewBanner(record)}>
                        View
                    </Button>
                    <Button onClick={() => handleSetDefaultBanner(record.bannerId)}>Set Default</Button>
                    <Button danger onClick={() => handleDeleteBanner(record.bannerId)}>
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    return (
        <Content>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                Create Banner
            </Button>
            <Table dataSource={bannerList} columns={columns} loading={loading === "pending"} rowKey="bannerId" />

            <Modal
                title="Create Banner"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} onFinish={handleCreateBanner} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="content" label="Content" rules={[{ required: true, message: "Content is required" }]}>
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                        label="Category"
                        name="category"
                        rules={[{ required: true, message: "Category is required" }]}
                    >
                        <Cascader options={categoryOptions} maxTagCount="responsive" />
                    </Form.Item>
                    <Form.Item name="isActive" label="Active" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="titles" label="Titles">
                        <Select mode="tags" placeholder="Enter titles" />
                    </Form.Item>
                    <Form.Item label="Upload Image">
                        <Upload
                            beforeUpload={() => false}
                            listType="picture"
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList.slice(-1))}
                        >
                            {fileList.length < 1 && <Button icon={<UploadOutlined />}>Upload</Button>}
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="View Banner"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={null}
            >
                {selectedBanner && (
                    <div>
                        <p><strong>Name:</strong> {selectedBanner.name}</p>
                        <p><strong>Content:</strong> {selectedBanner.content}</p>
                        <p><strong>Category:</strong> {selectedBanner.categoryItemId} - {selectedBanner.categoryItemName}</p>
                        <p><strong>Active:</strong> {selectedBanner.active ? "Yes" : "No"}</p>
                        <p><strong>Titles:</strong> {selectedBanner.titles?.join(", ")}</p>
                        <img src={`data:image/jpeg;base64,${selectedBanner?.images[0]?.file.data}`} alt="banner" width={200} />
                    </div>
                )}
            </Modal>
        </Content>
    );
};

export default BannerManagementPage;
