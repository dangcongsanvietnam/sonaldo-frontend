import React from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import BASE_URL from "../../api";

const VerifyEmail = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const jwt = urlParams.get("jwt");
  const navigate = useNavigate();

  const handleVerifyEmail = () => {
    BASE_URL.post(
      "api/v1/auth/verify-email",
      {},
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    )
      .then((response) => {
        alert("Email verified successfully");
        navigate("/login");
      })
      .catch((error) => {
        alert("Failed to verify email");
      });
  };

  return (
    <div>
      <h1>Email Verification</h1>
      <button onClick={handleVerifyEmail}>Verify Email</button>
    </div>
  );
};

export default VerifyEmail;
