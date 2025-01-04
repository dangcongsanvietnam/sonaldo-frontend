import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import BASE_URL from "../../api";

const Authentication = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    const role = localStorage.getItem("role");
    if (!token || !role) {
      navigate("/login");
    } else {
      BASE_URL
        .get(`api/v1/auth/validate-token?token=${token}&role=${role}`)
        .then((response) => {
          if (response.status !== 200) {
            navigate("/login");
          }
        })
        .catch(() => {
          navigate("/login");
        });
    }
  }, [navigate]);

  return <Outlet></Outlet>;
};

export default Authentication;
