import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { Breadcrumb, Button, Drawer, Dropdown, Layout, Menu, theme } from "antd";
const { Sider } = Layout;
import { useDispatch, useSelector } from "react-redux";
import "./index.css";
import Cookies from "js-cookie";

import { logout } from "../../slices/authSlice";
import {
  DownOutlined,
  HeartOutlined,
  HomeOutlined,
  IdcardOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
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
  const { vnMode } = useOutletContext();
  const dispatch = useDispatch();
  const currentPath = window.location.pathname;
  const token = Cookies.get("token");
  const [defaultSelectedKey, setDefaultSelectedKey] = useState('1');
  const linkItems = [{ title: "Tài khoản của tôi", href: "/profile" }];
  const [breadcrumbItems, setBreadcrumbItems] = useState(linkItems);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const parts = pathname.split("/");
  const wishlistId = parts.length > 2 ? parts[2] : null;

  const wishlist = useSelector((state) =>
    state.wishlist?.wishlists?.find((item) => item.wishlistId === wishlistId)
  );

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
    { icon: HomeOutlined, label: vnMode ? "Tổng quan tài khoản" : "Account Overview", data: "/profile" },
    { icon: TruckOutlined, label: vnMode ? "Đơn hàng của tôi" : "My Orders", data: "/orders" },
    { icon: ShoppingCartOutlined, label: vnMode ? "Giỏ hàng" : "My Cart", data: "/carts" },
    { icon: IdcardOutlined, label: vnMode ? "Địa chỉ & Thông tin cá nhân" : "Personal Address & Details", data: "/address" },
    { icon: HeartOutlined, label: vnMode ? "Danh sách yêu thích" : "Wish List", data: "/wishlists" },
    { icon: SettingOutlined, label: vnMode ? "Cài đặt tài khoản" : "Account Settings", data: "/change-password" },
    { icon: LogoutOutlined, label: vnMode ? "Đăng xuất" : "Logout", data: "/logout" },
  ].map((item, index) => ({
    key: String(index + 1),
    icon: React.createElement(item.icon),
    label: <span>{item.label}</span>,
    data: item.data,
    className: `border !rounded-none cursor-pointer ${item.data === "/profile" ? "!rounded-t-xl" : ""} 
      ${item.data === "/logout" ? "!rounded-b-xl" : ""}`,
    onClick: item.data === "/logout" ? handleLogout : () => navigate(item.data),
  }));

  useEffect(() => {
    const basePath = currentPath ? currentPath.split("/")[1] : "";
    const matchedItem = items.find(item => item.data?.split("/")[1] === basePath);

    setDefaultSelectedKey(matchedItem?.key);
  }, [pathname, navigate]);

  useEffect(() => {
    let newItems = [
      {
        title: vnMode ? "Tài khoản của tôi" : "My Account",
        href: "/profile",
        className: '!text-[#015AD2] hover:underline'
      }
    ];

    if (pathname.startsWith("/wishlists")) {
      newItems.push({
        title: vnMode ? "Yêu thích" : "Wishlists",
        href: "/wishlists",
        className: pathname === '/wishlists' ? 'cursor-default pointer-events-none !text-black' : '!text-[#015AD2] hover:underline'
      });

      if (wishlistId && wishlist) {
        newItems.push({
          title: wishlist.name,
          href: "",
          className: 'cursor-default pointer-events-none !text-black'
        });
      }
    } else {
      switch (pathname) {
        case "/profile":
          newItems.push({
            title: vnMode ? "Hồ sơ" : "Profile",
            href: "/profile",
            className: pathname === '/profile' ? 'cursor-default pointer-events-none !text-black' : '!text-[#015AD2] hover:underline'
          });
          break;
        case "/change-password":
          newItems.push({
            title: vnMode ? "Đổi mật khẩu" : "Change Password",
            href: "/change-password",
            className: pathname === '/change-password' ? 'cursor-default pointer-events-none !text-black' : '!text-[#015AD2] hover:underline'
          });
          break;
        case "/address":
          newItems.push({
            title: vnMode ? "Địa chỉ" : "Address",
            href: "/address",
            className: pathname === '/address' ? 'cursor-default pointer-events-none !text-black' : '!text-[#015AD2] hover:underline'
          });
          break;
        case "/orders":
          newItems.push({
            title: vnMode ? "Đơn mua" : "My Orders",
            href: "/orders",
            className: pathname === '/orders' ? 'cursor-default pointer-events-none !text-black' : '!text-[#015AD2] hover:underline'
          });
          break;
        case "/carts":
          newItems.push({
            title: vnMode ? "Giỏ hàng" : "My Cart",
            href: "/carts",
            className: pathname === '/carts' ? 'cursor-default pointer-events-none !text-black' : '!text-[#015AD2] hover:underline'
          });
          break;
        default:
          newItems.push({
            title: vnMode ? "Tài khoản của tôi" : "My Account",
            href: "/profile",
            className: pathname === '/profile' ? 'cursor-default pointer-events-none !text-black' : '!text-[#015AD2] hover:underline'
          });
          break;
      }
    }

    setBreadcrumbItems(newItems);
  }, [pathname, wishlistId, wishlist, vnMode]);

  return (
    <>
      <div style={{ minHeight: "100vh" }} className="px-3 py-5 bg-[#F2F2F2] flex flex-col sm:flex-row pt-12">
        <div className="sm:hidden mb-4 flex justify-between items-center">
          <Button type="primary" icon={<MenuOutlined />} onClick={() => setIsDrawerOpen(true)} />
        </div>

        <Drawer
          title={vnMode ? "Danh mục" : "Categories"}
          placement="left"
          closable
          onClose={() => setIsDrawerOpen(false)}
          open={isDrawerOpen}
          width={250}
          zIndex={10000}
        >
          <Menu mode="inline" selectedKeys={[defaultSelectedKey]} items={items} />
        </Drawer>

        <div className="hidden sm:block">
          <Sider style={siderStyle} width={300} className="bg-[#F2F2F2]">
            <Menu mode="inline" selectedKeys={[defaultSelectedKey]} items={items} className="!p-0 h-auto rounded-xl" />
          </Sider>
        </div>

        <div className="w-full sm:w-[90%] sm:ml-5 h-full flex flex-col">
          <div className="hidden sm:flex items-center space-x-1 pt-2 mb-5">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div style={{ borderRadius: borderRadiusLG }} className="h-full">
            <Outlet context={{ vnMode }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
