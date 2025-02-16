import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import Cookies from "js-cookie";
import BASE_URL from "../../api";

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const token = Cookies.get("token");
    const role = localStorage.getItem("role");
    if (!token || !role || (role !== "ROLE_ADMIN" && role !== "ROLE_MANAGER")) {
      navigate("/login/admin");
      setLoading(false);
    } else {
      BASE_URL
        .get(`api/v1/auth/validate-token?token=${token}&role=${role}`)
        .then((response) => {
          if (response.status !== 200) {
            navigate("/login/admin")
          }
        })
        .catch(() => {
          navigate("/login/admin");
        }).finally(() => setLoading(false))
    }
  }, [navigate]);

  return (
    <>
      <div className="h-full flex flex-col">
        <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
          {/* Khi loading = true, spinner sẽ bao quanh toàn bộ nội dung bên trong */}
          <Outlet />
        </Spin>
      </div>
    </>

  );
};

export default AdminLayout;

