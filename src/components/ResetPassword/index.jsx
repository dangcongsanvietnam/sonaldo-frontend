import React, { useEffect, useState } from "react";
import { Button, Input, Form, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { passwordValidator } from "../../utils/validataData";
import BASE_URL from "../../api";
import defaultAvatar from "../../assets/download.png";
import Cookies from "js-cookie";

const ResetPassword = () => {
  const [form] = Form.useForm();
  const urlParams = new URLSearchParams(location.search);

  const token = urlParams.get("token");
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const firstName = localStorage.getItem("first-name");
  const lastName = localStorage.getItem("last-name");
  const picture = localStorage.getItem("picture");
  const [avatarGoogle, setAvatarGoogle] = useState(null);

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
      .catch((error) => console.log("Lỗi tải ảnh từ Google", error));
  }, [picture]);

  const onFinish = (values) => {
    const password = values?.password;
    console.log(password);
    const updatedUser = {
      ...user,
      avatar: avatarGoogle,
      password: password,
    };

    console.log(2, user);

    console.log("Success:", values);
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
            .then((response) => {
              alert("Đổi mật khẩu thành công");
              localStorage.clear("email");
              localStorage.clear("first-name");
              localStorage.clear("last-name");
              localStorage.clear("picture");

              navigate("/login");
            })
            .catch((error) => {
              alert("Đổi mật khẩu thất bại");
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
                notification.success({
                  message: "Thông báo",
                  description: "Đăng nhập tài khoản thành công",
                });
                navigate("/");
              }
            })
            .catch((error) => {
              console.log(error);
              const statusCode = error?.response?.status;
              switch (statusCode) {
                case 400:
                  notification.error({
                    message: "Cảnh báo",
                    description: Object.values(error?.response.data)[0],
                  });
                  break;
                case 500:
                  notification.error({
                    message: "Cảnh báo",
                    description:
                      "Đã có lỗi xảy ra. Vui lòng liên hệ với quản trị viên để được trợ giúp.",
                  });
                  break;

                default:
                  notification.error({
                    message: "Cảnh báo",
                    description: "Lỗi hệ thống.",
                  });
                  break;
              }
            });
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="ra-login-container">
      <Form
        form={form}
        name="resetPassword"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        // onValuesChange={handleChange}
        layout="vertical"
        className="form"
      >
        <h3 className="heading mb-6">Thiết Lập Mật Khẩu</h3>
        <div className="text-center">
          <span>Tạo mật khẩu mới cho {email}</span>
        </div>
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            {
              validator: passwordValidator, // Sử dụng validator đã định nghĩa
            },
          ]}
        >
          <Input.Password
            className="form-input"
            placeholder="Nhập mật khẩu mới"
          />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-center pb-4">
            <Button htmlType="submit" type="primary" className="flex-1">
              Gửi
            </Button>
          </div>
          <Link to="/login" className="flex justify-center">
            Quay lại
          </Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPassword;
