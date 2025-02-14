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
  KeyOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Breadcrumb, Input, Dropdown, Badge, ConfigProvider, Avatar } from "antd";
import { Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchAdminProducts } from "../../../services/productService";
import { getLogs } from "../../../services/changelogService";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Cookies from "js-cookie";
import './index.css'
import { logout } from "../../../slices/authSlice";
import BASE_URL from "../../../api";
import { getUserInfo } from "../../../services/userService";
import { Bounce, toast, ToastContainer } from "react-toastify";

const { Header, Sider, Content } = Layout;

const AdminAuthentication = () => {
  const { darkMode, vnMode, setDarkMode, setVNMode } = useOutletContext();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [lastViewedOrderId, setLastViewedOrderId] = useState(null);
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
  const brands = useSelector((state) => {
    return state.brand.brands.data;
  });
  const categories = useSelector((state) => {
    return state.category.categories.data;
  });
  const userId = localStorage.getItem("userId");
  const user = useSelector((state) => {
    return state.user.data;
  });
  const role = localStorage.getItem("role");

  const [recentPages, setRecentPages] = useState(() => {
    const userHistory = localStorage.getItem(`recentPages_${userId}`);
    return JSON.parse(userHistory || "[]");
  });
  const [recentChangelogs, setRecentChangelogs] = useState([]);

  useEffect(() => {
    const token = Cookies.get("token");
    const role = localStorage.getItem("role");
    if (!token || !role || (role !== "ROLE_MANAGER")) {
      navigate("/login/admin");
    } else {
      BASE_URL
        .get(`api/v1/auth/validate-token?token=${token}&role=${role}`)
        .then((response) => {
          if (token) {
            dispatch(getUserInfo(token));
          }
          if (response.status !== 200) {
            navigate("/login/admin")
          }
        })
        .catch(() => {
          navigate("/login/admin");
        });
    }
  }, [navigate]);

  useEffect(() => {
    Cookies.set("notifications", JSON.stringify(notifications));
    Cookies.set("unreadCount", unreadCount.toString());
  }, [notifications, unreadCount]);

  useEffect(() => {
    const client = Stomp.over(() => new SockJS("http://localhost:8080/ws"));

    client.debug = () => { };

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

  const handleSearch = async (value) => {
    const results = [];
    const searchValue = value.trim().toLowerCase();

    const fixedItems = [
      { label: vnMode ? "Thông tin cá nhân" : "Profile", key: "profile" },
      { label: vnMode ? "Đổi mật khẩu" : "Change Password", key: "change-password" },
    ];

    const combinedMenuItems = [
      ...fixedItems,
      ...menuItems.filter((item) => !fixedItems.some((fixed) => fixed.key === item.key)),
    ];

    const legalParents = ["profile", "change-password"];
    combinedMenuItems.forEach((menu) => {
      if (legalParents.includes(menu.key)) {
        if (menu?.label?.toLowerCase().includes(searchValue)) {
          results.push({ name: menu.label, type: "menu", link: `/admin/${menu.key}` });
        }
      }

      menu.children?.forEach((child) => {
        if (child.label.toLowerCase().includes(searchValue)) {
          results.push({ name: child.label, type: "menu", link: `/admin/${child.key}` });
        }
      });
    });

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

    const res = await dispatch(searchAdminProducts({ search: value })).unwrap();
    res.data.forEach((product) => {
      results.push({ name: `${product.name} - ${product.productId}`, type: "product", link: `/admin/products/${product.productId}` });
    });

    setSearchResults(results);
  };

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

  useEffect(() => {
    const storedOrderId = localStorage.getItem('lastViewedOrderId');
    if (storedOrderId) {
      setLastViewedOrderId(storedOrderId);
    }
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login/admin");
  };


  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleVNMode = () => {
    setVNMode(true);
  };

  const toggleENGMode = () => {
    setVNMode(false);
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
        userId: userId,
        role: role,
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
            formattedEventType = vnMode ? "đã đăng nhập" : "was login";
            break;
          case "LOGIN":
            formattedEventType = vnMode ? "đã đăng ký" : "was signup";
            break;
          case "DELETE":
            formattedEventType = vnMode ? "đã bị xoá" : "was deleted";
            break;
          case "CREATE":
            formattedEventType = vnMode ? "đã được thêm" : "was created";
            break;
          case "UPDATE":
            formattedEventType = vnMode ? "đã được cập nhật" : "was updated";
            break;
          case "REMOVE":
            formattedEventType = vnMode ? "đã xoá khỏi danh sách" : "was removed from list";
          case "ADD":
            formattedEventType = vnMode ? "đã thêm vào danh sách" : "was added to list";
            break;
          case "ADD_TO_BRAND_CATEGORY":
            formattedEventType = vnMode ? "đã được thêm sản phẩm" : "was added a product";
            break;
          case "ADD_TO_CATEGORY_ITEM":
            formattedEventType = vnMode ? "đã được thêm sản phẩm" : "was added a product";
            break;
          case "REMOVE_FROM_CATEGORY_ITEM":
            formattedEventType = vnMode ? "đã bị xoá sản phẩm" : "was removed a product";
            break;
          case "REMOVE_FROM_BRAND_CATEGORY":
            formattedEventType = vnMode ? "đã bị xoá sản phẩm" : "was removed a product";
            break;
          default:
            formattedEventType = log.eventType;
        }

        let productId = ""
        if (log.details?.startsWith("PRODUCT ") && (log.eventType == "ADD_TO_BRAND_CATEGORY" || log.eventType == "REMOVE_FROM_BRAND_CATEGORY")) {
          productId = log.details.split(" ")[1]; // Lấy ID sản phẩm
          formattedDetail = vnMode ? `thương hiệu` : "brand";
        } else if (log.details.startsWith("PRODUCT ") && (log.eventType == "ADD_TO_CATEGORY_ITEM" || log.eventType == "REMOVE_FROM_CATEGORY_ITEM")) {
          productId = log.details.split(" ")[1]; // Lấy ID sản phẩm
          formattedDetail = vnMode ? `danh mục` : "category";
        } else if (log.details === "USER") {
          formattedDetail = vnMode ? "người dùng" : "user";
        } else if (log.details === "BRAND") {
          formattedDetail = vnMode ? "thương hiệu" : "brand";
        } else if (log.details === "CATEGORY") {
          formattedDetail = vnMode ? "danh mục" : "category";
        } else if (log.details === "PRODUCT") {
          formattedDetail = vnMode ? "sản phẩm" : "product";
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
    }
  };

  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const breadcrumbItems = () => {
    const pathnames = location.pathname
      .replace("/admin", "")
      .split("/")
      .filter((x) => x);

    const breadcrumbMap = {
      products: vnMode ? "Sản phẩm" : "Product",
      "product-list": vnMode ? "Danh sách sản phẩm" : "Product list",
      "add-product": vnMode ? "Thêm sản phẩm" : "Add product",
      category: vnMode ? "Danh mục" : "Category",
      "category-list": vnMode ? "Danh sách danh mục" : "Category list",
      "add-category": vnMode ? "Thêm danh mục" : "Add category",
      brand: vnMode ? "Thương hiệu" : "Brand",
      "brand-list": vnMode ? "Danh sách thương hiệu" : "Brand list",
      "add-brand": vnMode ? "Thêm thương hiệu" : "Add brand",
      "order-management": vnMode ? "Quản lý đơn hàng" : "Order Management",
      "orders": vnMode ? "Danh sách đơn hàng" : "Order List",
      "order-details": vnMode ? "Chi tiết đơn hàng" : "Order Details",
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

      if (currentName == "profile") {
        return {
          title: `Tìm kiếm`,
          key: path,
          href: `/admin/${pathnames.slice(0, index + 1).join("/")}`,
        };
      }

      if (currentName == "change-password") {
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

  const handleViewOrderDetail = () => {
    if (lastViewedOrderId) {
      navigate(`/super-admin/order-details/${lastViewedOrderId}`);
    } else {
      toast.info(vnMode ? 'Vui lòng chọn một đơn hàng để xem chi tiết' : 'Please choose at least one order to watch detail');
    }
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

  const menuItems = [
    {
      label: vnMode ? "Sản phẩm" : "Product",
      key: "product",
      icon: <AppstoreOutlined />,
      children: [
        { label: vnMode ? "Danh sách sản phẩm" : "Product List", key: "products", onClick: () => navigate("/admin/products") },
        { label: vnMode ? "Thêm sản phẩm" : "Add Product", key: "add-product", onClick: () => navigate("/admin/add-product") },
      ],
    },
    {
      label: vnMode ? "Danh mục" : "Category",
      key: "categories",
      icon: <TagsOutlined />,
      children: [
        { label: vnMode ? "Danh mục sản phẩm" : "Category List", key: "category", onClick: () => navigate("/admin/category") },
        { label: vnMode ? "Thêm danh mục" : "Add Category", key: "add-category", onClick: () => navigate("/admin/add-category") },
      ],
    },
    {
      label: vnMode ? "Nhãn hàng" : "Brand",
      key: "brands",
      icon: <FileTextOutlined />,
      children: [
        { label: vnMode ? "Danh sách nhãn hàng" : "Brand List", key: "brand", onClick: () => navigate("/admin/brand") },
        { label: vnMode ? "Thêm nhãn hàng" : "Add Brand", key: "add-brand", onClick: () => navigate("/admin/add-brand") },
      ],
    },
    {
      label: vnMode ? "Đơn hàng" : "Order",
      icon: <ShoppingCartOutlined />,
      children: [
        { label: vnMode ? "Danh sách đơn hàng" : "Order List", key: "orders", onClick: () => navigate("/admin/orders") },
        {
          label: vnMode ? "Chi tiết đơn hàng" : "Order Details",
          key: "order-details",
          onClick: handleViewOrderDetail
        },
      ],
    },
  ];

  const handleMarkAsRead = (timestamp) => {
    setNotifications((prev) =>
      prev?.map((notif) => {
        const truncateTimestamp = (value) => value?.split('.')[0];
        truncateTimestamp(notif?.timestamp) === truncateTimestamp(timestamp) ? { ...notif, read: true } : notif
      })
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0)); // Đảm bảo không giảm xuống dưới 0
  };

  const changelogItems = recentChangelogs?.map((log, index) => ({
    key: index.toString(), // Chuyển index sang string
    label: (
      <Badge
        status={log.read ? "default" : "processing"}
        text={
          vnMode
            ? `Dữ liệu ${log.eventId} [${log.detail}] ${log.eventType} ${log.productId !== "" ? log.productId : ""
            }`
            : `Data ${log.eventId} [${log.detail}] ${log.eventType} ${log.productId !== "" ? log.productId : ""
            }`
        }
      />
    ),
    style: !darkMode // Giữ nguyên style
      ? { backgroundColor: log.read ? "white" : "#f0f8ff" }
      : { backgroundColor: log.read ? "" : "#334255" },
    onClick: () => handleMarkAsRead(log.timestamp),
  }));

  const recentPagesItems = recentPages.map((page, index) => ({
    key: index.toString(),
    label: <a onClick={() => navigate(page)}>{page}</a>,
  }));

  const languageItems = [
    {
      key: "vn",
      label: (
        <span className="flex">
          <i className="mr-2">
            <svg
              viewBox="0 0 64 64"
              focusable="false"
              width="1.5em"
              height="1.5em"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="32" cy="32" r="30" fill="#f42f4c"></circle>
              <path
                fill="#ffe62e"
                d="M32 39l9.9 7l-3.7-11.4l9.8-7.4H35.8L32 16l-3.7 11.2H16l9.8 7.4L22.1 46z"
              ></path>
            </svg>
          </i>
          VN
        </span>
      ),
      onClick: toggleVNMode,
    },
    {
      key: "eng",
      label: (
        <span className="flex">
          <i className="mr-2">
            <svg
              viewBox="0 0 64 64"
              focusable="false"
              width="1.5em"
              height="1.5em"
              fill="currentColor"
              aria-hidden="true"
            >
              <g fill="#2a5f9e">
                <path d="M22 60.3V46.5l-10.3 7.6c2.9 2.7 6.4 4.8 10.3 6.2"></path>
                <path d="M42 60.3c3.9-1.4 7.4-3.5 10.3-6.2L42 46.4v13.9"></path>
                <path d="M3.7 42c.3 1 .7 1.9 1.2 2.9L8.8 42H3.7"></path>
                <path d="M55.2 42l3.9 2.9c.4-.9.8-1.9 1.2-2.9h-5.1"></path>
              </g>
              <g fill="#ffffff">
                <path d="M23.5 38H2.6c.3 1.4.7 2.7 1.1 4h5.1l-3.9 2.9c.8 1.7 1.7 3.2 2.8 4.7L18 42h4v2l-11.7 8.6l1.4 1.4L22 46.5v13.8c1.3.5 2.6.8 4 1.1V38h-2.5"></path>
                <path d="M61.4 38H38v23.4c1.4-.3 2.7-.7 4-1.1V46.5L52.3 54c1.4-1.3 2.6-2.7 3.8-4.2L45.4 42h6.8l6.1 4.5c.3-.5.6-1.1.8-1.6L55.2 42h5.1c.4-1.3.8-2.6 1.1-4"></path>
              </g>
              <g fill="#ed4c5c">
                <path d="M7.7 49.6c.8 1.1 1.6 2.1 2.5 3.1L22 44.1v-2h-4L7.7 49.6"></path>
                <path d="M45.5 42l10.7 7.8c.4-.5.7-1 1.1-1.5c.1-.1.1-.2.2-.2c.3-.5.7-1.1 1-1.6L52.2 42h-6.7"></path>
              </g>
              <g fill="#2a5f9e">
                <path d="M42 3.7v13.8l10.3-7.6C49.4 7.2 45.9 5.1 42 3.7"></path>
                <path d="M22 3.7c-3.9 1.4-7.4 3.5-10.3 6.2L22 17.6V3.7"></path>
                <path d="M60.3 22c-.3-1-.7-1.9-1.2-2.9L55.2 22h5.1"></path>
                <path d="M8.8 22l-3.9-2.9c-.4 1-.8 1.9-1.2 2.9h5.1"></path>
              </g>
              <g fill="#ffffff">
                <path d="M40.5 26h20.8c-.3-1.4-.7-2.7-1.1-4h-5.1l3.9-2.9c-.8-1.7-1.7-3.2-2.8-4.7L46 22h-4v-2l11.7-8.6l-1.4-1.4L42 17.5V3.7c-1.3-.5-2.6-.8-4-1.1V26h2.5"></path>
                <path d="M2.6 26H26V2.6c-1.4.3-2.7.7-4 1.1v13.8L11.7 10c-1.4 1.3-2.6 2.7-3.8 4.2L18.6 22h-6.8l-6.1-4.5c-.3.5-.6 1.1-.8 1.6L8.8 22H3.7c-.4 1.3-.8 2.6-1.1 4"></path>
              </g>
              <g fill="#ed4c5c">
                <path d="M56.3 14.4c-.8-1.1-1.6-2.1-2.5-3.1L42 19.9v2h4l10.3-7.5"></path>
                <path d="M18.5 22L7.9 14.2c-.4.5-.7 1-1.1 1.5c-.1.1-.1.2-.2.2c-.3.5-.7 1.1-1 1.6l6.1 4.5h6.8"></path>
                <path d="M61.4 26H38V2.6c-1.9-.4-3.9-.6-6-.6s-4.1.2-6 .6V26H2.6c-.4 1.9-.6 3.9-.6 6s.2 4.1.6 6H26v23.4c1.9.4 3.9.6 6 .6s4.1-.2 6-.6V38h23.4c.4-1.9.6-3.9.6-6s-.2-4.1-.6-6"></path>
              </g>
            </svg>
          </i>
          ENG
        </span>
      ),
      onClick: toggleENGMode,
    },
  ];

  if (recentChangelogs.length > 0) {
    changelogItems.push({
      key: "show-all",
      label: (
        <Button type="link">
          {vnMode ? "Hiển thị tất cả" : "Show all"}
        </Button>
      ),
      style: { textAlign: "center" },
      onClick: () => navigate("/super-admin/changelogpage"),
    });
  }

  changelogItems.push({
    key: "mark-all",
    label: (
      <Button type="link">
        {vnMode ? "Đánh dấu tất cả là đã đọc" : "Mark All As Read"}
      </Button>
    ),
    style: { textAlign: "center" },
    onClick: markAllAsRead,
  });

  const getAvatarContent = () => {
    if (user?.avatar && user?.avatar !== "") {
      return (
        <img
          alt={`${user.email}`}
          src={`data:image/jpeg;base64,${user.avatar.file.data}`}
          className="w-10 h-10 object-cover rounded-full"
        />
      );
    }
    const initials = user?.firstname || user?.lastname
      ? `${(user.firstname?.[0] || "").toUpperCase()}${(user.lastname?.[0] || "").toUpperCase()}`
      : user?.email?.[0]?.toUpperCase();
    return (
      <Avatar className="w-10 h-10 bg-gray-200 text-gray-600">
        {initials}
      </Avatar>
    );
  };

  const getMenuItems = () => {
    const currentPath = location.pathname;
    if (currentPath === '/admin/profile' || currentPath === '/admin/change-password') {
      return [
        {
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: collapsed ? "20px" : "30px" }}>
              <UserOutlined />
              {vnMode ? "Thông tin cá nhân" : "Profile"}
            </div>
          ),
          key: "profile",
          onClick: () => navigate("/admin/profile"),
        },
        {
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: collapsed ? "20px" : "30px" }}>
              <KeyOutlined />
              {vnMode ? "Đổi mật khẩu" : "Change Password"}
            </div>
          ),
          key: "change-password",
          onClick: () => navigate("/admin/change-password"),
        },
        {
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: collapsed ? "20px" : "30px" }}>
              <RollbackOutlined />
              {vnMode ? "Quay về trang quản trị" : "Back to the admin"}
            </div>
          ),
          key: "admin",
          onClick: () => navigate("/admin"),
        },
      ];
    }
    return menuItems;
  };

  const profileItems = [{
    key: "header",
    disabled: true,
    label: (
      <div className={`w-64 ${darkMode ? "bg-[#00162A]" : "bg-white"} shadow-lg rounded-lg p-4 cursor-default`}>
        <div className="flex flex-col items-center text-center">
          <div
            className={`rounded-full border-4 transition-all duration-300 ${darkMode ?
              "hover:border-[#5C6F8F] border-[#334255]" :
              "border-[#F5F5F5] hover:border-[#D9D9D9]"
              }`}
          >
            {getAvatarContent()}
          </div>
          <div className="mt-2 text-sm font-semibold">{user?.email}</div>
          <div className="text-sm text-gray-500">{user?.firstName && user?.lastName ? (user?.firstName + " " + user?.lastName + " - " + "Quản trị viên") : " "}</div>
        </div>

        <div className="mt-4">
          <div className="border-t mt-2"></div>
          <div onClick={() => navigate("/super-admin/profile")} className={`flex items-center py-2 px-3 ${darkMode ? "hover:bg-[#334255]" : "hover:bg-gray-100"} cursor-pointer rounded-md`}>
            <i className="fas fa-pencil-alt text-gray-500 mr-2"></i>
            <span>Customize Profile</span>
          </div>
          <div onClick={() => navigate("/super-admin/change-password")} className={`flex items-center py-2 px-3 ${darkMode ? "hover:bg-[#334255]" : "hover:bg-gray-100"} cursor-pointer rounded-md`}>
            <i className="fas fa-key text-gray-500 mr-2"></i>
            <span>Đổi mật khẩu</span>
          </div>
        </div>
        <button onClick={handleLogout} className={`w-full ${darkMode ? "hover:bg-[#334255] bg-[#1E293B]" : "hover:bg-blue-600 bg-blue-500"} text-white text-sm py-2 rounded-lg mt-4 transition-all duration-300`}>
          Đăng xuất
        </button>
      </div>
    )
  }
  ];

  return (
    <ConfigProvider
      theme={darkMode ? {
        token: {
          colorPrimary: "rgb(30 41 59 / var(--tw-text-opacity, 1))",
          colorBgContainerDisabled: "#3C3C3C",
          colorBgContainer: "#334255",
          colorText: "rgb(148 163 184 / var(--tw-text-opacity, 1))",
          // colorBgTextHover: "black",
          colorBorderBg: "white",
          colorIconHover: "white",
          // colorTextLabel: "black",
          // colorBgLayout: "black",
          colorBgElevated: "#001629",
          colorBorder: "rgb(148 163 184 / var(--tw-text-opacity, 1))",
          // colorTextBase: "black",
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
          // colorBgSpotlight: "black",
          colorPrimaryBg: "#334255",
          // colorBgTextActive: "black",
          colorBorderSecondary: "#6C757D",
          colorFill: "rgb(51 65 85 / var(--tw-text-opacity, 1))",
          colorFillAlter: "rgb(51 65 85 / var(--tw-text-opacity, 1))",
          // colorFillQuaternary: "black",
          // colorHighlight: "black",
          colorIcon: "white",
          colorFillSecondary: "black",
          colorFillTertiary: "#334255",
          colorSplit: "black",
          // colorPrimaryActive: "black",
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
        />
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
            className="mt-2"
            theme="dark"
            mode="inline"
            defaultOpenKeys={["product"]}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={getMenuItems().map((item) => ({
              ...item,
              children: item.children?.map((child) => ({
                ...child,
                label: <div className="" style={{ paddingLeft: collapsed ? "24px" : "40px" }} onClick={child.onClick}>{child.label}</div>,
              })),
            }))}
          />
        </Sider>

        <Layout>
          <Header
            className={`flex justify-between items-center p-4 ${darkMode ? "bg-[#001629]" : "bg-white"} shadow`}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={`text-lg ${darkMode ? "text-white" : "text-black"}`}
            />
            <div className="flex items-center space-x-6">
              <Dropdown
                menu={{ items: languageItems }}
                placement="bottomRight"
                arrow
                onOpenChange={fetchChangelogs}
              >
                <i className="text-2xl"> <svg viewBox="0 0 24 24" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true" > <path d="M0 0h24v24H0z" fill="none" /> <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z " className="css-c4d79v" /> </svg> </i>
              </Dropdown>
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
                  menu={{ items: changelogItems }}
                  placement="bottomRight"
                  arrow
                  onOpenChange={fetchChangelogs}
                >
                  <div className={`text-2xl ${darkMode ? "text-white" : "text-black"} cursor-pointer`}>
                    <BellOutlined />
                  </div>
                </Dropdown>
              </div>
              <div>
                <Dropdown menu={{ items: recentPagesItems }} placement="bottomRight" arrow>
                  <div className={`text-2xl ${darkMode ? "text-white" : "text-black"} cursor-pointer`}>
                    <HistoryOutlined />
                  </div>
                </Dropdown>
              </div>
              <div>
                <Dropdown
                  menu={{
                    items: [
                      ...searchResults.map((item, index) => ({
                        key: index,
                        label: (
                          <div className="flex items-center">
                            {item.avatar ? item.avatar.src !== '' ? (
                              <Avatar src={item.avatar.src} alt={item.avatar.alt} />
                            ) : (
                              <Avatar icon={<UserOutlined />} />
                            ) : (<></>)}
                            <span className="ml-2">{item.name}</span>
                          </div>
                        ),
                        onClick: () => navigate(item.link),
                      })),
                      ...(searchResults.length > 0 ? [
                        {
                          key: 'show-all',
                          label: (
                            <Button
                              className="w-full mt-2"
                              type="primary"
                              onClick={handleShowAll}
                            >
                              Hiển thị tất cả
                            </Button>
                          ),
                        }
                      ] : []),
                    ]
                  }}
                  open={searchValue && searchResults.length > 0}
                  placement="bottom"
                >
                  <div className="text-2xl w-72">
                    <Input.Search
                      placeholder={vnMode ? "Tìm kiếm danh mục, sản phẩm, ..." : "Search category, product, ..."}
                      onChange={handleSearchChange}
                      value={searchValue}
                      onSearch={handleShowAll}
                      className={`w-full h-full`}
                    />
                  </div>
                </Dropdown>
              </div>
              <div className="relative">
                <Dropdown
                  menu={{ items: profileItems }}
                  placement="bottomLeft"
                  trigger={["click"]}
                  overlayClassName="submenu"
                >
                  <div
                    className={`cursor-pointer rounded-full border-4 transition-all duration-300 
                      ${darkMode ?
                        "hover:border-[#5C6F8F] border-[#334255]" :
                        "border-[#F5F5F5] hover:border-[#D9D9D9]"
                      } flex items-center justify-center `}
                  >
                    {getAvatarContent()}
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
              className={`${darkMode ? "dark:text-[#94A3B8] bg-[#001629]" : "text-slate-800 bg-white"}`}
            >
              <Outlet context={{ vnMode, setLastViewedOrderId }} />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>

  );
};

export default AdminAuthentication;
