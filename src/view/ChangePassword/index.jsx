import React, { useState } from "react";
import ValidatePassword from "./ValidatePassword";
import ConfirmPassword from "./ConfirmPassword";
import { useLocation, useOutletContext } from "react-router-dom";
import Cookies from "js-cookie";
import BASE_URL from "../../api";

const ChangePassword = () => {
  const [resendMail, setResendMail] = useState(false);
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const jwt = urlParams.get("jwt");
  const token = Cookies.get("token");
  const [buttonLoading, setButtonLoading] = useState(false);
  const { vnMode } = useOutletContext();

  const handleVerifyPassword = () => {
    setButtonLoading(true);
    BASE_URL.post(
      "api/v1/auth/change-password",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          dataHref: 'super-admin/change-password?jwt='
        }
      }
    )
      .then(() => {
        alert(vnMode ? "Vui lòng vào email để xác thực mật khẩu" : "Please check your email to verify password");
        setResendMail(true);
        setButtonLoading(false);
      })
      .catch(() => {
        alert(vnMode ? "Xác thực mật khẩu thất bại" : "Failed to verify password");
        setButtonLoading(false);
      });
  };

  return (
    <>
      <div className="font-bold text-2xl mb-5">Change Password</div>
      <div className="bg-white w-full p-6 rounded-md">
        {jwt ? (
          <ConfirmPassword token={token} vnMode={vnMode} />
        ) : (
          <ValidatePassword
            resendMail={resendMail}
            handleVerifyPassword={handleVerifyPassword}
            buttonLoading={buttonLoading}
            vnMode={vnMode}
          />
        )}
      </div>
    </>
  );
};

export default ChangePassword;
