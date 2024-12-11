import { BrowserRouter } from "react-router-dom";
import Login from "./../view/login";
import { Routes, Route } from "react-router-dom";
import Home from "./../view/Home";
import Layout from "./../components/Layout";
import Register from "./../view/Register";
import Profile from "./../view/Profile";
import Authentication from "./../components/Authentication";
import Account from "./../view/Account";
import Address from "./../view/Address";
import VerifyEmail from "./../components/VerifyEmail";
import ChangePassword from "./../view/ChangePassword";
import ForgetPassword from "./../components/ForgetPassword";
import ResetPassword from "./../components/ResetPassword";
import AdminAuthentication from "./../view/Admin/AdminAuthentication";
import ProductList from "./../view/Admin/Product/ProductList";
import AddProduct from "./../view/Admin/Product/AddProduct";
import Order from "./../view/Admin/Order";
import UserManagement from "./../view/Admin/CustomerManagement";
import BrandList from "./../view/Admin/Brand/BrandList";
import BrandDetail from "./../view/Admin/Brand/BrandDetail";
import BrandCategoryDetail from "./../view/Admin/Brand/BrandDetail/BrandCategoryDetail";
import { Category } from "@mui/icons-material";
import CategoryList from "./../view/Admin/Category/CategoryList";
import CustomerManagement from "./../view/Admin/CustomerManagement";
import CategoryDetail from "./../view/Admin/Category/CategoryDetail";
import CategoryItemDetail from "./../view/Admin/Category/CategoryDetail/CategoryItemDetail";
import ProductDetail from "./../view/Admin/Product/ProductDetail";
import AddCategory from "./../view/Admin/Category/AddCategory";
import Addbrand from "./../view/Admin/Brand/AddBrand";

import CategoryPageDetail from "./../view/Admin/Category/CategoryPageDetail";
import CategoryPage from "./../view/Admin/Category/CategoryPage";
import PublicProductDetail from "../view/PublicProductDetail";

// publicRoutes.js
export const publicRoutes = [
  { path: "/", Component: Home },
  { path: "/public/category/:categoryId", Component: CategoryPageDetail },
  { path: "/public/category", Component: CategoryPage },
  { path: "/register", Component: Register },
  { path: "/login", Component: Login },
  { path: "/verify-email", Component: VerifyEmail },
  { path: "/forget-password", Component: ForgetPassword },
  { path: "/reset-password", Component: ResetPassword },
  { path: "/product/:id", Component: PublicProductDetail },
];

// userRoutes.js
export const userRoutes = [
  { path: "/profile", Component: Profile },
  { path: "/change-password", Component: ChangePassword },
  { path: "/address", Component: Address },
];

// adminRoutes.js
export const adminRoutes = [
  { path: "products", Component: ProductList }, // Loại bỏ dấu /
  { path: "products/:productId", Component: ProductDetail },
  { path: "brand", Component: BrandList },
  { path: "category", Component: CategoryList },
  { path: "add-category", Component: AddCategory },
  { path: "category/:categoryId", Component: CategoryDetail },
  { path: "brand/:brandId", Component: BrandDetail },
  { path: "brand/:brandId/:brandCategoryId", Component: BrandCategoryDetail },
  {
    path: "category/:categoryId/:categoryItemId",
    Component: CategoryItemDetail,
  },
  { path: "add-product", Component: AddProduct },
  { path: "add-brand", Component: Addbrand },
  { path: "order", Component: Order },
  { path: "customers", Component: CustomerManagement },
];
