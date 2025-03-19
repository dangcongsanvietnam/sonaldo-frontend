import React from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { Result, Button } from "antd";

function NotificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { vnMode } = useOutletContext();

  const message = location.state?.message;
  const is404 = location.pathname === "/404";

  return (
    <div>
      {is404 ? (
        <Result
          status="404"
          title="404"
          subTitle={vnMode ? "Không tìm thấy trang" : "Page not found"}
          extra={
            <Button type="primary" onClick={() => navigate("/")}>
              {vnMode ? "Quay về trang chủ" : "Go to Home"}
            </Button>
          }
        />
      ) : message ? (
        <Result
          status="success"
          title={vnMode ? "Thông Báo" : "Notification"}
          subTitle={message}
          extra={
            <Button type="primary" onClick={() => navigate("/login")}>
              {vnMode ? "Đi đến trang đăng nhập" : "Go to Login Page"}
            </Button>
          }
        />
      ) : (
        <Result
          status="warning"
          title={vnMode ? "Không có tác vụ" : "No Action"}
          subTitle={
            vnMode
              ? "Bạn đã truy cập trang này không hợp lệ."
              : "You have accessed this page incorrectly."
          }
          extra={
            <Button type="primary" onClick={() => navigate("/register")}>
              {vnMode ? "Quay lại trang đăng ký" : "Go to Registration Page"}
            </Button>
          }
        />
      )}
    </div>
  );
}

export default NotificationPage;
