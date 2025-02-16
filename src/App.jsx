import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Authentication from "./components/Authentication";
import Account from "./view/Account";
import AdminAuthentication from "./view/Admin/AdminAuthentication";
import { adminRoutes, publicRoutes, userRoutes, publicAdminRoutes } from "./routers/routes";
import AdminLayout from "./components/AdminLayout";

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

        <Route>
          {publicAdminRoutes.map(({ path, Component }) => (
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

        <Route element={<AdminLayout />}>
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
