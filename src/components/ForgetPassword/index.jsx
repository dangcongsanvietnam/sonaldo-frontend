import React from "react";
import { Button, Input, Form, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../../api";
import { emailValidator } from "../../utils/validataData";

const ForgetPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log("Success:", values);
    console.log(values.email);
    const email = values.email;
    // Thực hiện các hành động sau khi người dùng gửi form, ví dụ: gọi API gửi email đặt lại mật khẩu
    BASE_URL.post("/api/v1/auth/forgot-password", { email })
      .then((res) => {
        console.log(res);
        localStorage.setItem("email", email);
        notification.success({
          message: "Thành công",
          description: "Vui lòng check mail để xác nhận đổi mật khẩu",
        });
      })
      .catch(() => {
        notification.error({
          message: "Thất bại",
          description: "Vui lòng gửi lại email",
        });
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="ra-login-container">
      <Form
        form={form}
        name="forgetPassword"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        layout="vertical"
        className="form"
      >
        <h3 className="heading">Quên mật khẩu</h3>
        <div className="text-center">
          <span>Vui lòng nhập Email của bạn để đặt lại mật khẩu</span>
        </div>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              validator: emailValidator,
            },
          ]}
        >
          <Input className="form-input" placeholder="Nhập email của bạn" />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-center">
            <Button htmlType="submit" type="primary" className="flex-1">
              Gửi
            </Button>
          </div>
        </Form.Item>
        <Form.Item>
          <Link to="/login" className="flex justify-center">
            Quay lại
          </Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgetPassword;
