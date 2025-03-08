import React, { createContext, useContext, useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "../Footer";
import { useDispatch, useSelector } from "react-redux";
import { getAdminCategories } from "../../services/categoryService";
import { getUserCart, removeCartItem, updateQuantityCartItem } from "../../services/cartService";
import { useLoading } from "../../provider/LoadingProvider";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { getAdminBrands } from "../../services/brandService";
import { Checkbox, Drawer } from "antd";
import { PlusOutlined, MinusOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { debounce } from "lodash";

const DrawerContext = createContext({
    toggleDrawer: () => { },
});

const Layout2 = () => {
    const vnMode = false;
    const navigate = useNavigate();

    return (
        <>
            <div className="min-h-screen flex flex-col">
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    transition={Bounce}
                    style={{ zIndex: 10000 }}
                />
                <Outlet context={{ vnMode }} />
            </div>
        </>
    );
};

export default Layout2;
