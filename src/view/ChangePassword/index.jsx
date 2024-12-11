import axios from "axios";
import React, { useState } from "react";
import ValidatePassword from "./ValidatePassword";
import ConfirmPassword from "./ConfirmPassword";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import BASE_URL from "../../api";

const ChangePassword = () => {
  const [resendMail, setResendMail] = useState(false);
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const jwt = urlParams.get("jwt");
  const token = Cookies.get("token");

  const handleVerifyPassword = () => {
    BASE_URL.post(
      "api/v1/auth/change-password",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(() => {
        alert("Vui lòng vào email để xác thực mật khẩu");
        setResendMail(true);
      })
      .catch(() => {
        alert("Failed to verify password");
      });
  };

  return (
    <>
      {jwt ? (
        <ConfirmPassword token={token} />
      ) : (
        <ValidatePassword
          resendMail={resendMail}
          handleVerifyPassword={handleVerifyPassword}
        />
      )}
    </>
  );
};

export default ChangePassword;
