import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Breadcrumb, Layout, Menu, theme, Form } from "antd";
const { Header, Content, Footer, Sider } = Layout;
import { useDispatch, useSelector } from "react-redux";
import "./index.css";

import { Avatar } from "antd";
import { logout } from "../../slices/authSlice";

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => {
    return state.user.data;
  });
  console.log(user);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const items = [
    {
      label: (
        <span className="text-red-500 text-lg uppercase">
          Tài khoản của tôi
        </span>
      ),
      key: "submenu",
      type: "group",
      children: [
        {
          label: (
            <div
              className="text-red-500 label"
              onClick={() => navigate("/profile")}
            >
              Hồ sơ
            </div>
          ),
          key: "submenu-item-1",
        },
        {
          label: (
            <div
              className="text-red-500 label"
              onClick={() => navigate("/change-password")}
            >
              Đổi mật khẩu
            </div>
          ),
          key: "submenu-item-2",
        },
        {
          label: (
            <div
              className="text-red-500 label"
              onClick={() => navigate("/address")}
            >
              Địa chỉ
            </div>
          ),
          key: "submenu-item-3",
        },
      ],
    },
    {
      label: <div className="text-red-500 text-lg uppercase">Đơn của tôi</div>,
      key: "submenu2",
      type: "group",
      children: [
        {
          label: <div className="text-red-500 label">Đơn mua</div>,
          key: "submenu-item-4",
        },
      ],
    },
  ];

  const getBreadcrumbName = () => {
    switch (location.pathname) {
      case "/profile":
        return "Hồ sơ";
      case "/change-password":
        return "Đổi mật khẩu";
      case "/address":
        return "Địa chỉ";
      default:
        return "Tài khoản của tôi";
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider style={{ backgroundColor: "white" }}>
          <Menu mode="inline" items={items} />
        </Sider>

        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              paddingRight: 50,
            }}
          >
            <div className="flex justify-end gap-1 items-center">
              <div className="flex items-center justify-center h-full">
                <Avatar
                  src={`data:image/jpeg;base64,${user?.images[0].file.data}`}
                  size={40} // Đặt kích thước của Avatar
                />
              </div>
              <div className="relative group">
                <div className="cursor-pointer">{`${user?.firstName} ${user?.lastName}`}</div>
                <div className="absolute right-0 z-50 mt-2 w-40 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                  <ul className="list-none p-0 m-0 group-hover:opacity-100 group-hover:visible">
                    <li
                      className="hover:bg-gray-100 cursor-pointer p-1"
                      onClick={() => navigate("/Home")}
                    >
                      Tài khoản của tôi
                    </li>
                    <li
                      className="hover:bg-gray-100 cursor-pointer p-1"
                      onClick={() => navigate("/Home")}
                    >
                      Đơn mua
                    </li>
                    <li
                      className="hover:bg-gray-100 cursor-pointer p-1"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Header>
          <Content style={{ margin: "0 16px" }}>
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Tài khoản của tôi</Breadcrumb.Item>
              <Breadcrumb.Item>{getBreadcrumbName()}</Breadcrumb.Item>
            </Breadcrumb>
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet></Outlet>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default Account;
