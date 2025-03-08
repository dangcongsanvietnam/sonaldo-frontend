import { Button, DatePicker, Form, Input, notification, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../../api";
import { ArrowLeftOutlined, EyeInvisibleOutlined, EyeOutlined, GoogleOutlined } from "@ant-design/icons";
import {
  emailValidator,
  passwordValidator,
  phoneNumberValidator,
} from "../../utils/validataData";
import moment from "moment";
import defaultAvatar from "../../assets/download.png";
import AvatarProfile from "../Profile/AvatarProfile";
import './index.css';
import Logo from '../../assets/logo.png'

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
    role: "ROLE_USER"
  });

  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);

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

  const handleNext = async () => {
    try {
      await form.validateFields(["firstName", "lastName", "phoneNumber", "birthday"]);
      setStep(2);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const handleBack = () => setStep(1);

  const isRegister = true;

  return (
    <div className="relative h-screen bg-gray-100">
      <div className="absolute inset-0 bg-gray-200 clip-diagonal"></div>
      <div className="relative flex flex-col items-center justify-center h-full">
        <div className="absolute left-[250px] top-10 text-3xl cursor-pointer text-[#006CB7] hover:text-black" onClick={() => navigate("/")}><ArrowLeftOutlined /></div>
        <div className="justify-center z-50">
          <div className="w-full pb-2 text-center">
            <img src={Logo} alt="LEGO" className="h-20 mx-auto" />
            <h3 className="text-xl font-bold mb-4">Create your adult LEGO account</h3>

            <div className="flex justify-center gap-4 mb-4">
              <Button icon={<GoogleOutlined />} shape="circle" size="large" />
            </div>

            <p className="text-gray-600">Already have an account? <Link to="/login" className="text-blue-500">Sign in</Link></p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Form
            form={form}
            onFinish={handleSubmit}
            className="w-[800px] border px-6 py-5 rounded shadow-md bg-white"
          >
            {step === 1 ? (
              <>
                <h2 className="text-center text-lg font-bold mb-4">Step 1: Personal Details</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Form.Item name="firstName" rules={[{ required: true, message: "Họ là bắt buộc" }]}>
                    <Input placeholder="Họ" className="h-9" />
                  </Form.Item>
                  <Form.Item name="lastName" rules={[{ required: true, message: "Tên là bắt buộc" }]}>
                    <Input placeholder="Tên" className="h-9" />
                  </Form.Item>
                </div>
                <div className="flex space-x-3 justify-center">
                  <Form.Item name="phoneNumber" rules={[{ required: true, message: "Số điện thoại là bắt buộc" }]}>
                    <Input className="h-9" addonBefore="+84" placeholder="Số điện thoại" />
                  </Form.Item>

                  <Form.Item name="birthday" rules={[{ required: true, message: "Ngày sinh là bắt buộc" }]}>
                    <DatePicker className="w-full" placeholder="Chọn ngày sinh" />
                  </Form.Item>
                  <Form.Item name="avatar" valuePropName="fileList">
                    <AvatarProfile
                      user={user}
                      isRegister={isRegister}
                      setAvatar={setAvatar}
                    />
                  </Form.Item>
                </div>

                <div className="text-center">
                  <Button type="primary" className="w-80 py-6 !rounded-full text-lg font-bold mt-2" onClick={handleNext}>
                    Continue
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-center text-lg font-bold mb-4">Step 2: Account Details</h2>

                <Form.Item name="email" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}>
                  <Input placeholder="Email" className="h-9" />
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: "Mật khẩu là bắt buộc" }]}>
                  <Input
                    type={visible ? "text" : "password"}
                    className="h-9"
                    placeholder="Mật khẩu"
                    suffix={
                      <span onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
                        {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </span>
                    }
                  />
                </Form.Item>

                <div className="flex justify-between">
                  <Button onClick={handleBack}>Back</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Register
                  </Button>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}
