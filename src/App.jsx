import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Authentication from "./components/Authentication";
import Account from "./view/Account";
import AdminAuthentication from "./view/Admin/AdminAuthentication";
import { adminRoutes, publicRoutes, userRoutes, publicAdminRoutes, superAdminRoutes } from "./routers/routes";
import AdminLayout from "./components/AdminLayout";
import SuperAdminAuthentication from "./view/SuperAdmin/SuperAdminAuthentication";

export default function App() {
  return (
    <div>
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
          <Route path="/super-admin" element={<SuperAdminAuthentication />}>
            {superAdminRoutes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>
        </Route>

        {/* Catch-All Route */}
      </Routes>
    </div>
  );
}
