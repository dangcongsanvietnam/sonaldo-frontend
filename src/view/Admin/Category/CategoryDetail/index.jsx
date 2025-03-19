import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col, Spin, Modal, Tooltip, ColorPicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import ImageUpload from "../../../../components/ImageUpload";
import {
  addNewCategoryItem,
  deleteCategoryItem,
  getCategoryDetail,
  updateCategory,
} from "../../../../services/categoryService";
import CategoryItemTable from "../../../../components/CategoryItemTable";
import { AppstoreAddOutlined, DeleteOutlined, LeftOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

const { TextArea, Search } = Input;

const CategoryDetail = () => {
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [addCategoryItemData, setAddCategoryItemData] = useState({
    name: "",
    description: "",
    color: ""
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [categoryItemFileList, setCategoryItemFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const dispatch = useDispatch();
  const { categoryId } = useParams();
  const category = useSelector((state) => {
    return state?.category?.category?.data;
  });
  const categoryImage = category?.images;
  const { vnMode } = useOutletContext();
  const [form] = Form.useForm();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoryDetail = async () => {
      try {
        setLoading(true);
        await dispatch(getCategoryDetail(categoryId)).unwrap();
        form.resetFields();
      } catch (error) {
        toast.error(vnMode ? "Không thể tải chi tiết danh mục." : "Failed to load category detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetail();
  }, [dispatch, categoryId, form]);

  const handleSubmit = (values) => {
    const sortedFileList = [...fileList].reverse();
    const updateValues = {
      name: values?.categoryName,
      description: values?.description,
      files: sortedFileList.map((file) => file?.originFileObj),
      categoryId: categoryId,
      color:
        typeof values?.color === "string"
          ? values.color
          : values?.color?.toHexString() || "#000000",
    };

    if (fileList.length < 1) {
      toast.error(vnMode ? "Bắt buộc phải có ít nhất 1 ảnh" : "Require at least one picture");
      return;
    }

    setLoadingButton(true);
    dispatch(updateCategory(updateValues))
      .unwrap()
      .then(() => {
        dispatch(getCategoryDetail(categoryId)).finally(() => setLoadingButton(false))
        toast.success(vnMode ? "Cập nhật thành công" : "Update successfully");
      })
      .catch(() => {
        setLoadingButton(false)
        toast.error(vnMode ? "Cập nhật thất bại" : "Failed to update");
      })
  };

  useEffect(() => {
    if (categoryImage && categoryImage.length > 0) {
      const newFileList = categoryImage.map((img, index) => {
        const file = base64ToFile(img.file.data, `image${index + 1}.jpg`);
        return {
          uid: index.toString(),
          name: file.name,
          status: "done",
          originFileObj: file,
        };
      });
      setFileList(newFileList);
    } else {
      setFileList([]);
    }
  }, [categoryImage]);

  const base64ToFile = (base64Data, filename) => {
    if (!base64Data || !base64Data.startsWith("data:")) {
      const defaultMimeType = "image/jpeg";
      const arr = base64Data.split(",");
      const mime =
        arr.length > 1 ? arr[0].match(/:(.*?);/)[1] : defaultMimeType; // Lấy MIME type hoặc dùng loại mặc định
      const bstr = atob(arr[arr.length - 1]); // Giải mã base64 thành chuỗi nhị phân
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

  const handleUpdateSelectedProducts = () => {
    setIsUpdateModalVisible(true);
  };

  const handleAddCategoryItem = () => {
    if (!addCategoryItemData.name || !addCategoryItemData.description) {
      toast.error(vnMode ? "Vui lòng điền đầy đủ thông tin danh mục." : "Please complete the information.");
      return;
    }

    const updateValues = {
      name: addCategoryItemData.name,
      description: addCategoryItemData.description,
      files: categoryItemFileList.map((file) => file.originFileObj),
      categoryId: categoryId,
      color: addCategoryItemData.color
    };

    setLoading(true); // Bật loading
    dispatch(addNewCategoryItem(updateValues))
      .unwrap()
      .then(() => {
        dispatch(getCategoryDetail(categoryId)).finally(() => {
          setLoading(false);
        });
        toast.success(vnMode ? "Thêm danh mục con thành công." : "Add new sub-category successfully.");
        setAddCategoryItemData({ name: "", description: "", color: "" });
        setCategoryItemFileList([]);
        setIsUpdateModalVisible(false);
      })
      .catch(() => {
        toast.error(vnMode ? "Thêm danh mục con thất bại." : "Failed to add sub-category");
      })
  };

  const handleDeleteSelectedProducts = () => {
    setModalType("multiple");
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (modalType === "multiple" && selectedRowKeys.length > 0) {
        for (const categoryItemId of selectedRowKeys) {
          await dispatch(deleteCategoryItem({ categoryId, categoryItemId })).unwrap();
        }
        toast.success(vnMode ? "Xóa tất cả danh mục thành công" : "Remove all selected sub-categories successfully");
        setSelectedRowKeys([]);
      }
      dispatch(getCategoryDetail(categoryId));
    } catch (error) {
      toast.error(vnMode ? "Xóa một số danh mục thất bại" : "Failed to remove selected sub-categories");
    } finally {
      setLoading(false);
      setIsDeleteModalVisible(false);
    }
  };

  return (
    <>
      <Spin spinning={loading}>
        <Tooltip title={vnMode ? 'Danh sách danh mục' : 'Category list'}>
          <Button
            icon={<LeftOutlined className="text-blue-600" />}
            onClick={() => navigate('/admin/category')}
            shape="circle"
            size="small"
            className="bg-blue-100 hover:bg-blue-200 mb-10 mr-2"
          />
          {vnMode ? 'Danh sách danh mục' : 'Category list'}
        </Tooltip>
        <Form
          form={form}
          layout="vertical"
          style={{ margin: "0 auto" }}
          initialValues={{
            categoryName: category?.name || "",
            description: category?.description || "",
            color: category?.color || "#000000"
          }}
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={vnMode ? "Tên danh mục" : "Category Name"}
                name="categoryName"
                rules={[
                  {
                    required: true,
                    message: vnMode
                      ? "Nhập tên danh mục ..."
                      : "Enter category name ...",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={vnMode ? "Mô tả danh mục" : "Category Description"}
                name="description"
                rules={[
                  {
                    required: true,
                    message: vnMode
                      ? "Nhập mô tả ..."
                      : "Enter description ...",
                  },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder={
                    vnMode ? "Nhập mô tả ..." : "Enter description ..."
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={vnMode ? "Ảnh danh mục" : "Category Image"}
                name="files"
              >
                <ImageUpload
                  fileList={fileList}
                  setFileList={setFileList}
                />
              </Form.Item>
              <Form.Item
                label={vnMode ? "Màu nền" : "Background Color"}
                name="color"
              >
                <ColorPicker format="hex" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item className="flex justify-end">
            <Button htmlType="submit" type="primary" loading={loadingButton}>
              {vnMode ? "Lưu Danh Mục" : "Save Category"}
            </Button>
          </Form.Item>
        </Form>
        <hr />
        <div className="mt-7">
          <Modal
            title={vnMode ? "Thêm Danh Mục Con" : "Create Category Item"}
            open={isUpdateModalVisible}
            onOk={handleAddCategoryItem}
            onCancel={() => setIsUpdateModalVisible(false)}
            okText={vnMode ? "Tạo" : "Create"}
            cancelText={vnMode ? "Huỷ" : "Cancel"}
            confirmLoading={loading}
          >
            <Form layout="vertical">
              <Form.Item
                label={vnMode ? "Tên danh mục con" : "Category Item Name"}
                name="name"
                rules={[
                  {
                    required: true,
                    message: vnMode
                      ? "Nhập tên danh mục con!"
                      : "Enter category name!",
                  },
                ]}
              >
                <Input
                  value={addCategoryItemData.name}
                  onChange={(e) =>
                    setAddCategoryItemData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
                <small className="text-gray-500">
                  {vnMode
                    ? 'Nhập theo định dạng: "English || Tiếng Việt"'
                    : 'Enter in format: "English || Vietnamese"'}
                </small>
              </Form.Item>
              <Form.Item
                label={vnMode ? "Mô tả" : "Description"}
                name="description"
                rules={[
                  {
                    required: true,
                    message: vnMode
                      ? "Nhập mô tả!"
                      : "Enter description!",
                  },
                ]}
              >
                <TextArea
                  rows={3}
                  value={addCategoryItemData.description}
                  onChange={(e) =>
                    setAddCategoryItemData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                <small className="text-gray-500">
                  {vnMode
                    ? 'Nhập theo định dạng: "English || Tiếng Việt"'
                    : 'Enter in format: "English || Vietnamese"'}
                </small>
              </Form.Item>
              <Form.Item label={vnMode ? "Ảnh danh mục con" : "Category Item Image"}>
                <ImageUpload
                  fileList={categoryItemFileList}
                  setFileList={setCategoryItemFileList}
                />
              </Form.Item>
              <Form.Item
                label={vnMode ? "Màu nền" : "Background Color"}
                name="color"
              >
                <ColorPicker format="hex"
                  onChange={(e) =>
                    setAddCategoryItemData((prev) => ({
                      ...prev,
                      color: e?.toHexString(),
                    }))
                  } />
              </Form.Item>
            </Form>
          </Modal>
          <div className="flex justify-between">
            <h1 className="text-lg mb-5">
              {vnMode ? "Danh mục nhãn hàng" : "Category Items"}
            </h1>
            <div className="grid grid-cols-3 gap-x-3">
              <Button
                type="primary"
                icon={<AppstoreAddOutlined />}
                onClick={handleUpdateSelectedProducts}
              >
                {vnMode ? "Thêm danh mục con" : "Add Subcategory"}
              </Button>
              <Button
                type="primary"
                icon={<DeleteOutlined />}
                danger
                onClick={handleDeleteSelectedProducts}
                disabled={selectedRowKeys.length === 0}
              >
                {vnMode ? "Xóa danh mục đã chọn" : "Delete Selected"}
              </Button>
              <Search
                placeholder={
                  vnMode ? "Nhập ID, tên danh mục con" : "Enter ID or subcategory name"
                }
                onSearch={(value) => setSearchKeyword(value)}
                className="w-auto"
                enterButton
              />
            </div>
          </div>
          <CategoryItemTable
            categoryId={categoryId}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            searchKeyword={searchKeyword}
            vnMode={vnMode}
          />
        </div>
        <Modal
          title={vnMode ? "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn không?" : "Are you sure to delete all selected products"}
          open={isDeleteModalVisible}
          onOk={handleDelete}
          onCancel={() => setIsDeleteModalVisible(false)}
          confirmLoading={loading}
          okText={vnMode ? "Xác nhận" : "Confirm"}
          cancelText={vnMode ? "Huỷ" : "Cancel"}
        >
          <p>{vnMode ? "Hành động này không thể hoàn tác. Vui lòng xác nhận!" : "This action cannot changed. Please confirm!"}</p>
        </Modal>
      </Spin>
    </>
  );
};

export default CategoryDetail;
