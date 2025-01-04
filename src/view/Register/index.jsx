import { Button, DatePicker, Form, Input, notification, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../../api";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import {
  emailValidator,
  passwordValidator,
  phoneNumberValidator,
} from "../../utils/validataData";
import moment from "moment";
// It's recommended to set locale in entry file globaly.
import defaultAvatar from "../../assets/download.png"; // Đường dẫn tới ảnh mặc định
import AvatarProfile from "../Profile/AvatarProfile";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    birthday: "2000-01-01T00:00:00.000Z",
    avatar: null,
    email: "string",
    password: "",
    googleLoginFlag: false,
  });

  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setVisible(!visible);
  };

  const [avatar, setAvatar] = useState(null);

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

  const handleChange = (changedValues) => {
    console.log(changedValues);
    setUser((prev) => ({
      ...prev,
      ...changedValues,
      avatar: avatar,
      birthday: selectedDate,
    }));

  };

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    BASE_URL.post("api/v1/auth/signup", user, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        if (response.status === 200) {
          navigate("/notification", {
            state: {
              message: "Đăng ký tài khoản thành công, vui lòng vào email để xác thực tài khoản",
            },
          });
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
                Object.values(error?.response.data)[0],
            });
            break;

          default:
            notification.error({
              message: "Cảnh báo",
              description: "Lỗi hệ thống.",
            });
            break;
        }
      }).finally(() => {
        setLoading(false);
      })
  };

  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    if (date) {
      // Thiết lập thời gian mặc định là 00:00:00.000
      const dateString = moment(date)
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        .toISOString();
      setSelectedDate(dateString);
    } else {
      setSelectedDate(null);
      console.log("Date is not selected");
    }
  };

  const isRegister = true;

  return (
    <>
      <div className="py-3 flex items-center justify-center">
        <Form
          form={form}
          onSubmit={handleSubmit}
          onValuesChange={handleChange}
          className="w-[400px] border px-6 py-5 rounded shadow-md flex flex-col gap-3"
        >
          <h3 className="text-center font-bold uppercase text-[20px]">
            Đăng ký tài khoản
          </h3>
          <div className="flex flex-col gap-2 ">
            <label className="font-semibold" htmlFor="">
              Họ
            </label>
            <Form.Item
              name="firstName"
              rules={[{ required: true, message: "Họ là bắt buộc" }]}
            >
              <Input className="h-9" />
            </Form.Item>
          </div>
          <div className="flex flex-col gap-2 ">
            <label className="font-semibold" htmlFor="">
              Tên
            </label>
            <Form.Item
              name="lastName"
              rules={[{ required: true, message: "Tên là bắt buộc" }]}
            >
              <Input className="h-9" />
            </Form.Item>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold" htmlFor="phoneNumber">
              Số điện thoại
            </label>
            <Form.Item
              name="phoneNumber"
              rules={[{ required: true, validator: phoneNumberValidator }]}
            >
              <Input className="h-9" addonBefore="+84" />
            </Form.Item>
          </div>
          <div className="flex flex-col gap-2 ">
            <label className="font-semibold" htmlFor="">
              Ngày sinh
            </label>
            <Form.Item
              name="birthday"
              rules={[{ required: true, message: "Ngày sinh là bắt buộc" }]}
            >
              <DatePicker onChange={handleDateChange} />
            </Form.Item>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold" htmlFor="">
              Ảnh đại diện
            </label>
            <Form.Item name="avatar" valuePropName="fileList">
              <AvatarProfile
                user={user}
                isRegister={isRegister}
                setAvatar={setAvatar}
              />
            </Form.Item>
          </div>

          <div className="flex flex-col gap-2 ">
            <label className="font-semibold" htmlFor="">
              Email
            </label>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  validator: emailValidator,
                },
              ]}
            >
              <Input className="h-9" />
            </Form.Item>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold" htmlFor="password">
              Mật khẩu
            </label>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  validator: passwordValidator,
                },
              ]}
            >
              <Input
                type={visible ? "text" : "password"}
                className="h-9"
                suffix={
                  <span
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </span>
                }
              />
            </Form.Item>
            {/* Lỗi sẽ tự động được hiển thị bởi Ant Design */}
          </div>

          <div>
            <Button
              onClick={handleSubmit}
              htmlType="submit"
              type="primary"
              className="w-full h-9"
              loading={loading}
            >
              Đăng ký
            </Button>
          </div>
          <div className="text-center">
            <span>Bạn đã có tài khoản? </span>
            <Link to="/login">Đăng nhập</Link>
          </div>
        </Form>
      </div>
    </>
  );
}
