import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Button, notification } from "antd";
import BASE_URL from "../../api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../services/authService";
import { getUserInfo } from "../../services/userService";

function GoogleLogin() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userGoogle = {
    email: "",
    password: "",
    googleLoginFlag: true,
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUser(codeResponse);
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (user?.access_token) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          const email = res?.data?.email;
          const updatedUserGoogle = {
            ...userGoogle,
            email,
          };

          console.log(1, updatedUserGoogle);
          BASE_URL.post("/api/v1/auth/check-email", { email })
            .then(() => {
              localStorage.setItem("email", email);
              localStorage.setItem("first-name", res?.data?.family_name);
              localStorage.setItem("last-name", res?.data?.given_name);
              localStorage.setItem("picture", res?.data?.picture);
              navigate("/reset-password");
            })
            .catch((err) => {
              const status = err?.response?.status;
              if (status === 409) {
                dispatch(login(updatedUserGoogle))
                  .unwrap()
                  .then((res) => {
                    if (res.data.role === "ROLE_ADMIN") {
                      navigate("/admin");
                    } else {
                      navigate("/");
                    }

                    notification.success({
                      message: "Thành công",
                      description: "Đăng nhập thành công",
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                    notification.error({
                      message: "Thất bại",
                      description: "Đăng nhập thất bại",
                    });
                  });
              }
            });
        })
        .catch((err) => console.log("err", err));
    }
  }, [user]);

  return (
    <div>
      <Button onClick={loginGoogle}>Sign in with Google 🚀 </Button>
    </div>
  );
}

export default GoogleLogin;
