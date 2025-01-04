import React, { useEffect, useState } from "react";
import { Form, Input, Button, notification } from "antd";
// import TextEditor from "../../TextEditor";
import TextArea from "antd/es/input/TextArea";
import { useDispatch } from "react-redux";
import defaultAvatar from "../../../assets/download.png"; // Đường dẫn tới ảnh mặc định
import { PlusCircleOutlined } from "@ant-design/icons";
import {
  addNewCategory,
  getAdminCategories,
} from "../../../services/categoryService";
import { Navigate, useNavigate } from "react-router-dom";
import ImageUpload from "../../ImageUpload";
const { Search } = Input;

const CategoryForm = () => {
  const [avatar, setAvatar] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
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
    const newCategory = {
      name: values.category,
      description: values.description,
      files: fileList.length < 1 ? fileList.map((file) => file?.originFileObj) : avatar,
    };

    setIsSaving(true);
    dispatch(addNewCategory(newCategory))
      .unwrap()
      .then((res) => {
        console.log(newCategory);
        console.log(res);
        dispatch(getAdminCategories())
          .unwrap()
          .then((res) => {
            notification.success({
              message: "Thành công",
              description: "Thêm thành công",
            });

            navigate("/admin/category");
            form.resetFields();
          }).finally(() => setIsSaving(false));
      })
      .catch((err) => {
        console.log(err);
        console.log(newCategory);
        notification.error({
          message: "Thất bại",
          description: "Thêm thất bại",
        });
      });
  };

  return (
    <div className="flex justify-between ">
      <Form
        form={form}
        name="category_form"
        layout="horizontal"
        onFinish={onFinish}
        style={{ width: "50%", margin: "auto 0" }}
      >
        <Form.Item label="Thêm danh mục" name="category">
          <Input placeholder="Nhập danh mục ..." />
        </Form.Item>

        <Form.Item label="Mô tả cho danh mục" name="description">
          <TextArea placeholder="Nhập mô tả ..."></TextArea>
        </Form.Item>
        <Form.Item label="Ảnh sản phẩm">
          <ImageUpload fileList={fileList} setAvatar={setAvatar} setFileList={setFileList} />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusCircleOutlined />}
            loading={isSaving}
          >
            Thêm
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CategoryForm;
