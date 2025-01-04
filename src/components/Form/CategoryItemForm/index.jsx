import React, { useEffect, useState } from "react";
import { Form, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import defaultAvatar from "../../../assets/download.png";
import ImageUpload from "../../ImageUpload";

const CategoryItemForm = ({ setAddCategoryItemData }) => {
  const [avatar, setAvatar] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

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

  const handleValuesChange = (changedValues, allValues) => {
    const updatedData = {
      ...allValues,
      files: fileList.map((file) => file.originFileObj || file),
    };
    setAddCategoryItemData(updatedData);
  };

  return (
    <div>
      <Form
        form={form}
        name="category_item_form"
        layout="horizontal"
        onValuesChange={handleValuesChange}
        style={{ maxWidth: 400, margin: "auto 0" }}
      >
        <Form.Item
          label="Danh mục cho danh mục sản phẩm"
          name="name"
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
        <Form.Item label="Ảnh sản phẩm">
          <ImageUpload fileList={fileList} setAvatar={setAvatar} setFileList={setFileList} />
        </Form.Item>
      </Form>
    </div>
  );
};

export default CategoryItemForm;
