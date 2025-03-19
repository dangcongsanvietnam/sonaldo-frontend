import React, { useState } from "react";
import { Button, Input, Form } from "antd";
import { Link } from "react-router-dom";
import BASE_URL from "../../api";
import { emailValidator } from "../../utils/validataData";
import { MailOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

const ForgetPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    const email = values.email;
    setLoading(true);
    BASE_URL.post("/api/v1/auth/forgot-password", { email })
      .then(() => {
        localStorage.setItem("email", email);
        toast.success(vnMode ? "Vui lòng check mail để xác nhận đổi mật khẩu" : "Please check mail to confirm change password");
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error(vnMode ? "Vui lòng gửi lại email" : "Please send email again");
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="bg-white border rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
        <h3 className="text-2xl font-bold text-blue-600 mb-4">{vnMode ? "Quên Mật Khẩu?" : "Forgor Password?"}</h3>
        <p className="text-gray-600 mb-6">
          {vnMode ? "Vui lòng nhập email của bạn để đặt lại mật khẩu" : "Please fill your email to reset your password"}
        </p>

        <Form
          form={form}
          name="forgetPassword"
          onFinish={onFinish}
          layout="vertical"
          className="text-left"
        >
          <Form.Item
            name="email"
            label={<span className="font-semibold text-gray-700">Email</span>}
            rules={[{ validator: emailValidator }]}
          >
            <Input
              prefix={<MailOutlined className="text-blue-400" />}
              className="rounded-full py-3 px-4 border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              placeholder={vnMode ? "Nhập email của bạn" : "Fill your email"}
            />
          </Form.Item>

          <Form.Item>
            <Button
              loading={loading}
              htmlType="submit"
              type="primary"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white !rounded-full !py-6 text-lg transition"
            >
              {vnMode ? "Gửi Yêu Cầu" : "Send Request"}
            </Button>
          </Form.Item>
        </Form>

        <Link to="/login" className="text-blue-500 hover:underline text-sm flex items-center justify-center gap-2">
          {vnMode ? "Quay lại đăng nhập" : "Go back to login"}
        </Link>
      </div>
    </div>
  );
};

export default ForgetPassword;
