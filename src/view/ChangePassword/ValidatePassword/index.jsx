import { Button } from "antd";
import React from "react";

const ValidatePassword = ({ handleVerifyPassword, resendEmail }) => {
  return (
    <>
      <h1>Xác thực người dùng</h1>
      <Button onClick={handleVerifyPassword}>Xác thực Email</Button>
      {resendEmail && (
        <p>Nếu chưa nhận dc email vui lòng nhấn nút để gửi lại</p>
      )}
    </>
  );
};

export default ValidatePassword;
