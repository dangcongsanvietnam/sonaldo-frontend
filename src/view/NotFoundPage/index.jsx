import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const vnMode = localStorage.getItem("vnMode") === "true";

  return (
    <Result
      status="404"
      title="404"
      subTitle={vnMode ? "Trang không tồn tại" : "Page not found"}
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          {vnMode ? "Quay về trang chủ" : "Go to Home"}
        </Button>
      }
    />
  );
};

export default NotFoundPage;
