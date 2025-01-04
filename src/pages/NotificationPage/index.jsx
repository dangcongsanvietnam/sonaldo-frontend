import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Result, Button } from "antd";

function NotificationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const message = location.state?.message;

  return (
    <div>
      {message ? (
        <Result
          status="success"
          title="Thông Báo"
          subTitle={message}
          extra={
            <Button type="primary" onClick={() => navigate("/login")}>Đi đến trang đăng nhập</Button>
          }
        />
      ) : (
        <Result
          status="warning"
          title="Không có tác vụ"
          subTitle="Bạn đã truy cập trang này không hợp lệ."
          extra={
            <Button type="primary" onClick={() => navigate("/register")}>Quay lại trang đăng ký</Button>
          }
        />
      )}
    </div>
  );
}

export default NotificationPage;