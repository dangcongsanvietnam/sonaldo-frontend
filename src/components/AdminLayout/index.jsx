import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import BASE_URL from "../../api";
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo } from "../../services/userService";
import { useLoading } from "../../provider/LoadingProvider";

const AdminLayout = () => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [vnMode, setVNMode] = useState(
    () => localStorage.getItem("vnMode") === "true"
  );
  const user = useSelector((state) => state.user.data);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    startLoading();

    const token = Cookies.get("token");
    const role = localStorage.getItem("role");

    if (!token || !role || (role !== "ROLE_ADMIN" && role !== "ROLE_MANAGER")) {
      navigate("/login/admin");
      stopLoading();
      return;
    }

    if (!user || !user.email) {
      const validateToken = async () => {
        try {
          const response = await BASE_URL.get(
            `api/v1/auth/validate-token?token=${token}&role=${role}`
          );
          if (response.status === 200) {
            await dispatch(getUserInfo(token));
          } else {
            navigate("/login/admin");
          }
        } catch {
          navigate("/login/admin");
        } finally {
          stopLoading();
        }
      };

      validateToken();
    } else {
      stopLoading();
    }
  }, [dispatch, location.pathname, navigate, user, window.performance]);

  useEffect(() => {
    startLoading();

    setTimeout(() => {
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("darkMode", darkMode);

      stopLoading();
    }, 1000);
  }, [darkMode]);

  useEffect(() => {
    startLoading();

    setTimeout(() => {
      stopLoading();
    }, 1000);
  }, [vnMode]);

  return (
    <>
      {isLoading && (
        <div
          className={
            darkMode ? "loading-overlay2 show" : "loading-overlay show"
          }
        >
          <img
            src="https://assets-v2.lottiefiles.com/a/ad10a15c-a6d5-11ee-a502-abb0403d8272/du1fB141eN.gif"
            alt="Loading..."
          />
        </div>
      )}
      <div className="h-full flex flex-col">
        <Outlet context={{ darkMode, vnMode, setDarkMode, setVNMode }} />
      </div>
    </>
  );
};

export default AdminLayout;
