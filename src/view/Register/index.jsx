import { Button, DatePicker, Dropdown, Form, Input } from "antd";
import React, { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import BASE_URL from "../../api";
import { ArrowLeftOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import './index.css';
import Logo from '../../assets/logo.png'

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { vnMode, languageItems } = useOutletContext();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);

  const togglePasswordVisibility = () => {
    setVisible(!visible);
  };

  const handleSubmit = (values) => {
    setLoading(true);
    const dateString = moment(values.birthday)
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .toISOString();
    const user = {
      ...values,
      birthday: dateString,
      googleLoginFlag: false,
      role: "ROLE_USER",
      avatar: null,
    }
    BASE_URL.post("api/v1/auth/signup", user, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        if (response.status === 200) {
          navigate("/notification", {
            state: {
              message: vnMode ? "Đăng ký tài khoản thành công, vui lòng vào email để xác thực tài khoản" : "Register email succesfully, please check your email to verify account",
            },
          });
        }
      })
      .catch(() => {
        setLoading(false);
      }).finally(() => {
        setLoading(false);
      })
  };

  const handleNext = async () => {
    try {
      await form.validateFields(["firstName", "lastName", "phoneNumber", "birthday"]);
      setStep(2);
    } catch (error) {
    }
  };
  const handleBack = () => setStep(1);

  return (
    <div className="relative min-h-screen bg-gray-100">
      <div className="absolute inset-0 bg-gray-200 clip-diagonal"></div>
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
        <Dropdown
          menu={{ items: languageItems }}
          placement="bottomRight"
          arrow
          className="absolute right-4 top-4 md:right-10 md:top-10"
        >
          <i className="text-xl md:text-2xl">
            <svg viewBox="0 0 24 24" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true">
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
          </i>
        </Dropdown>

        <div
          className="absolute left-4 top-4 md:left-[250px] md:top-10 text-xl md:text-3xl cursor-pointer text-[#006CB7] hover:text-black"
          onClick={() => navigate("/")}
        >
          <ArrowLeftOutlined />
        </div>

        <div className="text-center">
          <img src={Logo} alt="LEGO" className="h-16 md:h-20 mx-auto" />
          <h3 className="text-lg md:text-xl font-bold mb-3">
            {vnMode ? "Tạo tài khoản Baybee® của bạn" : "Create your Baybee® account"}
          </h3>
          <p className="text-gray-600 text-sm md:text-base">
            {vnMode ? "Bạn đã có tài khoản?" : "Already have an account?"}{" "}
            <Link to="/login" className="text-blue-500">
              {vnMode ? "Đăng nhập" : "Sign in"}
            </Link>
          </p>
        </div>

        <div className="w-full max-w-md md:max-w-lg">
          <Form
            form={form}
            onFinish={handleSubmit}
            className="w-full border px-4 py-5 md:px-6 md:py-6 rounded shadow-md bg-white"
          >
            {step === 1 ? (
              <div>
                <h2 className="text-center text-lg font-bold mb-4">
                  {vnMode ? "Bước 1: Thông tin cá nhân" : "Step 1: Personal Details"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Form.Item name="firstName" rules={[{ required: true, message: vnMode ? "Họ là bắt buộc" : "Firstname is required" }]}>
                    <Input placeholder={vnMode ? "Họ" : "Firstname"} className="h-9" />
                  </Form.Item>
                  <Form.Item name="lastName" rules={[{ required: true, message: vnMode ? "Tên là bắt buộc" : "Lastname is required" }]}>
                    <Input placeholder={vnMode ? "Tên" : "Lastname"} className="h-9" />
                  </Form.Item>
                </div>
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                  <Form.Item className="w-full" name="phoneNumber" rules={[{ required: true, message: vnMode ? "Số điện thoại là bắt buộc" : "Phone number is required" }]}>
                    <Input className="h-9" addonBefore="+84" placeholder={vnMode ? "Số điện thoại" : "Phone Number"} />
                  </Form.Item>
                  <Form.Item className="w-full" name="birthday" rules={[{ required: true, message: vnMode ? "Ngày sinh là bắt buộc" : "Birthday is required" }]}>
                    <DatePicker className="w-full" placeholder={vnMode ? "Chọn ngày sinh" : "Choose Birthday"} />
                  </Form.Item>
                </div>
                <div className="text-center">
                  <Button type="primary" className="w-full md:w-80 py-3 md:py-6 !rounded-full text-lg font-bold mt-2" onClick={handleNext}>
                    {vnMode ? "Tiếp tục" : "Continue"}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-center text-lg font-bold mb-4">{vnMode ? "Bước 2: Chi tiết tài khoản" : "Step 2: Account Details"}</h2>
                <Form.Item name="email" rules={[{ required: true, message: vnMode ? "Vui lòng nhập tên đăng nhập!" : "Please enter your username!" }]}>
                  <Input placeholder="Email" className="h-9" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: "Mật khẩu là bắt buộc" }]}>
                  <Input
                    type={visible ? "text" : "password"}
                    className="h-9"
                    placeholder={vnMode ? "Mật khẩu" : "Password"}
                    suffix={
                      <span onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
                        {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </span>
                    }
                  />
                </Form.Item>
                <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-0">
                  <Button className="w-full md:w-auto" onClick={handleBack}>
                    {vnMode ? "Quay lại" : "Back"}
                  </Button>
                  <Button type="primary" className="w-full md:w-auto" htmlType="submit" loading={loading}>
                    {vnMode ? "Đăng ký" : "Register"}
                  </Button>
                </div>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>

  );
}
