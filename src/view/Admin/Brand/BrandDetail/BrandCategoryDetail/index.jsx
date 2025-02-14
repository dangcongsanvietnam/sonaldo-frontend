import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col, Spin, Modal, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import ImageUpload from "../../../../../components/ImageUpload";
import {
  getBrandCategoryDetail,
  removeProductsFromBrandCategory,
  updateBrandCategory,
} from "../../../../../services/brandService";
import { getProductsByBrandCategory } from "../../../../../services/productService";
import ProductTable from "../../../../../components/ProductTable";
import AddProductModalBrandCategory from "../../../../../components/Modal/AddProductModalBrandCategory";
import { PlusOutlined, DeleteOutlined, LeftOutlined } from '@ant-design/icons';
import { Bounce, toast, ToastContainer } from "react-toastify";

const { TextArea, Search } = Input;

const BrandCategoryDetail = () => {
  const dispatch = useDispatch();
  const { brandId } = useParams();
  const { brandCategoryId } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isAddProductModalVisible, setIsAddProductModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const { vnMode } = useOutletContext();
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const brandCategoryDetail = useSelector((state) => state?.brand?.brandCategoryDetailItem?.data);
  const brands = useSelector((state) => state?.brand?.brands?.data);


  const brandImage = brandCategoryDetail?.images;
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  useEffect(() => {
    setLoading(true);
    try {
      dispatch(getBrandCategoryDetail({ brandId, brandCategoryId }))
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
      const productsData = await dispatch(getProductsByBrandCategory(brandCategoryId)).unwrap();
      setProducts(productsData.data);
    } catch (error) {
    } finally {
      // setLoading(false);
    }
  };

  const handleSubmit = (values) => {
    const sortedFileList = [...fileList].reverse();

    const updateValues = {
      name: values?.brandCategoryName,
      description: values?.description,
      files: sortedFileList.map((file) => file?.originFileObj),
      brandId: brandId,
      brandCategoryId: brandCategoryId,
    };

    if (fileList.length < 1) {
      dispatch(getBrandCategoryDetail({ brandId, brandCategoryId }));

      toast.error(vnMode ? "Bắt buộc phải có ít nhất 1 ảnh" : "Require at least one picture");
    } else {
      setLoadingButton(true);
      dispatch(updateBrandCategory(updateValues))
        .unwrap()
        .then(() => {
          dispatch(getBrandCategoryDetail({ brandId, brandCategoryId }));
          toast.success(vnMode ? "Cập nhật thành công" : "Successfully updated");
        })
        .catch(() => {
          toast.error(vnMode ? "Cập nhật thất bại" : "Failed to update");
        }).finally(() => setLoadingButton(false));
    }
  };

  useEffect(() => {
    if (brandImage && brandImage.length > 0) {
      const newFileList = brandImage.map((img, index) => {
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
    }
  }, [brandImage, fileList.length]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const updatedProducts = {
        productIds: selectedRowKeys,
        brandCategoryId: brandCategoryId
      };

      await dispatch(removeProductsFromBrandCategory(updatedProducts)).unwrap();
      await fetchProducts();
      toast.success(vnMode ? "Xóa tất cả sản phẩm thành công" : "Successfully deleted all products");
      setSelectedRowKeys([]);
      setVisible(false);
    } catch (error) {
      toast.error(vnMode ? "Xóa một số sản phẩm thất bại" : "Failed to delete some products");
    } finally {
      setLoading(false);
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
      <Spin spinning={loading}>
        <Tooltip title={vnMode ? 'Thương hiệu cha' : 'Brand'}>
          <Button
            icon={<LeftOutlined className="text-blue-600" />}
            onClick={() => navigate(`/admin/brand/${brandId}`)}
            shape="circle"
            size="small"
            className="bg-blue-100 hover:bg-blue-200 mb-10 mr-2"
          />
          {vnMode ? 'Thương hiệu cha' : 'Brand'}
        </Tooltip>
        <Form
          form={form}
          layout="vertical"
          style={{ margin: "0 auto" }}
          initialValues={{
            brandCategoryName: brandCategoryDetail?.name || "",
            description: brandCategoryDetail?.description || "",
          }}
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={vnMode ? "Tên danh mục của danh mục" : "Brand Category Name"}
                name="brandCategoryName"
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
            onClick={() => setVisible(true)}
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
        <AddProductModalBrandCategory
          setLoadingTable={setLoadingTable}
          isVisible={isAddProductModalVisible}
          onClose={handleCloseAddProductModal}
          currentBrandItemId={brandCategoryId}
          fetchProducts={fetchProducts}
          vnMode={vnMode}
          brands={brands}
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
          title={vnMode ? "Xác nhận xóa" : "Confirm Deletion"}
          open={visible}
          onCancel={() => setVisible(false)}
          onOk={handleDelete}
          confirmLoading={loading}
        >
          {loading ? (
            <Spin />
          ) : (
            <p>{vnMode ? "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn khỏi thương hiệu con này không?" : "Are you sure you want to delete the selected products from this sub-brand?"}</p>
          )}
        </Modal>
      </Spin>
    </>

  );
};

export default BrandCategoryDetail;
