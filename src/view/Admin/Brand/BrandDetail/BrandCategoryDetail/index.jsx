import React, { useEffect, useState } from "react";
import { Form, Input, Upload, Button, Row, Col, notification, Spin, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import ImageUpload from "../../../../../components/ImageUpload";
import {
  getBrandCategoryDetail,
  removeProductsFromBrandCategory,
  updateBrandCategory,
} from "../../../../../services/brandService";
import { getProductsByBrandCategory } from "../../../../../services/productService";
import ProductTable from "../../../../../components/ProductTable";
import { AddOutlined, DeleteOutline } from "@mui/icons-material";
import AddProductModal from "../../../../../components/Modal/AddProductModal";
import AddProductModalBrandCategory from "../../../../../components/Modal/AddProductModalBrandCategory";
const { TextArea, Search } = Input;

const BrandCategoryDetail = () => {
  const [avatar, setAvatar] = useState(null);
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

  const brandCategoryDetail = useSelector((state) => {
    return state?.brand?.brandCategoryDetailItem?.data;
  });

  const brandImage = brandCategoryDetail?.images;
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  useEffect(() => {
    setLoading(true);
    try {
      dispatch(getBrandCategoryDetail({ brandId, brandCategoryId }))
        .unwrap()
        .then((res) => {
          form.resetFields();
        })
        .catch((err) => {
          console.log(err);
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
      console.error("Error fetching products:", error);
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

      notification.error({
        message: "Thất bại",
        description: "Bắt buộc phải có ít nhất 1 ảnh",
      });
    } else {
      setLoadingButton(true);
      dispatch(updateBrandCategory(updateValues))
        .unwrap()
        .then(() => {
          dispatch(getBrandCategoryDetail({ brandId, brandCategoryId }));
          notification.success({
            message: "Thành công",
            description: "Cập nhật thành công",
          });
        })
        .catch((err) => {
          console.log(err);
          notification.error({
            message: "Thất bại",
            description: "Cập nhật thất bại",
          });
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

  const handleDeleteSelectedProducts = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn khỏi danh mục con này không?",
      onOk: async () => {
        setLoadingTable(true);
        try {
          const updatedProducts = {
            productIds: selectedRowKeys,
            brandCategoryId: brandCategoryId
          }
          console.log(updatedProducts)
          await dispatch(removeProductsFromBrandCategory(updatedProducts)).unwrap().then(() => {
            fetchProducts().finally(() => setLoadingTable(false));
          });
          notification.success({ message: "Xóa tất cả sản phẩm thành công" });
          setSelectedRowKeys([]);
        } catch (error) {
          notification.error({ message: "Xóa một số sản phẩm thất bại" });
          console.error("Lỗi khi xóa nhiều sản phẩm:", error);
        }
      },
    });
  };

  const base64ToFile = (base64Data, filename) => {
    // Kiểm tra xem base64Data có phải là chuỗi base64 hợp lệ không
    if (!base64Data || !base64Data.startsWith("data:")) {
      console.warn("Invalid base64 data:", base64Data);
      // Nếu không có MIME type, giả định là `image/jpeg`
      const defaultMimeType = "image/jpeg";
      const arr = base64Data.split(",");
      const mime =
        arr.length > 1 ? arr[0].match(/:(.*?);/)[1] : defaultMimeType; // Lấy MIME type hoặc dùng loại mặc định
      const bstr = atob(arr[arr.length - 1]); // Giải mã base64 thành chuỗi nhị phân
      const n = bstr.length;
      const u8arr = new Uint8Array(n);

      // Chuyển đổi chuỗi nhị phân thành mảng Uint8Array
      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }

      // Tạo đối tượng File từ mảng Uint8Array
      return new File([u8arr], filename, { type: mime });
    }

    try {
      // Tách phần MIME type và phần base64
      const arr = base64Data.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      const n = bstr.length;
      const u8arr = new Uint8Array(n);

      // Chuyển đổi chuỗi nhị phân thành mảng Uint8Array
      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }

      // Tạo đối tượng File từ mảng Uint8Array
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error("Error converting base64 to file:", error);
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
        <h1 className="text-lg mb-5">Chi tiết danh mục con</h1>
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
                label="Tên danh mục của danh mục"
                name="brandCategoryName"
                rules={[{ message: "Nhập danh mục ..." }]}
              >
                <Input initialValues={brandCategoryDetail?.name} />
              </Form.Item>
              <Form.Item
                label="Mô tả"
                name="description"
                rules={[{ message: "Nhập mô tả ..." }]}
              >
                <TextArea
                  rows={4}
                  placeholder="There are many variations of passages of Lorem Ipsum available."
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ảnh" name="files">
                <ImageUpload
                  fileList={fileList}
                  setAvatar={setAvatar}
                  setFileList={setFileList}
                ></ImageUpload>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item className="flex justify-end">
            <Button htmlType="submit" type="primary" loading={loadingButton}>
              Lưu
            </Button>
          </Form.Item>
        </Form>
        <hr />
        {/* New Content Row */}
        <div className="flex justify-between mt-6">
          <h1 className="text-lg mb-5">Sản phẩm thuộc danh mục con</h1>
        </div>
        <div className="grid grid-cols-3 gap-x-3">
          <Button
            type="primary"
            icon={<AddOutlined />}
            onClick={handleOpenAddProductModal}
          >
            Thêm sản phẩm
          </Button>
          <Button
            type="primary"
            icon={<DeleteOutline />}
            danger
            onClick={handleDeleteSelectedProducts}
            disabled={selectedRowKeys.length === 0}
          >
            Xóa sản phẩm đã chọn khỏi danh mục con
          </Button>
          <Search
            placeholder="Nhập ID, tên danh mục con"
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
        />
        <ProductTable
          loading={loadingTable}
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
          searchKeyword={searchKeyword}
          products={products}
        ></ProductTable>
      </Spin >
    </>
  );
};

export default BrandCategoryDetail;
