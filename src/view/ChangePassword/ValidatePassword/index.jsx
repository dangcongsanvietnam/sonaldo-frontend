import { Button } from "antd";
import React from "react";
import { MailOutlined } from "@ant-design/icons";

const ValidatePassword = ({ handleVerifyPassword, resendMail, buttonLoading, vnMode }) => {
  return (
    <>
      <Button className="w-full p-6 !rounded-md" loading={buttonLoading} onClick={handleVerifyPassword}><MailOutlined /> {vnMode ? "Xác thực email" : "Verify email"}</Button>
      {resendMail && (
        <div>
          <small className="text-red-400">{vnMode ? "Nếu chưa nhận dc email vui lòng nhấn nút để gửi lại" : "Please click the button again if you haven't received an email"}</small>
        </div>
      )}
    </>
  );
};

export default ValidatePassword;
