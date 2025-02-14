import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col, Spin, Modal, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import ImageUpload from "../../../../components/ImageUpload";
import { PlusOutlined, DeleteOutlined, LeftOutlined } from '@ant-design/icons';
import {
  addNewBrandCategory,
  deleteBrandCategory,
  getAdminBrands,
  getBrandDetail,
  updateBrand,
} from "../../../../services/brandService";
import BrandCategoryTable from "../../../../components/BrandCategoryTable";
import { Bounce, toast, ToastContainer } from "react-toastify";

const { TextArea, Search } = Input;

const BrandDetail = () => {
  const navigate = useNavigate();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [addBrandCategoryData, setAddBrandCategoryData] = useState({
    name: "",
    description: "",
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [brandCategoryFileList, setBrandCategoryFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const { brandId } = useParams();
  const { vnMode } = useOutletContext();
  const brand = useSelector((state) => {
    return state?.brand?.brand?.data;
  });
  const brandImage = brand?.images;
  const [form] = Form.useForm();
  useEffect(() => {
    const fetchBrandDetail = async () => {
      try {
        setLoading(true);
        await dispatch(getBrandDetail(brandId)).unwrap();
        form.resetFields();
      } catch (error) {
        toast.error(vnMode ? "Không thể tải chi tiết thương hiệu." : "Cannot load brand detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrandDetail();
  }, [dispatch, brandId, form]);

    useEffect(() => {
      dispatch(getAdminBrands());
    }, [dispatch]);

  const handleSubmit = (values) => {
    const sortedFileList = [...fileList].reverse();
    const updateValues = {
      name: values?.brandName,
      description: values?.description,
      files: sortedFileList.map((file) => file?.originFileObj),
      brandId: brandId,
    };

    if (fileList.length < 1) {
      toast.error(vnMode ? "Bắt buộc phải có ít nhất 1 ảnh" : "Require at least one picture");
      return;
    }

    setLoadingButton(true);
    dispatch(updateBrand(updateValues))
      .unwrap()
      .then(() => {
        dispatch(getBrandDetail(brandId)).finally(() => setLoadingButton(false))
        toast.success(vnMode ? "Cập nhật thành công" : "Update successfully");
      })
      .catch(() => {
        setLoadingButton(false)
        toast.error(vnMode ? "Cập nhật thất bại" : "Failed to update");
      })
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

      // Tạo đối tượng File từ mảng Uint8Array
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      return null;
    }
  };

  const handleUpdateSelectedProducts = () => {
    setIsUpdateModalVisible(true);
  };

  const handleAddBrandCategory = () => {
    if (!addBrandCategoryData.name || !addBrandCategoryData.description) {
      toast.error(vnMode ? "Vui lòng điền đầy đủ thông tin thương hiệu." : "Please complete the form.");
      return;
    }

    const updateValues = {
      name: addBrandCategoryData.name,
      description: addBrandCategoryData.description,
      files: brandCategoryFileList.map((file) => file.originFileObj),
      brandId: brandId,
    };

    setLoading(true);
    dispatch(addNewBrandCategory(updateValues))
      .unwrap()
      .then(() => {
        dispatch(getBrandDetail(brandId)).finally(() => {
          setLoading(false);
        });
        toast.success(vnMode ? "Thêm thương hiệu con thành công." : "Successsfully added sub-brand");
        setAddBrandCategoryData({ name: "", description: "" });
        setBrandCategoryFileList([]);
        setIsUpdateModalVisible(false);
      })
      .catch(() => {
        toast.success(vnMode ? "Thêm thương hiệu con lỗi." : "Failed to add sub-brand");
      })
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      for (const brandCategoryId of selectedRowKeys) {
        await dispatch(deleteBrandCategory({ brandId, brandCategoryId })).unwrap();
      }
      toast.success(vnMode ? "Xóa tất cả sản phẩm thành công" : "Successfully deleted all products");
      setSelectedRowKeys([]);
      dispatch(getBrandDetail(brandId)).finally(() => setLoading(false));
      setVisible(false);
    } catch (error) {
      setLoading(false);
      toast.error(vnMode ? "Xóa một số sản phẩm thất bại" : "Failed to delete some products");
    }
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
        <Tooltip title={vnMode ? 'Danh sách thương hiệu' : 'Brand list'}>
          <Button
            icon={<LeftOutlined className="text-blue-600" />}
            onClick={() => navigate('/admin/brand')}
            shape="circle"
            size="small"
            className="bg-blue-100 hover:bg-blue-200 mb-10 mr-2"
          />
          {vnMode ? 'Danh sách thương hiệu' : 'Brand list'}
        </Tooltip>
        <Form
          form={form}
          layout="vertical"
          style={{ margin: "0 auto" }}
          initialValues={{
            brandName: brand?.name || "",
            description: brand?.description || "",
          }}
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={vnMode ? "Tên thương hiệu" : "Brand Name"}
                name="brandName"
                rules={[{ required: true, message: vnMode ? "Nhập tên thương hiệu ..." : "Enter brand name ..." }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={vnMode ? "Mô tả" : "Description"}
                name="description"
                rules={[{ required: true, message: vnMode ? "Nhập mô tả ..." : "Enter description ..." }]}
              >
                <TextArea rows={4} />
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
        <div className="mt-7">
          <Modal
            title={vnMode ? "Thêm thương hiệu con" : "Add Sub-brand"}
            open={isUpdateModalVisible}
            onOk={handleAddBrandCategory}
            onCancel={() => setIsUpdateModalVisible(false)}
            okText={vnMode ? "Thêm" : "Add"}
            cancelText={vnMode ? "Hủy" : "Cancel"}
            confirmLoading={loading}
          >
            <Form layout="vertical">
              <Form.Item
                label={vnMode ? "Tên thương hiệu con" : "Sub-brand Name"}
                rules={[{ required: true, message: vnMode ? "Nhập tên thương hiệu con!" : "Enter sub-brand name!" }]}
              >
                <Input
                  value={addBrandCategoryData.name}
                  onChange={(e) =>
                    setAddBrandCategoryData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item
                label={vnMode ? "Mô tả" : "Description"}
                rules={[{ required: true, message: vnMode ? "Nhập mô tả!" : "Enter description!" }]}
              >
                <TextArea
                  rows={3}
                  value={addBrandCategoryData.description}
                  onChange={(e) =>
                    setAddBrandCategoryData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item label={vnMode ? "Ảnh sản phẩm" : "Product Image"}>
                <ImageUpload
                  fileList={brandCategoryFileList}
                  setFileList={setBrandCategoryFileList}
                />
              </Form.Item>
            </Form>
          </Modal>
          <div className="flex justify-between">
            <h1 className="text-lg mb-5">
              {vnMode ? "Danh sách nhãn hàng con" : "Sub-brand List"}
            </h1>
            <div className="grid-cols-3 gap-x-3 grid">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleUpdateSelectedProducts}
              >
                {vnMode ? "Thêm thương hiệu con" : "Add Sub-brand"}
              </Button>
              <Button
                type="primary"
                icon={<DeleteOutlined />}
                danger
                onClick={() => setVisible(true)}
                disabled={selectedRowKeys.length === 0}
              >
                {vnMode ? "Xóa sản phẩm đã chọn" : "Delete Selected"}
              </Button>
              <Search
                placeholder={vnMode ? "Nhập ID, tên thương hiệu con" : "Enter ID or sub-brand name"}
                onSearch={(value) => setSearchKeyword(value)}
                className="w-auto"
                enterButton
              />
            </div>
          </div>
          <BrandCategoryTable
            brandId={brandId}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            searchKeyword={searchKeyword}
          />
        </div>
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
          <p>{vnMode ? "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn không?" : "Are you sure you want to delete the selected products?"}</p>
        )}
      </Modal>
      </Spin>
    </>
  );
};

export default BrandDetail;
