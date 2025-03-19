import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Button } from "antd";
import BASE_URL from "../../api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../services/authService";
import Google from '../../assets/google-logo.png';
import { toast } from "react-toastify";

function GoogleLogin({vnMode}) {
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
    onError: (error) => toast.error(error),
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
                  })
                  .catch(() => {
                    toast.error(vnMode ? "Thất bại" : "Failed");
                  });
              }
            });
        })
        .catch(() => toast.error(vnMode ? "Thất bại" : "Failed"));
    }
  }, [user]);

  return (
    <div>
      <Button className="text-xl !rounded-full px-1 py-2 !bg-white !hover:bg-[#E5E7EB]" onClick={loginGoogle}><img src={Google} alt="Baybee" className="h-6 mx-auto" /></Button>
    </div>
  );
}

export default GoogleLogin;
