import React, { useEffect, useState } from "react";
import { Button, Input, Form } from "antd";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { passwordValidator } from "../../utils/validataData";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import BASE_URL from "../../api";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [form] = Form.useForm();
  const urlParams = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(false);
  const token = urlParams.get("token");
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const firstName = localStorage.getItem("first-name");
  const lastName = localStorage.getItem("last-name");
  const picture = localStorage.getItem("picture");
  const [avatarGoogle, setAvatarGoogle] = useState(null);
  const [state, setState] = useState(true);
  const {vnMode} = useOutletContext();

  const user = {
    firstName: firstName,
    lastName: lastName,
    phoneNumber: "",
    birthday: "2000-01-01T00:00:00.000Z",
    avatar: avatarGoogle,
    email: email,
    password: "",
    googleLoginFlag: true,
  };

  useEffect(() => {
    fetch(picture)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], "google-avatar.png", {
          type: "image/png",
        });
        setAvatarGoogle(file);
      })
      .catch();
  }, [picture]);

  const onFinish = (values) => {
    setLoading(true);
    const password = values?.password;
    const updatedUser = {
      ...user,
      avatar: avatarGoogle,
      password: password,
      role: "ROLE_USER"
    };

    {
      token
        ? BASE_URL.put(
          "api/v1/auth/reset-password",
          { password },
          {
            params: {
              token,
            },
          }
        )
          .then(() => {
            alert(vnMode ? "Đổi mật khẩu thành công" : "Change password succesfully");
            localStorage.clear("email");
            localStorage.clear("first-name");
            localStorage.clear("last-name");
            localStorage.clear("picture");
            navigate("/login");
          })
          .catch(() => {
            alert(vnMode ? "Đổi mật khẩu thất bại" : "Failed to change password");
          })
        : BASE_URL.post("api/v1/auth/signup", updatedUser, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
          .then((response) => {
            console.log(response);
            if (response.status === 201) {
              Cookies.set("token", response.data.jwt);
              localStorage.clear("email");
              localStorage.clear("first-name");
              localStorage.clear("last-name");
              localStorage.clear("picture");
              setState(false);
              setLoading(false);

              setTimeout(() => {
                navigate("/");
              }, 1000);
            }
          })
          .catch((error) => {
            toast(error);
          });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="bg-white rounded-3xl shadow-lg border p-8 max-w-md w-full text-center">
        <h3 className="text-2xl font-bold text-blue-700 mb-4">{vnMode ? "Thiết Lập Mật Khẩu" : "Change Password"}</h3>
        <p className="text-gray-600 mb-6">
          {vnMode ? "Hãy tạo mật khẩu mới cho" : "Please create new password for"} <span className="font-bold text-blue-600">{email}</span>
        </p>
        {state ? <LockOutlined className="text-blue-500 text-5xl mx-auto mb-4" /> : <UnlockOutlined className="text-blue-500 text-5xl mx-auto mb-4" />}

        <Form form={form} name="resetPassword" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="password"
            label={<span className="font-semibold text-gray-700">{vnMode ? "Mật khẩu mới" : "New Password"}</span>}
            rules={[{ validator: passwordValidator }]}
          >
            <Input.Password
              className="rounded-full py-3 px-4 border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              placeholder={vnMode ? "Nhập mật khẩu mới" : "Enter new password"}
            />
          </Form.Item>

          <Form.Item>
            <Button
              loading={loading}
              htmlType="submit"
              type="primary"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white !rounded-full !py-6 text-lg transition"
            >
              {vnMode ? "Gửi" : "Send"}
            </Button>
          </Form.Item>
        </Form>

        <Link to="/login" className="text-blue-500 hover:underline text-sm">
          {vnMode ? "Quay lại" : "Go back"}
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
