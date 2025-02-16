import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import { useDispatch, useSelector } from "react-redux";
import { getAdminCategories } from "../../services/categoryService";
import { Spin } from "antd";
import { getUserCart } from "../../services/cartService";
import { useLoading } from "../../provider/LoadingProvider";

const Layout = () => {
  const { isLoading, startLoading, stopLoading } = useLoading();

  const dispatch = useDispatch();

  const userCart = useSelector((state) => state.cart?.userCart);
  const [cart, setCart] = useState(userCart || {});

  const categoryList = useSelector((state) => state.category?.categories?.data);

  useEffect(() => {
    if (!userCart) {
      startLoading();
      dispatch(getUserCart())
        .unwrap()
        .then((res) => setCart(res.data))
        .finally(() => stopLoading());
    }
  }, [dispatch, userCart]);

  useEffect(() => {
    startLoading();
    const fetchData = async () => {
      await dispatch(getAdminCategories());
      stopLoading();
    };

    fetchData();
  }, [dispatch]);

  return (
    <>
      {isLoading && (
        <div className="loading-overlay show">
          <img
            src="https://assets-v2.lottiefiles.com/a/ad10a15c-a6d5-11ee-a502-abb0403d8272/du1fB141eN.gif"
            alt="Loading..."
          />
        </div>
      )}
      <div className="min-h-screen flex flex-col">
        <Navbar cart={cart} categoryList={categoryList} />
        <Outlet context={setCart} />
        <Footer />
      </div>
    </>
  );
};

export default Layout;
