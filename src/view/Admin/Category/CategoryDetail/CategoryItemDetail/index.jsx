import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col, Spin, Modal, Tooltip, ColorPicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import ImageUpload from "../../../../../components/ImageUpload";
import {
  getCategoryItemDetail,
  removeProductsFromCategoryItem,
  updateCategoryItem,
} from "../../../../../services/categoryService";
import { getProductsByCategoryItem } from "../../../../../services/productService";
import ProductTable from "../../../../../components/ProductTable";
import AddProductModal from "../../../../../components/Modal/AddProductModal";
const { TextArea, Search } = Input;
import { PlusOutlined, DeleteOutlined, LeftOutlined } from '@ant-design/icons';
import { toast } from "react-toastify";

const CategoryItemDetail = () => {
  const dispatch = useDispatch();
  const { categoryId } = useParams();
  const { categoryItemId } = useParams();
  const categoryItemDetail = useSelector((state) => state?.category?.categoryItemItem?.data);
  const categories = useSelector((state) => state?.category?.categories?.data);
  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isAddProductModalVisible, setIsAddProductModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const { vnMode } = useOutletContext();
  const navigate = useNavigate();

  const categoryImage = categoryItemDetail?.images;
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  useEffect(() => {
    setLoading(true);
    try {
      dispatch(getCategoryItemDetail({ categoryId, categoryItemId }))
        .unwrap()
        .then(() => {
          form.resetFields();
        })
        .catch(() => {
        });
    } finally {
      setLoading(false);
    }

  }, [dispatch]);

  useEffect(() => {
    fetchProducts();
  }, [dispatch]);

  const fetchProducts = async () => {
    // setLoading(true);
    try {
      const productsData = await dispatch(getProductsByCategoryItem(categoryItemId)).unwrap();
      setProducts(productsData.data);
    } catch (error) {
    } finally {
      // setLoading(false);
    }
  };

  const handleSubmit = (values) => {
    const sortedFileList = [...fileList].reverse();

    const updateValues = {
      name: values?.categoryItemName,
      description: values?.description,
      files: sortedFileList.map((file) => file?.originFileObj),
      categoryId: categoryId,
      categoryItemId: categoryItemId,
      color:
        typeof values?.color === "string"
          ? values.color
          : values?.color?.toHexString() || "#000000",
    };

    if (fileList.length < 1) {
      dispatch(getCategoryItemDetail({ categoryId, categoryItemId }));

      toast.error(vnMode ? "Cần ít nhất 1 ảnh" : "Require at least one picture");
    } else {
      setLoadingButton(true);
      dispatch(updateCategoryItem(updateValues))
        .unwrap()
        .then(() => {
          dispatch(getCategoryItemDetail({ categoryId, categoryItemId }));
          toast.success(vnMode ? "Cập nhật thành công" : "Update successfully");
        })
        .catch(() => {
          toast.error(vnMode ? "Cập nhật thất bại" : "Failed to update");
        }).finally(() => setLoadingButton(false));
    }
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

  const handleDeleteSelectedProducts = () => {
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    setLoadingTable(true);
    try {
      const updatedProducts = {
        productIds: selectedRowKeys,
        categoryItemId: categoryItemId
      };

      await dispatch(removeProductsFromCategoryItem(updatedProducts)).unwrap();

      await fetchProducts();
      toast.success(vnMode ? "Xóa tất cả sản phẩm thành công" : "Removed all selected products successfully");
      setSelectedRowKeys([]);
    } catch (error) {
      toast.error(vnMode ? "Xóa một số sản phẩm thất bại" : "Failed to remove selected products");
    } finally {
      setLoadingTable(false);
      setIsDeleteModalVisible(false);
    }
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

  const handleOpenAddProductModal = () => {
    setIsAddProductModalVisible(true);
  };

  const handleCloseAddProductModal = () => {
    setIsAddProductModalVisible(false);
  };

  return (
    <>
      <Spin spinning={loading}>
        <Tooltip title={vnMode ? 'Danh mục cha' : 'Category'}>
          <Button
            icon={<LeftOutlined className="text-blue-600" />}
            onClick={() => navigate(`/admin/category/${categoryId}`)}
            shape="circle"
            size="small"
            className="bg-blue-100 hover:bg-blue-200 mb-10 mr-2"
          />
          {vnMode ? 'Danh mục cha' : 'Category'}
        </Tooltip>
        <Form
          form={form}
          layout="vertical"
          style={{ margin: "0 auto" }}
          initialValues={{
            categoryItemName: categoryItemDetail?.name || "",
            description: categoryItemDetail?.description || "",
            color: categoryItemDetail?.color || ""
          }}
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={vnMode ? "Tên danh mục của danh mục" : "Category Item Name"}
                name="categoryItemName"
                rules={[{ message: vnMode ? "Nhập danh mục ..." : "Enter category ..." }]}
              >
                <Input
                  placeholder={
                    vnMode ? "Nhập tên danh mục con..." : "Enter sub-category name..."
                  }
                />
              </Form.Item>
              <Form.Item
                label={vnMode ? "Mô tả" : "Description"}
                name="description"
                rules={[{ message: vnMode ? "Nhập mô tả ..." : "Enter description ..." }]}
              >
                <TextArea
                  rows={4}
                  placeholder={
                    vnMode
                      ? "Nhập mô tả cho danh mục con..."
                      : "Enter description for sub-category..."
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={vnMode ? "Ảnh" : "Image"} name="files">
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
              {vnMode ? "Lưu" : "Save"}
            </Button>
          </Form.Item>
        </Form>
        <hr />
        <div className="flex justify-between mt-6">
          <h1 className="text-lg mb-5">
            {vnMode ? "Sản phẩm thuộc danh mục con" : "Products in Sub-Category"}
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-x-3">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAddProductModal}
          >
            {vnMode ? "Thêm sản phẩm" : "Add Product"}
          </Button>
          <Button
            type="primary"
            icon={<DeleteOutlined />}
            danger
            onClick={handleDeleteSelectedProducts}
            disabled={selectedRowKeys.length === 0}
          >
            {vnMode ? "Xóa sản phẩm đã chọn khỏi danh mục con" : "Remove Selected Products"}
          </Button>
          <Search
            placeholder={
              vnMode ? "Nhập ID, tên danh mục con" : "Enter ID or sub-category name"
            }
            onSearch={(value) => setSearchKeyword(value)}
            className="w-auto"
            enterButton
          />
        </div>
        <AddProductModal
          setLoadingTable={setLoadingTable}
          isVisible={isAddProductModalVisible}
          onClose={handleCloseAddProductModal}
          currentCategoryItemId={categoryItemId}
          fetchProducts={fetchProducts}
          vnMode={vnMode}
          categories={categories}
        />
        <ProductTable
          loading={loadingTable}
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
          searchKeyword={searchKeyword}
          products={products}
          vnMode={vnMode}
        />
        <Modal
          title={vnMode ? "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn khỏi danh mục con này không?" : "Are you sure you want to remove the selected products from this subcategory?"}
          open={isDeleteModalVisible}
          onOk={handleDelete}
          onCancel={() => setIsDeleteModalVisible(false)}
          confirmLoading={loadingTable}
          okText={vnMode ? "Xác nhận" : "Confirm"}
          cancelText={vnMode ? "Hủy" : "Cancel"}
        >
          <p>{vnMode ? "Hành động này không thể hoàn tác. Vui lòng xác nhận!" : "This action cannot be undone. Please confirm!"}</p>
        </Modal>
      </Spin>
    </>

  );
};

export default CategoryItemDetail;
