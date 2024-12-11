import React, { useEffect, useState } from "react";
import { Form, Input, Button, notification } from "antd";
// import TextEditor from "../../TextEditor";
import TextArea from "antd/es/input/TextArea";
import { useDispatch } from "react-redux";
import { addNewBrand, getAdminBrands } from "../../../services/brandService";
import defaultAvatar from "../../../assets/download.png"; // Đường dẫn tới ảnh mặc định
import { PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { Search } = Input;

const BrandForm = () => {
  const [avatar, setAvatar] = useState(null);
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
    console.log("Form Values:", values);

    const newBrand = {
      name: values.brand,
      description: values.description,
      files: avatar,
    };

    dispatch(addNewBrand(newBrand))
      .unwrap()
      .then((res) => {
        console.log(newBrand);
        console.log(res);
        dispatch(getAdminBrands())
          .unwrap()
          .then((res) => {
            notification.success({
              message: "Thành công",
              description: "Thêm thành công",
            });
            form.resetFields();
            navigate("/brand");
          });
      })
      .catch((err) => {
        console.log(err);
        console.log(newBrand);
        notification.error({
          message: "Thất bại",
          description: "Thêm thất bại",
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
        style={{ width: "50%", margin: "auto 0" }}
      >
        <Form.Item
          label="Thêm nhãn hàng"
          name="brand"
          rules={[{ message: "Vui lòng nhập nhãn hàng!" }]}
        >
          <Input placeholder="Nhập nhãn hàng ..." />
        </Form.Item>

        <Form.Item
          label="Mô tả cho nhãn hàng"
          name="description"
          rules={[{ message: "Vui lòng nhập mục mô tả!" }]}
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

export default BrandForm;
