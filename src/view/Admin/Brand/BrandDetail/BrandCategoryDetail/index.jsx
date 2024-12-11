import React, { useEffect, useState } from "react";
import { Form, Input, Upload, Button, Row, Col, notification } from "antd";
import ImgCrop from "antd-img-crop";
import { UploadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  getBrandCategory,
  getBrandCategoryDetail,
  getBrandDetail,
  updateBrand,
  updateBrandCategory,
} from "../../../../../services/brandService";
import { useParams } from "react-router-dom";
import ImageUpload from "../../../../../components/ImageUpload";

const { TextArea } = Input;

const BrandCategoryDetail = () => {
  const [avatar, setAvatar] = useState(null);
  const dispatch = useDispatch();
  const { brandId } = useParams();
  const { brandCategoryId } = useParams();

  const brandCategoryDetail = useSelector((state) => {
    return state?.brand?.brandCategoryDetailItem?.data;
  });

  console.log(111111, brandCategoryDetail);

  const brandImage = brandCategoryDetail?.images;
  const [fileList, setFileList] = useState([]);
  console.log("avatar", avatar);

  const [form] = Form.useForm();
  useEffect(() => {
    dispatch(getBrandCategoryDetail({ brandId, brandCategoryId }))
      .unwrap()
      .then((res) => {
        form.resetFields();
      })
      .catch((err) => {
        console.log(err);
        console.log(brandId, brandCategoryId);
      });
  }, [dispatch]);

  const handleSubmit = (values) => {
    console.log("click");
    console.log(444, fileList);
    console.log(666, brandImage);

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
        });
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

  return (
    <>
      <h1 className="text-lg mb-5">Chi tiết danh mục nhãn hàng</h1>
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
              label="Tên danh mục của nhãn hàng"
              name="brandCategoryName"
              rules={[{ message: "Nhập danh mục của nhãn hàng..." }]}
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
                avatar={avatar}
                setAvatar={setAvatar}
                setFileList={setFileList}
              ></ImageUpload>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item className="flex justify-end">
          <Button htmlType="submit" type="primary">
            Lưu
          </Button>
        </Form.Item>
      </Form>
      {/* New Content Row */}
    </>
  );
};

export default BrandCategoryDetail;
