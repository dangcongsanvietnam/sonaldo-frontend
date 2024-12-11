import Navbar from "./components/Navbar/Navbar";
import { BrowserRouter } from "react-router-dom";
import Login from "./view/login";
import { Routes, Route } from "react-router-dom";
import Home from "./view/Home";
import Layout from "./components/Layout";
import Register from "./view/Register";
import Profile from "./view/Profile";
import Authentication from "./components/Authentication";
import Account from "./view/Account";
import Address from "./view/Address";
import VerifyEmail from "./components/VerifyEmail";
import ChangePassword from "./view/ChangePassword";
import ForgetPassword from "./components/ForgetPassword";
import ResetPassword from "./components/ResetPassword";
import AdminAuthentication from "./view/Admin/AdminAuthentication";
import ProductList from "./view/Admin/Product/ProductList";
import AddProduct from "./view/Admin/Product/AddProduct";
import Order from "./view/Admin/Order";
import UserManagement from "./view/Admin/CustomerManagement";
import BrandList from "./view/Admin/Brand/BrandList";
import BrandDetail from "./view/Admin/Brand/BrandDetail";
import BrandCategoryDetail from "./view/Admin/Brand/BrandDetail/BrandCategoryDetail";
import { Category } from "@mui/icons-material";
import CategoryList from "./view/Admin/Category/CategoryList";
import CustomerManagement from "./view/Admin/CustomerManagement";
import CategoryDetail from "./view/Admin/Category/CategoryDetail";
import CategoryItemDetail from "./view/Admin/Category/CategoryDetail/CategoryItemDetail";
import ProductDetail from "./view/Admin/Product/ProductDetail";
import AddCategory from "./view/Admin/Category/AddCategory";
import Addbrand from "./view/Admin/Brand/AddBrand";

import CategoryPageDetail from "./view/Admin/Category/CategoryPageDetail";
import CategoryPage from "./view/Admin/Category/CategoryPage";
import { adminRoutes, publicRoutes, userRoutes } from "./routers/routes";

export default function App() {
  return (
    <div>
      {/* <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/public/category/:categoryId"
            element={<CategoryPageDetail />}
          />
          <Route path="/public/category" element={<CategoryPage />} />
          <Route path="/" element={<Authentication />}>
            <Route path="/" element={<AdminAuthentication />}>
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/brand" element={<BrandList />} />
              <Route path="/category" element={<CategoryList />} />
              <Route path="/add-category" element={<AddCategory />} />
              <Route
                path="/category/:categoryId"
                element={<CategoryDetail />}
              />

              <Route path="/brand/:brandId" element={<BrandDetail />} />
              <Route
                path="/brand/:brandId/:brandCategoryId"
                element={<BrandCategoryDetail />}
              />
              <Route
                path="/category/:categoryId/:categoryItemId"
                element={<CategoryItemDetail />}
              />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/add-brand" element={<Addbrand />} />

              <Route path="/order" element={<Order />} />
              <Route path="/customers" element={<CustomerManagement />} />
            </Route>
            <Route path="/" element={<Account />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/address" element={<Address />} />
            </Route>
          </Route>
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminAuthentication />} />
        </Route> */}

      {/* {publicRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={<route.Component></route.Component>}
          ></Route>
        ))} */}
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          {publicRoutes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Route>

        {/* User Routes */}
        <Route path="/" element={<Authentication />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Account />}>
              {userRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Route>
          </Route>
        </Route>

        {/* Admin Routes */}

        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminAuthentication />}>
            {adminRoutes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>
        </Route>

        {/* Catch-All Route */}
      </Routes>
    </div>
  );
}
