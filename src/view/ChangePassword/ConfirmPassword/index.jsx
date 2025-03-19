import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import BASE_URL from "../../../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ChangePasswordForm = ({ token, vnMode }) => {
  const [form] = Form.useForm();
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [buttonLoading, setButtonLoading] = useState(false);
  const role = localStorage.getItem("role")

  const onFinish = (values) => {
    setButtonLoading(true);
    const { newPassword, confirmPassword } = values;
    if (newPassword === confirmPassword) {

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
          toast.success(vnMode ? "Đổi mật khẩu thành công" : "Change password successfully");
          if (role === "ROLE_USER") {
            navigate("/change-password");
          } else if (role === "ROLE_MANAGER") {
            navigate("/admin/change-password");
          } else {
            navigate("/super-admin/change-password");
          }
          setButtonLoading(false)
        })
        .catch(() => {
          toast.error(vnMode ? "Đổi mật khẩu thất bại" : "Failed to change password");
          setButtonLoading(false)
        });
    } else {
      toast.error(vnMode ? "Mật khẩu không trùng khớp" : "Passwords does not match");
      setPasswordsMatch(false);
    }
  };

  const onValuesChange = () => {
    const { newPassword, confirmPassword } = form.getFieldsValue();
    if (newPassword && confirmPassword) {
      setPasswordsMatch(newPassword === confirmPassword);
      setPassword(newPassword);
    }
  };

  return (
    <>
      <Form
        form={form}
        name="change_password"
        onFinish={onFinish}
        onValuesChange={onValuesChange}
      >
        <Form.Item
          label={vnMode ? "Mật khẩu mới" : "New Password"}
          name="newPassword"
          rules={[{ required: true, message: vnMode ? "Vui lòng nhập mật khẩu mới" : "Please fill your new password" }]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label={vnMode ? "Nhập lại mật khẩu mới" : "Confirm Password"}
          name="confirmPassword"
          rules={[
            { required: true, message: vnMode ? "Vui lòng nhập lại mật khẩu mới" : "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(vnMode ? "Mật khẩu không trùng khớp" : "Password and confirm password are not matched"));
              },
            }),
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button loading={buttonLoading} type="primary" htmlType="submit" disabled={!passwordsMatch}>
            {vnMode ? "Đổi mật khẩu" : "Change Password"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ChangePasswordForm;
