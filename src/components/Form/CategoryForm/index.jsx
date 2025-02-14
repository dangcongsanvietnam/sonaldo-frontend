import React, { useEffect, useState } from "react";
import { Form, Input, Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useDispatch } from "react-redux";
import defaultAvatar from "../../../assets/download.png";
import { PlusCircleOutlined } from "@ant-design/icons";
import {
  addNewCategory,
  getAdminCategories,
} from "../../../services/categoryService";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../../ImageUpload";
import { Bounce, toast, ToastContainer } from "react-toastify";

const CategoryForm = ({ vnMode }) => {
  const [fileList, setFileList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    if (fileList.length < 1) {
      toast.error(vnMode ? "Cần ít nhất 1 ảnh" : "Require at least one picture");
    } else {
      const newCategory = {
        name: values.category,
        description: values.description,
        files: fileList.map((file) => file?.originFileObj),
      };

      setIsSaving(true);
      dispatch(addNewCategory(newCategory))
        .unwrap()
        .then(() => {
          dispatch(getAdminCategories())
            .unwrap()
            .then(() => {
              toast.success(vnMode ? "Thêm thành công" : "Add successfully");
              setTimeout(() => {
                setIsSaving(false);
                navigate("/admin/brand");
              }, 1000);
            })
        })
        .catch(() => {
          toast.error(vnMode ? "Thêm thất bại" : "Failed to add");
          setIsSaving(false);
        })
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
      <div className="flex justify-between ">
        <Form
          form={form}
          name="category_form"
          layout="horizontal"
          onFinish={onFinish}
          style={{ width: "50%", margin: "auto 0" }}
        >
          <Form.Item label={vnMode ? "Tên danh mục" : "Category Name"} name="category">
            <Input placeholder={vnMode ? "Nhập tên danh mục ..." : "Enter category name ..."} />
          </Form.Item>

          <Form.Item label={vnMode ? "Mô tả cho danh mục" : "Description"} name="description">
            <TextArea placeholder={vnMode ? "Nhập mô tả ..." : "Enter description ..."}></TextArea>
          </Form.Item>
          <Form.Item label={vnMode ? "Ảnh danh mục" : "Category Image"}>
            <ImageUpload vnMode={vnMode} fileList={fileList} setFileList={setFileList} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusCircleOutlined />}
              loading={isSaving}
            >
              {vnMode ? "Tạo Danh Mục" : "Create Category"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default CategoryForm;
