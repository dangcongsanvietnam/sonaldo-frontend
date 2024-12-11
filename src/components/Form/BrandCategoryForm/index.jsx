import React, { useEffect, useState } from "react";
import { Form, Input, Button, notification, Row, Col } from "antd";
// import TextEditor from "../../TextEditor";
import TextArea from "antd/es/input/TextArea";
import { useDispatch } from "react-redux";
import {
  addNewBrand,
  addNewBrandCategory,
  getAdminBrands,
  getBrandCategory,
  getBrandDetail,
} from "../../../services/brandService";
import defaultAvatar from "../../../assets/download.png"; // Đường dẫn tới ảnh mặc định
import { useParams } from "react-router-dom";
import { PlusCircleOutlined } from "@ant-design/icons";

const BrandCategoryForm = ({ brandId }) => {
  const [avatar, setAvatar] = useState(null);

  const dispatch = useDispatch();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!avatar) {
      fetch(defaultAvatar)
        .then((res) => {
          console.log("ressss", res);
          res.blob();
        })
        .then((blob) => {
          const file = new File([blob], "default-avatar.png", {
            type: "image/png",
          });
          setAvatar(file);
        });
    }
  }, [avatar]);

  const onFinish = (values) => {
    console.log("Form Values:", values);

    const newBrandCategory = {
      name: values.brandCategory,
      description: values.description,
      files: avatar,
    };

    dispatch(addNewBrandCategory({ newBrandCategory, brandId }))
      .unwrap()
      .then(() => {
        dispatch(getBrandCategory(brandId));
        dispatch(getAdminBrands());
        notification.success({
          message: "Thành công",
          description: "Thêm danh mục thành công",
        });
        form.resetFields();
      })
      .catch((err) => {
        notification.error({
          message: "Thất bại",
          description: "Thêm danh mục thất bại",
        });
      });
  };

  return (
    <div>
      <Form
        form={form}
        name="category_brand_form"
        layout="horizontal"
        onFinish={onFinish}
        style={{ margin: "auto 0" }}
        className="w-1/3"
      >
        <Form.Item
          label="Danh mục thuộc nhãn hàng"
          name="brandCategory"
          rules={[{ message: "Vui lòng nhập danh mục!" }]}
        >
          <Input placeholder="Nhập nhãn hàng ..." />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ message: "Vui lòng nhập mục mô tả ..." }]}
        >
          <TextArea rows={4} placeholder="Nhập mô tả ..."></TextArea>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusCircleOutlined />}
          >
            Thêm
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BrandCategoryForm;
