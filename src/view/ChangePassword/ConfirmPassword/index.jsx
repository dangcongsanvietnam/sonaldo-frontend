import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import BASE_URL from "../../../api";
import { useNavigate } from "react-router-dom";

const ChangePasswordForm = ({ token }) => {
  const [form] = Form.useForm();
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onFinish = (values) => {
    const { newPassword, confirmPassword } = values;
    if (newPassword === confirmPassword) {
      // Thêm logic để đổi mật khẩu ở đây

      BASE_URL.put(
        "/api/v1/auth/new-password",
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then(() => {
          alert("Đổi mật khẩu thành công");
          navigate("/change-password");
        })
        .catch(() => {
          alert("Đổi mật khẩu thất bại");
        });
    } else {
      message.error("Mật khẩu không trùng khớp");
      setPasswordsMatch(false);
    }
  };

  const onValuesChange = (changedValues) => {
    const { newPassword, confirmPassword } = form.getFieldsValue();
    if (newPassword && confirmPassword) {
      setPasswordsMatch(newPassword === confirmPassword);
      setPassword(newPassword);
    }
  };

  return (
    <Form
      form={form}
      name="change_password"
      onFinish={onFinish}
      onValuesChange={onValuesChange}
    >
      <Form.Item
        label="Mật khẩu mới"
        name="newPassword"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label="Nhập lại mật khẩu mới"
        name="confirmPassword"
        rules={[
          { required: true, message: "Vui lòng nhập lại mật khẩu mới" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Mật khẩu không trùng khớp"));
            },
          }),
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={!passwordsMatch}>
          Đổi mật khẩu
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChangePasswordForm;
