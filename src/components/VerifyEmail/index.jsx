import React, { useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { Card, Button, Typography, Spin, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import BASE_URL from "../../api";

const { Title, Text } = Typography;

const VerifyEmail = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const jwt = urlParams.get("jwt");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(null);
  const { vnMode } = useOutletContext();

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      await BASE_URL.post(
        "api/v1/auth/verify-email",
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
      setVerified(true);
      message.success(vnMode ? "Xác thực email thành công" : "Email verified successfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setVerified(false);
      message.error(vnMode ? "Xác thực email thất bại" : "Failed to verify email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-96 p-6 shadow-lg rounded-xl text-center">
        <Title level={3}>{vnMode ? "Xác thực Email" : "Email Verification"}</Title>
        <Text className="block mb-4">
          {vnMode
            ? "Nhấn nút bên dưới để xác thực email của bạn."
            : "Click the button below to verify your email."}
        </Text>
        {loading ? (
          <Spin size="large" />
        ) : verified === true ? (
          <div className="text-green-500">
            <CheckCircleOutlined className="text-3xl" />
            <Text className="block mt-2">{vnMode ? "Xác thực email thành công!" : "Email verified successfully!"}</Text>
          </div>
        ) : verified === false ? (
          <div className="text-red-500">
            <CloseCircleOutlined className="text-3xl" />
            <Text className="block mt-2">{vnMode ? "Xác thực thất bại." : "Verification failed."}</Text>
          </div>
        ) : (
          <Button type="primary" onClick={handleVerifyEmail} className="w-full">
            {vnMode ? "Xác thực Email" : "Verify Email"}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmail;
