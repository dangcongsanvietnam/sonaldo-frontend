import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Breadcrumb, Layout, Menu, theme } from "antd";
const { Sider } = Layout;
import { useDispatch, useSelector } from "react-redux";
import "./index.css";
import Cookies from "js-cookie";

import { logout } from "../../slices/authSlice";
import {
  HeartOutlined,
  HomeOutlined,
  IdcardOutlined,
  LogoutOutlined,
  SettingOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import { getRecommendations } from "../../services/userService";

const siderStyle = {
  overflow: 'auto',
  height: '480px',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const dispatch = useDispatch();
  const vnMode = true;
  const currentPath = window.location.pathname;
  const token = Cookies.get("token");
  const [defaultSelectedKey, setDefaultSelectedKey] = useState('1');
  const linkItems = [{ title: "Tài khoản của tôi", href: "/profile" }];
  const [breadcrumbItems, setBreadcrumbItems] = useState(linkItems);

  const parts = pathname.split("/");
  const wishlistId = parts.length > 2 ? parts[2] : null;

  const wishlist = useSelector((state) =>
    state.wishlist?.wishlists?.find((item) => item.wishlistId === wishlistId)
  );

  const user = useSelector((state) => {
    return state.user.data;
  });

  useEffect(() => {
    if (token) {
      dispatch(getRecommendations())
    }
  }, [dispatch]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const items = [
    { icon: HomeOutlined, label: "Account Overview", data: "/profile" },
    { icon: TruckOutlined, label: "My Orders", data: "/orders" },
    { icon: IdcardOutlined, label: "Personal Address & Details", data: "/address" },
    { icon: HeartOutlined, label: "Wish list", data: "/wishlists" },
    { icon: SettingOutlined, label: "Account Settings", data: "/change-password" },
    { icon: LogoutOutlined, label: "Logout", data: "/logout" },
  ].map((item, index) => ({
    key: String(index + 1),
    icon: React.createElement(item.icon),
    label: (
      <span>
        {item.label}
      </span>
    ),
    className: `border !rounded-none cursor-pointer ${item.data === "/profile" ? "!rounded-t-xl" : ""} ${item.data === "/logout" ? "!rounded-b-xl" : ""}`,
    onClick: item.data === "/logout" ? handleLogout : () => navigate(item.data),
    data: item.data
  }));

  useEffect(() => {
    const basePath = currentPath.split("/")[1];
    const matchedItem = items.find(item => item.data.split("/")[1] === basePath);

    setDefaultSelectedKey(matchedItem?.key);
  }, [pathname]);

  useEffect(() => {
    let newItems = [{ title: "Tài khoản của tôi", href: "/profile", className: '!text-[#015AD2] hover:underline' }];

    if (pathname.startsWith("/wishlists")) {
      newItems.push({ title: "Yêu thích", href: "/wishlists", className: pathname === '/wishlists' ? 'cursor-default pointer-events-none !text-black' : '!text-[#015AD2] hover:underline' });

      if (wishlistId && wishlist) {
        newItems.push({ title: wishlist.name, href: "", className: 'cursor-default pointer-events-none !text-black' });
      }
    } else {
      switch (pathname) {
        case "/profile":
          newItems.push({ title: "Hồ sơ" });
          break;
        case "/change-password":
          newItems.push({ title: "Đổi mật khẩu" });
          break;
        case "/address":
          newItems.push({ title: "Địa chỉ", href: "", className: pathname === '/address' ? 'cursor-default pointer-events-none !text-black' : '' });
          break;
        case "/order":
          newItems.push({ title: "Đơn mua" });
          break;
        default:
          newItems.push({ title: "Tài khoản của tôi" });
          break;
      }
    }

    setBreadcrumbItems(newItems);
  }, [pathname, wishlistId, wishlist]);

  return (
    <>
      <div style={{ minHeight: "100vh" }} className="px-3 py-5 bg-[#F2F2F2] flex">
        <Sider style={siderStyle} width={300} className="bg-[#F2F2F2]">
          <div className="demo-logo-vertical" />
          <Menu mode="inline" selectedKeys={[defaultSelectedKey]} items={items}
            className="!p-0 h-auto rounded-xl"
          />
        </Sider>
        <div className="w-[90%] ml-5 h-full flex flex-col">
          <Breadcrumb
            className="flex items-center space-x-1 pt-2 mb-5"
            items={breadcrumbItems}
          />
          <div
            style={{
              borderRadius: borderRadiusLG,
            }}
            className="h-full"
          >
            <Outlet context={{ vnMode }}></Outlet>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
