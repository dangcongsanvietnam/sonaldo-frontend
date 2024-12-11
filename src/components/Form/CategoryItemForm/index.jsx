import React, { useEffect, useState } from "react";
import { Form, Input, Button, notification, Row, Col } from "antd";
// import TextEditor from "../../TextEditor";
import TextArea from "antd/es/input/TextArea";
import { useDispatch } from "react-redux";

import defaultAvatar from "../../../assets/download.png"; // Đường dẫn tới ảnh mặc định
import { PlusCircleOutlined } from "@ant-design/icons";
import {
  addNewCategoryItem,
  getAdminCategories,
  getCategoryItem,
} from "../../../services/categoryService";
import { getBrandCategory } from "../../../services/brandService";

const CategoryItemForm = ({ categoryId }) => {
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

    const newCategoryItem = {
      name: values.categoryItem,
      description: values.description,
      files: avatar,
    };

    dispatch(addNewCategoryItem({ newCategoryItem, categoryId }))
      .unwrap()
      .then(() => {
        dispatch(getCategoryItem(categoryId));
        dispatch(getAdminCategories());
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
        name="category_item_form"
        layout="horizontal"
        onFinish={onFinish}
        style={{ maxWidth: 400, margin: "auto 0" }}
      >
        <Form.Item
          label="Danh mục cho danh mục sản phẩm"
          name="categoryItem"
          rules={[{ message: "Vui lòng nhập danh mục!" }]}
        >
          <Input placeholder="Nhập danh mục ..." />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ message: "Vui lòng nhập mục mô tả ..." }]}
        >
          <TextArea placeholder="Nhập mô tả ..."></TextArea>
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

export default CategoryItemForm;
