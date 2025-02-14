import { Button } from "antd";
import React from "react";

const ValidatePassword = ({ handleVerifyPassword, resendMail, buttonLoading, vnMode }) => {
  return (
    <>
      <h1 className="font-bold">{vnMode ? "Xác thực người dùng" : "Verify user"}</h1>
      <Button loading={buttonLoading} onClick={handleVerifyPassword}>{vnMode ? "Xác thực email" : "Verify email"}</Button>
      {resendMail && (
        <div>
          <small className="text-red-400">{vnMode ? "Nếu chưa nhận dc email vui lòng nhấn nút để gửi lại" : "Please click the button again if you haven't received an email"}</small>
        </div>
      )}
    </>
  );
};

export default ValidatePassword;
