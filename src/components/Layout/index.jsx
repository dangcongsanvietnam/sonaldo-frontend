import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import { useDispatch, useSelector } from "react-redux";
import { getAdminCategories } from "../../services/categoryService";
import { Spin } from "antd";

const Layout = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const categoryList = useSelector((state) => state.category?.categories?.data);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getAdminCategories());
      setLoading(false);
    };

    fetchData();
  }, [dispatch]);

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar categoryList={categoryList} />
        {/* <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large"> */}
          {/* Khi loading = true, spinner sẽ bao quanh toàn bộ nội dung bên trong */}
          <Outlet />
        {/* </Spin> */}
        <Footer />
      </div>
    </>

  );
};

export default Layout;
