import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import { useDispatch, useSelector } from "react-redux";
import { getAdminCategories } from "../../services/categoryService";
import { Spin } from "antd";
import { getUserCart } from "../../services/cartService";

const Layout = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const userCart = useSelector((state) => state.cart?.userCart);
  const [cart, setCart] = useState(userCart || {});
  const [isLoading, setIsLoading] = useState(true);

  const categoryList = useSelector((state) => state.category?.categories?.data);

  useEffect(() => {
    if (!userCart) {
      dispatch(getUserCart())
        .unwrap()
        .then((res) => setCart(res.data))
        .finally(() => setIsLoading(false));
    }
  }, [dispatch, userCart]);

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
        <Navbar isLoading={isLoading} cart={cart} categoryList={categoryList} />
        {/* <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large"> */}
        {/* Khi loading = true, spinner sẽ bao quanh toàn bộ nội dung bên trong */}
        <Outlet context={setCart} />
        {/* </Spin> */}
        <Footer />
      </div>
    </>
  );
};

export default Layout;
