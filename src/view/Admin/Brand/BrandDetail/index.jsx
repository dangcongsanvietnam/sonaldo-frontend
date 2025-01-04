import React, { useEffect, useState } from "react";
import { Form, Input, Upload, Button, Row, Col, notification, Spin, Modal } from "antd";
import ImgCrop from "antd-img-crop";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import ImageUpload from "../../../../components/ImageUpload";
import {
  addNewBrandCategory,
  deleteBrandCategory,
  getBrandDetail,
  updateBrand,
} from "../../../../services/brandService";
import BrandCategoryTable from "../../../../components/BrandCategoryTable";
import { AddOutlined, DeleteOutline } from "@mui/icons-material";

const { TextArea, Search } = Input;

const BrandDetail = () => {
  const [avatar, setAvatar] = useState(null);
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
  const dispatch = useDispatch();
  const { brandId } = useParams();
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
        notification.error({
          message: "Lỗi",
          description: "Không thể tải chi tiết thương hiệu.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBrandDetail();
  }, [dispatch, brandId, form]);

  const handleSubmit = (values) => {
    const sortedFileList = [...fileList].reverse();
    const updateValues = {
      name: values?.brandName,
      description: values?.description,
      files: sortedFileList.map((file) => file?.originFileObj),
      brandId: brandId,
    };

    if (fileList.length < 1) {
      notification.error({
        message: "Thất bại",
        description: "Bắt buộc phải có ít nhất 1 ảnh",
      });
      return;
    }

    setLoadingButton(true);
    dispatch(updateBrand(updateValues))
      .unwrap()
      .then(() => {
        dispatch(getBrandDetail(brandId)).finally(() => setLoadingButton(false))
        notification.success({
          message: "Thành công",
          description: "Cập nhật thành công",
        });
      })
      .catch(() => {
        setLoadingButton(false)
        notification.error({
          message: "Thất bại",
          description: "Cập nhật thất bại",
        });
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
      console.error("Error converting base64 to file:", error);
      return null;
    }
  };

  const handleUpdateSelectedProducts = () => {
    setIsUpdateModalVisible(true);
  };

  const handleAddBrandCategory = () => {
    if (!addBrandCategoryData.name || !addBrandCategoryData.description) {
      notification.error({
        message: "Thất bại",
        description: "Vui lòng điền đầy đủ thông tin thương hiệu.",
      });
      return;
    }

    const updateValues = {
      name: addBrandCategoryData.name,
      description: addBrandCategoryData.description,
      files: brandCategoryFileList.map((file) => file.originFileObj),
      brandId: brandId,
    };

    setLoading(true); // Bật loading
    dispatch(addNewBrandCategory(updateValues))
      .unwrap()
      .then(() => {
        dispatch(getBrandDetail(brandId)).finally(() => {
          setLoading(false); // Tắt loading
        });
        notification.success({
          message: "Thành công",
          description: "Thêm thương hiệu con thành công.",
        });
        setAddBrandCategoryData({ name: "", description: "" });
        setBrandCategoryFileList([]); // Reset danh sách file
        setIsUpdateModalVisible(false);
      })
      .catch(() => {
        notification.error({
          message: "Thất bại",
          description: "Thêm thương hiệu con thất bại.",
        });
      })
  };

  const handleDeleteSelectedProducts = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn không?",
      onOk: async () => {
        setLoading(true);
        try {
          for (const brandCategoryId of selectedRowKeys) {
            await dispatch(deleteBrandCategory({ brandId, brandCategoryId })).unwrap();
          }
          notification.success({ message: "Xóa tất cả sản phẩm thành công" });
          setSelectedRowKeys([]); // Reset danh sách đã chọn
          dispatch(getBrandDetail(brandId)).finally(() => {
            setLoading(false);
          });
        } catch (error) {
          setLoading(false);
          notification.error({ message: "Xóa một số sản phẩm thất bại" });
          console.error("Lỗi khi xóa nhiều sản phẩm:", error);
        }
      },
    });
  };

  console.log(searchKeyword)

  return (
    <>
      <Spin spinning={loading}>
        <h1 className="text-lg mb-5"> Chi tiết thương hiệu sản phẩm </h1>
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
                label="Tên thương hiệu"
                name="brandName"
                rules={[{ message: "Nhập thương hiệu ..." }]}
              >
                <Input initialValues={brand?.name} />
              </Form.Item>
              <Form.Item
                label="Mô tả"
                name="description"
                rules={[{ message: "Nhập mô tả ..." }]}
              >
                <TextArea
                  rows={4}
                  placeholder=""
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
        {/* New Content Row */}
        <hr />
        <div className="mt-7">
          <Modal
            title="Thêm thương hiệu con"
            visible={isUpdateModalVisible}
            onOk={handleAddBrandCategory}
            onCancel={() => setIsUpdateModalVisible(false)}
            okText="Thêm"
            cancelText="Hủy"
            confirmLoading={loading}
          >
            <Form layout="vertical">
              <Form.Item
                label="Tên thương hiệu con"
                required
                rules={[{ required: true, message: "Nhập tên thương hiệu con!" }]}
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
                label="Mô tả"
                rules={[{ required: true, message: "Nhập mô tả!" }]}
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
              <Form.Item label="Ảnh sản phẩm">
                <ImageUpload
                  fileList={brandCategoryFileList}
                  setFileList={setBrandCategoryFileList}
                  setAvatar={setAvatar}
                />
              </Form.Item>
            </Form>
          </Modal>
          <div className="flex justify-between">
            <h1 className="text-lg mb-5">Danh sách nhãn hàng con</h1>
            <div className="grid-cols-3 gap-x-3 grid">
              <Button
                type="primary"
                icon={<AddOutlined />}
                onClick={handleUpdateSelectedProducts}
              >
                Thêm thương hiệu con
              </Button>
              <Button
                type="primary"
                icon={<DeleteOutline />}
                danger
                onClick={handleDeleteSelectedProducts}
                disabled={selectedRowKeys.length === 0} // Chỉ bật khi có sản phẩm được chọn
              >
                Xóa sản phẩm đã chọn
              </Button>
              <Search
                placeholder="Nhập ID, tên thương hiệu con"
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
          ></BrandCategoryTable>
        </div>
      </Spin>
    </>
  );
};

export default BrandDetail;
