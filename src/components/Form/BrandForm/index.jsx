import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useDispatch } from "react-redux";
import { addNewBrand, getAdminBrands } from "../../../services/brandService";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../../ImageUpload";
import { Bounce, toast, ToastContainer } from "react-toastify";

const BrandForm = ({ vnMode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fileList, setFileList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    if (fileList.length < 1) {
      toast.error(vnMode ? "Cần ít nhất 1 ảnh" : "Require at least one picture");
    } else {
      const newBrand = {
        name: values.brand,
        description: values.description,
        files: fileList.map((file) => file?.originFileObj),
      };

      setIsSaving(true);
      dispatch(addNewBrand(newBrand))
        .unwrap()
        .then(() => {
          dispatch(getAdminBrands())
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
    <div>
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
      <Form
        form={form}
        name="category_brand_form"
        layout="horizontal"
        onFinish={onFinish}
        style={{ width: "50%", margin: "auto 0" }}
      >
        <Form.Item
          label={vnMode ? "Thêm tên nhãn hàng" : "Add Brand Name"}
          name="brand"
          rules={[{ message: vnMode ? "Vui lòng nhập nhãn hàng!" : "Please enter the brand name!" }]}
        >
          <Input placeholder={vnMode ? "Nhập nhãn hàng ..." : "Enter brand name ..."} />
        </Form.Item>

        <Form.Item
          label={vnMode ? "Mô tả cho nhãn hàng" : "Brand Description"}
          name="description"
          rules={[{ message: vnMode ? "Vui lòng nhập mục mô tả!" : "Please enter a description!" }]}
        >
          <TextArea rows={4} placeholder={vnMode ? "Nhập mô tả ..." : "Enter description ..."}></TextArea>
        </Form.Item>

        <Form.Item label={vnMode ? "Ảnh sản phẩm" : "Product Image"}>
          <ImageUpload fileList={fileList} setFileList={setFileList} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusCircleOutlined />}
            loading={isSaving}
          >
            {vnMode ? "Thêm" : "Add"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BrandForm;
