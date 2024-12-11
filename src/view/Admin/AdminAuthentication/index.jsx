import React, { useEffect, useState } from "react";
import {
  ShoppingCartOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Breadcrumb } from "antd";
import {
  Outlet,
  useNavigate,
  useLocation,
  Link,
  useParams,
} from "react-router-dom";

import { Input } from "antd";
import { getAdminBrands } from "../../../services/brandService";
import { getAdminCategories } from "../../../services/categoryService";
import { useDispatch, useSelector } from "react-redux";
const { Search } = Input;
const { Header, Sider, Content } = Layout;
const AdminAuthentication = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const items = [
    {
      label: <span className="text-red-500  uppercase">Sản phẩm</span>,
      key: "product",
      icon: <ShoppingCartOutlined />,
      children: [
        {
          label: (
            <div
              className="text-red-500 label"
              onClick={() => navigate("/admin/products")}
            >
              Danh sách sản phẩm
            </div>
          ),
          key: "submenu-item-1",
        },
        {
          label: (
            <div
              className="text-red-500 label"
              onClick={() => navigate("/admin/add-product")}
            >
              Thêm sản phẩm
            </div>
          ),
          key: "submenu-item-2",
        },
      ],
    },
    {
      label: <span className="text-red-500  uppercase">Danh mục</span>,
      key: "category",
      icon: <ShoppingCartOutlined />,
      children: [
        {
          label: (
            <div
              className="text-red-500 label"
              onClick={() => navigate("/admin/category")}
            >
              Danh mục sản phẩm
            </div>
          ),
          key: "category-list",
        },
        {
          label: (
            <div
              className="text-red-500 label"
              onClick={() => navigate("/admin/add-category")}
            >
              Thêm danh mục
            </div>
          ),
          key: "add-category",
        },
      ],
    },
    {
      label: <span className="text-red-500  uppercase">Nhãn hàng</span>,
      key: "brand",
      icon: <ShoppingCartOutlined />,
      children: [
        {
          label: (
            <div
              className="text-red-500 label"
              onClick={() => navigate("/admin/brand")}
            >
              Danh sách nhãn hàng
            </div>
          ),
          key: "brand-list",
        },
        {
          label: (
            <div
              className="text-red-500 label"
              onClick={() => navigate("/admin/add-brand")}
            >
              Thêm nhãn hàng
            </div>
          ),
          key: "add-brand",
        },
      ],
    },
    {
      label: <div className="text-red-500  uppercase">Order</div>,
      key: "order",
      icon: <ShoppingCartOutlined />,

      children: [
        {
          label: (
            <div
              className="text-red-500 label"
              onClick={() => navigate("/admin/order")}
            >
              Đơn mua
            </div>
          ),
          key: "order-list",
        },
      ],
    },
    {
      label: <div className="text-red-500  uppercase">Khách hàng</div>,
      key: "customer",
      icon: <ShoppingCartOutlined />,

      children: [
        {
          label: (
            <div
              className="text-red-500 label"
              onClick={() => navigate("/admin/customers")}
            >
              Khách hàng
            </div>
          ),
          key: "customer-detail",
        },
      ],
    },
  ];

  const getBreadcrumbName = () => {
    switch (location.pathname) {
      case "/product":
        return "Danh sách sản phẩm";
      case "/add-product":
        return "Thêm sản phẩm";
      case "/edit-product":
        return "Sửa sản phẩm";
      case "/category":
        return "Danh mục sản phẩm";
      case "/add-category":
        return "Thêm danh mục";
      case "/edit-product":
        return "Sửa danh mục";
      case "/brand":
        return "Danh sách nhãn hàng";
      case "/add-brand":
        return "Thêm nhãn hàng";
      case "/edit-brand":
        return "Sửa nhãn hàng";

      case "/order":
        return "Đơn mua";
      case "/users":
        return "Khách hàng";
      default:
        return "Tài khoản của tôi";
    }
  };

  useEffect(() => {
    dispatch(getAdminBrands());
    dispatch(getAdminCategories());
  }, [dispatch]);

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          defaultOpenKeys={[
            "product",
            "category",
            "brand",
            "order",
            "customer",
          ]}
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <Search
            placeholder="input search text"
            onSearch={() => {}}
            style={{
              width: 200,
              padding: "16px 0",
            }}
          />
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb
            separator=">"
            style={{ margin: "16px 0" }}
            items={[
              { title: "Tài khoản của tôi" },
              { title: getBreadcrumbName() },
            ]}
          />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              marginBottom: 20,
            }}
          >
            <Outlet></Outlet>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default AdminAuthentication;
