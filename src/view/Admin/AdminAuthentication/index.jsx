import React, { useEffect, useState } from "react";
import {
  ShoppingCartOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AppstoreOutlined,
  TagsOutlined,
  UserOutlined,
  FileTextOutlined,
  HistoryOutlined,
  BellOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Breadcrumb, Input, Dropdown, List, Card, Spin, Badge, ConfigProvider } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAdminBrands } from "../../../services/brandService";
import { getAdminCategories } from "../../../services/categoryService";
import { getAdminProducts, searchAdminProducts } from "../../../services/productService";
import { getLogs } from "../../../services/changelogService";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Cookies from "js-cookie";
import './index.css'

const { Search } = Input;
const { Header, Sider, Content } = Layout;

const AdminAuthentication = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [vnMode, setVNMode] = useState(() => {
    return localStorage.getItem("vnMode") === "true";
  });
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = Cookies.get("notifications");
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });
  const [unreadCount, setUnreadCount] = useState(() => {
    const savedUnreadCount = Cookies.get("unreadCount");
    return savedUnreadCount ? parseInt(savedUnreadCount, 10) : 0;
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const brands = useSelector((state) => state.brand.brands.data || []);
  const categories = useSelector((state) => state.category.categories.data || []);
  const userId = localStorage.getItem("userId");

  const [recentPages, setRecentPages] = useState(() => {
    const userHistory = localStorage.getItem(`recentPages_${userId}`);
    return JSON.parse(userHistory || "[]");
  });
  const [recentChangelogs, setRecentChangelogs] = useState([]);

  useEffect(() => {
    // Lưu trạng thái thông báo vào cookie
    Cookies.set("notifications", JSON.stringify(notifications));
    Cookies.set("unreadCount", unreadCount.toString());
  }, [notifications, unreadCount]);

  useEffect(() => {
    // Kết nối WebSocket
    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);

    client.connect({}, () => {
      client.subscribe("/topic/changelog", (message) => {
        const newNotification = { ...JSON.parse(message.body), read: false };
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    });

    return () => {
      client.disconnect();
    };
  }, []);

  const updateRecentPages = (path) => {
    if (path === '/admin') return;

    setRecentPages((prev) => {
      const updated = [path, ...prev.filter((p) => p !== path && p !== '/admin')].slice(0, 5); // Loại bỏ trùng lặp và giới hạn 5
      localStorage.setItem(`recentPages_${userId}`, JSON.stringify(updated)); // Lưu với key theo userId
      return updated;
    });
  };

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleSearch = async (value) => {
    setLoading(true);
    const results = [];

    menuItems.forEach((menu) => {
      if (menu.label.toLowerCase().includes(value.toLowerCase())) {
        results.push({ name: menu.label, type: "menu", link: `/admin/${menu.children[0].key}` });
      }
      menu.children?.forEach((child) => {
        if (child.label.toLowerCase().includes(value.toLowerCase())) {
          results.push({ name: child.label, type: "menu", link: `/admin/${child.key}` });
        }
      });
    });

    // Thêm logic tìm kiếm từ brands và categories
    brands.forEach((brand) => {
      if (brand.brandName.toLowerCase().includes(value.toLowerCase()) || brand.brandId.toLowerCase().includes(value.toLowerCase())) {
        results.push({ name: `${brand.brandName} - ${brand.brandId}`, type: "brand", link: `/admin/brand/${brand.brandId}` });
      }
      brand.brandCategories.forEach((brandCategory) => {
        if (brandCategory.name.toLowerCase().includes(value.toLowerCase()) || brandCategory.brandCategoryId.toLowerCase().includes(value.toLowerCase())) {
          results.push({ name: `${brandCategory.name} - ${brandCategory.brandCategoryId}`, type: "brand", link: `/admin/brand/${brand.brandId}/${brandCategory.brandCategoryId}` });
        }
      })
    });

    categories.forEach((category) => {
      if (category.categoryName.toLowerCase().includes(value.toLowerCase()) || category.categoryId.toLowerCase().includes(value.toLowerCase())) {
        results.push({ name: `${category.categoryName} - ${category.categoryId}`, type: "category", link: `/admin/category/${category.categoryId}` });
      }
      category.categoryItems.forEach((categoryItem) => {
        if (categoryItem.name.toLowerCase().includes(value.toLowerCase()) || categoryItem.categoryItemId.toLowerCase().includes(value.toLowerCase())) {
          results.push({ name: `${categoryItem.name} - ${categoryItem.categoryItemId}`, type: "category", link: `/admin/category/${category.categoryId}/${categoryItem.categoryItemId}` });
        }
      })
    });


    // Tìm kiếm sản phẩm từ API
    const res = await dispatch(searchAdminProducts({ search: value })).unwrap();
    res.data.forEach((product) => {
      results.push({ name: `${product.name} - ${product.productId}`, type: "product", link: `/admin/products/${product.productId}` });
    });

    setSearchResults(results);
    setLoading(false);
  };

  const menuItems = [
    {
      label: "Sản phẩm",
      key: "product",
      icon: <AppstoreOutlined />,
      children: [
        { label: "Danh sách sản phẩm", key: "products", onClick: () => navigate("/admin/products") },
        { label: "Thêm sản phẩm", key: "add-product", onClick: () => navigate("/admin/add-product") },
      ],
    },
    {
      label: "Danh mục",
      key: "categories",
      icon: <TagsOutlined />,
      children: [
        { label: "Danh mục sản phẩm", key: "category", onClick: () => navigate("/admin/category") },
        { label: "Thêm danh mục", key: "add-category", onClick: () => navigate("/admin/add-category") },
      ],
    },
    {
      label: "Nhãn hàng",
      key: "brands",
      icon: <FileTextOutlined />,
      children: [
        { label: "Danh sách nhãn hàng", key: "brand", onClick: () => navigate("/admin/brand") },
        { label: "Thêm nhãn hàng", key: "add-brand", onClick: () => navigate("/admin/add-brand") },
      ],
    },
    {
      label: "Đơn mua",
      key: "order",
      icon: <ShoppingCartOutlined />,
      children: [
        { label: "Danh sách đơn mua", key: "order-list", onClick: () => navigate("/admin/order") },
      ],
    },
    {
      label: "Khách hàng",
      key: "customer",
      icon: <UserOutlined />,
      children: [
        { label: "Danh sách khách hàng", key: "customer-list", onClick: () => navigate("/admin/customers") },
      ],
    },
  ];

  useEffect(() => {
    dispatch(getAdminBrands());
    dispatch(getAdminCategories());
    dispatch(getAdminProducts());
  }, [dispatch]);

  useEffect(() => {
    if (userId) {
      const currentPath = location.pathname;
      updateRecentPages(currentPath);
    }
  }, [location.pathname, userId]);

  useEffect(() => {


    fetchChangelogs();
  }, [dispatch]);


  useEffect(() => {
    const pathnames = location.pathname.replace("/admin", "").split("/").filter((x) => x);
    const lastKey = pathnames.join("-"); // Tạo key từ toàn bộ pathnames để phù hợp với menu key
    const parentKey = pathnames[0]; // Key của menu cha (nếu có)

    setSelectedKeys([lastKey]); // Key được chọn

    if (!openKeys.includes(parentKey)) {
      // Chỉ thêm key cha nếu nó chưa được mở
      setOpenKeys((prevOpenKeys) => [...prevOpenKeys, parentKey]);
    }
  }, [location.pathname, openKeys]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark"); // Thêm class dark cho HTML
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode); // Lưu trạng thái
  }, [darkMode]);

  useEffect(() => {
    if (vnMode) {
      document.documentElement.classList.add("vn"); // Thêm class dark cho HTML
    } else {
      document.documentElement.classList.remove("vn");
    }
    localStorage.setItem("vnMode", vnMode); // Lưu trạng thái
  }, [vnMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleVNMode = () => {
    setDarkMode((prev) => !prev);
  };

  const markAllAsRead = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const fetchChangelogs = async () => {
    try {
      const params = {
        eventId: "",
        eventType: "",
        status: "",
        detail: "",
        startTime: "",
        endTime: "",
        page: 0,
        limit: 10,
      };

      const response = await dispatch(getLogs(params));
      const data = response.payload.data;

      // Format lại dữ liệu
      const formattedData = data.map((log) => {
        let formattedEventType = "";
        let formattedDetail = "";

        // Chuyển đổi giá trị của eventType
        switch (log.eventType) {
          case "LOGIN":
            formattedEventType = "đã đăng nhập";
            break;
          case "DELETE":
            formattedEventType = "đã bị xoá";
            break;
          case "CREATE":
            formattedEventType = "đã được thêm";
            break;
          case "UPDATE":
            formattedEventType = "đã được cập nhật";
            break;
          case "REMOVE":
            formattedEventType = "đã xoá khỏi danh sách";
          case "ADD":
            formattedEventType = "đã thêm vào danh sách";
            break;
          case "ADD_TO_BRAND_CATEGORY" || "ADD_TO_CATEGORY_ITEM":
            formattedEventType = "đã được thêm sản phẩm";
            break;
          case "REMOVE_FROM_BRAND_CATEGORY" || "REMOVE_FROM_CATEGORY_ITEM":
            formattedEventType = "đã bị xoá sản phẩm";
            break;
          default:
            formattedEventType = log.eventType;
        }

        let productId = ""
        if (log.details?.startsWith("PRODUCT ") && log.eventType == "ADD_TO_BRAND_CATEGORY") {
          productId = log.details.split(" ")[1]; // Lấy ID sản phẩm
          formattedDetail = `thương hiệu`;
        } else if (log.details.startsWith("PRODUCT ") && log.eventType == "ADD_TO_CATEGORY_ITEM") {
          productId = log.details.split(" ")[1]; // Lấy ID sản phẩm
          formattedDetail = `danh mục`;
        } else if (log.detail === "USER") {
          formattedDetail = "người dùng";
        } else if (log.detail === "BRAND") {
          formattedDetail = "thương hiệu";
        } else {
          formattedDetail = log.details;
        }
        const truncateTimestamp = (timestamp) => timestamp?.split('.')[0];
        let read = true;

        notifications.forEach(notification => {
          if (truncateTimestamp(notification?.timestamp) === truncateTimestamp(log?.timestamp)) {
            read = notification.read
          }
        });

        return {
          ...log,
          eventType: formattedEventType,
          detail: formattedDetail,
          productId: productId,
          read: read
        };
      });

      setRecentChangelogs(formattedData);
    } catch (error) {
      console.error("Failed to fetch changelogs:", error);
    }
  };

  const onOpenChange = (keys) => {
    setOpenKeys(keys); // Cập nhật toàn bộ openKeys khi mở hoặc đóng
  };

  const breadcrumbItems = () => {
    const pathnames = location.pathname
      .replace("/admin", "") // Bỏ phần "admin" trong URL
      .split("/")
      .filter((x) => x);

    const breadcrumbMap = {
      products: "Sản phẩm",
      "product-list": "Danh sách sản phẩm",
      "add-product": "Thêm sản phẩm",
      category: "Danh mục",
      "category-list": "Danh sách danh mục",
      "add-category": "Thêm danh mục",
      brand: "Nhãn hàng",
      "brand-list": "Danh sách nhãn hàng",
      "add-brand": "Thêm nhãn hàng",
      order: "Đơn mua",
      "order-list": "Danh sách đơn mua",
      customers: "Khách hàng",
      "customer-list": "Danh sách khách hàng",
    };

    return pathnames.map((path, index) => {
      const currentName = breadcrumbMap[path] || path;

      if (currentName == "changelogpage") {
        return {
          title: `Thông báo`,
          key: path,
          href: `/admin/${pathnames.slice(0, index + 1).join("/")}`,
        };
      }
      if (currentName == "search-results") {
        return {
          title: `Tìm kiếm`,
          key: path,
          href: `/admin/${pathnames.slice(0, index + 1).join("/")}`,
        };
      }

      return {
        title: `${currentName}`,
        key: path,
        href: `/admin/${pathnames.slice(0, index + 1).join("/")}`,
      };
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value) handleSearch(value);
    else setSearchResults([]);
  };

  const handleShowAll = () => {
    navigate("/admin/search-results", { state: { searchResults, searchValue } });
    setSearchValue("");
  };

  const recentPagesMenu = (
    <Menu
      items={recentPages.map((page, index) => ({
        key: index,
        label: <a onClick={() => navigate(page)}>{page}</a>,
      }))}
    />
  );

  const handleMarkAsRead = (timestamp) => {
    setNotifications((prev) =>
      prev?.map((notif) => {
        const truncateTimestamp = (value) => value?.split('.')[0];
        truncateTimestamp(notif?.timestamp) === truncateTimestamp(timestamp) ? { ...notif, read: true } : notif
      })
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0)); // Đảm bảo không giảm xuống dưới 0
  };



  const changelogMenu = (
    <Menu>
      {recentChangelogs?.map((log, index) => (
        <Menu.Item
          key={index}
          style={!darkMode ? {
            backgroundColor: log.read ? "white" : "#f0f8ff", // Đổi màu nếu chưa đọc
          } : { backgroundColor: log.read ? "" : "#334255" }}
          onClick={() => handleMarkAsRead(log.timestamp)}
        >
          <Badge
            status={log.read ? "default" : "processing"}
            text={`Dữ liệu ${log.eventId} [${log.detail}] ${log.eventType} ${log.productId !== "" ? log.productId : ""
              }`}
          />
        </Menu.Item>
      ))}
      {recentChangelogs.length > 0 && (
        <Menu.Item
          key="show-all"
          style={{ textAlign: "center" }}
          onClick={() => navigate("/admin/changelogpage")}
        >
          <Button type="link">Hiển thị tất cả</Button>
        </Menu.Item>
      )}
      <Menu.Item
        key="mark-all"
        onClick={markAllAsRead}
        style={{ textAlign: "center" }}
      >
        <Button type="link">Đánh dấu tất cả là đã đọc</Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <ConfigProvider
      theme={darkMode ? {
        token: {
          colorPrimary: "rgb(30 41 59 / var(--tw-text-opacity, 1))",
          colorBgContainerDisabled: "#3C3C3C",
          colorBgContainer: "black",
          colorText: "rgb(148 163 184 / var(--tw-text-opacity, 1))",
          colorBgTextHover: "black",
          colorBorderBg: "white",
          colorIconHover: "white",
          colorTextLabel: "black",
          colorBgLayout: "black",
          colorBgMask: "black",
          colorBgBlur: "black",
          colorBgElevated: "rgb(30 41 59 / var(--tw-text-opacity, 1))",
          colorBorder: "rgb(148 163 184 / var(--tw-text-opacity, 1))",
          colorTextBase: "black",
          colorPrimaryBorder: "rgb(148 163 184 / var(--tw-text-opacity, 1))",
          colorFillContent: "rgb(30 41 59 / var(--tw-text-opacity, 1))",
          colorPrimaryHover: "#D9D9D9",
          colorFillContentHover: "#6C757D",
          colorPrimaryTextHover: "#6C757D",
          colorPrimaryBgHover: "rgb(30 41 59 / var(--tw-text-opacity, 1))",
          colorPrimaryBorderHover: "#6C757D",
          colorTextHeading: "rgb(148 163 184 / var(--tw-text-opacity, 1))",
          colorTextDescription: "#94A3B8",
          colorTextPlaceholder: "rgb(148 163 184 / var(--tw-text-opacity, 1))",
          colorTextLightSolid: "rgb(148 163 184 / var(--tw-text-opacity, 1))",
          colorBgSpotlight: "black",
          colorPrimaryBg: "#334255",
          colorBgTextActive: "black",
          colorBorderSecondary: "#6C757D",
          colorFill: "rgb(51 65 85 / var(--tw-text-opacity, 1))",
          colorFillAlter: "rgb(51 65 85 / var(--tw-text-opacity, 1))",
          colorFillQuaternary: "black",
          colorHighlight: "black",
          colorIcon: "white",
          colorFillSecondary: "black",
          colorFillTertiary: "#334255",
          colorSplit: "black",
          colorPrimaryActive: "black",
          colorWhite: "white",
          colorPrimaryText: "#3C3C3C",
          colorPrimaryTextActive: "#3C3C3C",
          colorLinkActive: "#3C3C3C",
          colorTextTertiary: "#3C3C3C",
          colorTextQuaternary: "rgb(148 163 184 / var(--tw-text-opacity, 1))",
          colorTextSecondary: "#3C3C3C",


          // colorLink: "black",
          // colorLinkHover: "black",
          // colorInfo: "black",
          // colorInfoActive: "black",
          // colorInfoBg: "black",
          // colorInfoBgHover: "black",
          // colorInfoBorder: "black",
          // colorInfoBorderHover: "black",
          // colorInfoHover: "black",
          // colorInfoText: "black",
          // colorInfoTextActive: "black",
          // colorInfoTextHover: "black",
        }
      } : {
        token: {
          // colorPrimary: "black"
        }
      }}
    >
      <Layout className={`min-h-screen`}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="dark"
          style={{ boxShadow: "2px 0 6px rgba(0, 0, 0, 0.2)" }}
        >
          <div
            className="logo"
            style={{
              height: 64,
              background: "rgba(255, 255, 255, 0.2)",
              margin: "16px 16px 0",
              borderRadius: 8,
            }}
          />
          <Menu
            theme="dark"
            mode="inline"
            defaultOpenKeys={["product"]}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={menuItems.map((item) => ({
              ...item,
              children: item.children?.map((child) => ({
                ...child,
                label: <div className="" style={{ paddingLeft: collapsed ? "24px" : "40px", width: '200px' }} onClick={child.onClick}>{child.label}</div>,
              })),
            }))}
          />
        </Sider>

        <Layout>
          <Header
            className={`flex justify-between items-center p-4 ${darkMode ? "bg-black" : "bg-white"} shadow`}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={`text-lg ${darkMode ? "text-white" : "text-black"}`}
            />
            <div className="flex items-center space-x-6">
              {/* <Dropdown>
                <i> <svg viewBox="0 0 24 24" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true" > <path d="M0 0h24v24H0z" fill="none" /> <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z " className="css-c4d79v" /> </svg> </i>
              </Dropdown> */}
              <div className={`text-2xl ${darkMode ? "text-white" : "text-black"} cursor-pointer`} onClick={toggleDarkMode}>
                {darkMode ? <MoonOutlined /> : <SunOutlined />}
              </div>
              <div className="relative">
                {unreadCount > 0 && (
                  <span
                    className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
                  >
                    {unreadCount}
                  </span>
                )}
                <Dropdown
                  overlay={changelogMenu}
                  placement="bottomRight"
                  arrow
                  onVisibleChange={fetchChangelogs}
                >
                  <div className={`text-2xl ${darkMode ? "text-white" : "text-black"} cursor-pointer`}>
                    <BellOutlined />
                  </div>
                </Dropdown>
              </div>

              <div>
                <Dropdown overlay={recentPagesMenu} placement="bottomRight" arrow>
                  <div className={`text-2xl ${darkMode ? "text-white" : "text-black"} cursor-pointer`}>
                    <HistoryOutlined />
                  </div>
                </Dropdown>
              </div>

              <div className="relative flex items-center">
                <Dropdown
                  overlay={
                    <Menu>
                      {searchResults.map((item, index) => (
                        <Menu.Item key={index}>
                          <a onClick={() => navigate(item.link)}>{item.name}</a>
                        </Menu.Item>
                      ))}
                      {searchResults.length > 0 && (
                        <Button
                          className="w-full mt-2"
                          type="primary"
                          onClick={handleShowAll}
                        >
                          Hiển thị tất cả
                        </Button>
                      )}
                    </Menu>
                  }
                  visible={searchValue && searchResults.length > 0}
                  placement="bottomLeft"
                >
                  <div className="w-72 pt-7">
                    <Input.Search
                      placeholder="Tìm kiếm sản phẩm, danh mục, nhãn hàng"
                      onChange={handleSearchChange}
                      value={searchValue}
                      onSearch={handleShowAll}
                      className={`w-full h-full ${darkMode ? "bg-black" : "bg-black"}`}
                      style={{
                        color: 'black',
                        backgroundColor: 'black',
                        margin: 0,
                        borderRadius: '5px'
                      }}
                    />
                  </div>
                </Dropdown>
              </div>


            </div>
          </Header>

          <Content className={`p-6 ${darkMode ? "dark:bg-slate-800" : "bg-slate-50"}`}>
            <Breadcrumb
              style={{ marginBottom: 16 }}
              items={breadcrumbItems().map((item) => ({
                title: <a href={item.href} className={`${darkMode ? "dark:text-[#94A3B8]" : "text-slate-800"}`}>{item.title}</a>,
                key: item.key,
              }))}
              separator=" / "
            />


            <div
              style={{
                padding: 24,
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                minHeight: "calc(100vh - 120px)",
              }}
              className={`${darkMode ? "dark:text-[#94A3B8] bg-black" : "text-slate-800 bg-white"}`}
            >
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>

  );
};

export default AdminAuthentication;
