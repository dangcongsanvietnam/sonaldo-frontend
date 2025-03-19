import React, { createContext, useContext, useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Footer from "../Footer";
import { useDispatch, useSelector } from "react-redux";
import { getAdminCategories } from "../../services/categoryService";
import { getUserCart, removeCartItem, updateQuantityCartItem } from "../../services/cartService";
import { useLoading } from "../../provider/LoadingProvider";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { getAdminBrands } from "../../services/brandService";
import { Checkbox, Drawer } from "antd";
import { PlusOutlined, MinusOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { debounce } from "lodash";
import { getUserInfo } from "../../services/userService";
import Cookies from "js-cookie";

const DrawerContext = createContext({
  toggleDrawer: () => { },
});

const Layout = () => {
  const [vnMode, setVNMode] = useState(
    () => localStorage.getItem("vnMode") === "true"
  );
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [navbarHeight, setNavbarHeight] = useState(0);
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const userCart = useSelector((state) => state.cart?.userCart);
  const [minusLoading, setMinusLoading] = useState("");
  const [plusLoading, setPlusLoading] = useState("");
  const user = useSelector((state) => state.user.data);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const categoryList = useSelector((state) => state.category?.categories?.data);
  const brandList = useSelector((state) => state.brand?.brands?.data);
  const [isDrawerOpen, setIsDrawerOpen] = useState(
    localStorage.getItem("cartDrawerOpen") === "true"
  );
  const getLocalizedText = (text) => {
    if (!text) return "";
    const parts = text.split(" || ");
    return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
  };
  const navigate = useNavigate();
  const location = useLocation();
  const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 80) {
        setIsNavbarVisible(false);
      } else {
        setIsNavbarVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    startLoading();

    const token = Cookies.get("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
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
            return;
          }
        } catch {
          return;
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
    const handleStorageChange = () => {
      setIsDrawerOpen(localStorage.getItem("cartDrawerOpen") === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(newState);
    localStorage.setItem("cartDrawerOpen", newState.toString());
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    const navbar = document.getElementById("navbar");
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight);
    }
  }, []);

  useEffect(() => {
    startLoading();
    dispatch(getAdminCategories());
    dispatch(getAdminBrands());
    stopLoading();
  }, [dispatch]);

  const handleDeleteCartItem = (cartItemId) => {
    setIsProcessing(true);
    dispatch(removeCartItem(cartItemId))
      .unwrap()
      .then(() => {
        dispatch(getUserCart()).then(() => {
        });
        setIsProcessing(false);
      })
      .catch(() => {
        toast.error("Đã xảy ra lỗi khi xóa sản phẩm!");
        setIsProcessing(false);
      });
  };

  const handleQuantityChange = debounce((item, newQuantity) => {
    if (newQuantity < 0) return;
    if (newQuantity > item.productQuantity) {
      toast.warn("Số lượng mua không thể lớn hơn số lượng sản phẩm");
      return;
    }
    if (newQuantity > item.quantity) {
      setPlusLoading(item.cartItemId);
    } else {
      setMinusLoading(item.cartItemId);
    }

    if (newQuantity > 0) {
      dispatch(
        updateQuantityCartItem({
          cartItemId: item?.cartItemId,
          quantity: newQuantity,
        })
      )
        .unwrap()
        .then(() => {
          setMinusLoading("");
          setPlusLoading("");
          dispatch(getUserCart());
        })
        .catch(() => {
          setMinusLoading("");
          setPlusLoading("");
          toast.error("Đã xảy ra lỗi khi cập nhật số lượng!");
        });
    }
  }, 800)

  useEffect(() => {
    startLoading();
  
    setTimeout(() => {
      stopLoading();
    }, 1000);
  }, [vnMode]);

  return (
    <>
      {isLoading && (
        <div className="loading-overlay show">
          <img
            src="https://assets-v2.lottiefiles.com/a/ad10a15c-a6d5-11ee-a502-abb0403d8272/du1fB141eN.gif"
            alt="Loading..."
          />
        </div>
      )}
      <div className="min-h-screen flex flex-col">
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
          style={{ zIndex: 10000 }}
        />
        <DrawerContext.Provider value={{ toggleDrawer }}>
          <div
            id="navbar"
            className={`fixed top-0 w-full bg-white shadow-md z-[9999] transition-transform duration-300 ${isNavbarVisible ? "translate-y-0" : "-translate-y-full"
              }`}
          >
            <Navbar categoryList={categoryList} brandList={brandList} vnMode={vnMode} setVNMode={setVNMode} />
          </div>
          <div style={{ paddingTop: navbarHeight + "px" }}>
            <Outlet context={{ vnMode }} />
            <Footer />
          </div>
          <Drawer zIndex={9999} title={<span className="text-lg font-bold">Your cart</span>} placement="right" width={400} onClose={toggleDrawer} open={isDrawerOpen}>
            <div className="p-4 space-y-4">
              <div className="border-b pb-2 flex justify-between text-sm font-semibold">
                <span>Products</span>
                <span>Total</span>
              </div>

              {userCart?.cartItems?.map((item) => (
                <div key={item?.cartItemId} className="flex items-center space-x-4 border-b pb-4">
                  <img src={`data:image/jpeg;base64,${item?.productImage?.file?.data}`} alt={getLocalizedText(item?.productName)} className="w-12 h-12 rounded cursor-pointer" onClick={() => navigate(`/product/${item?.productId}`)} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold cursor-pointer" onClick={() => navigate(`/product/${item?.productId}`)}>{getLocalizedText(item?.productName)}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(item?.totalPrice / item?.quantity)} vnđ</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button disabled={item.quantity === 1} className="border p-1 rounded" onClick={() => handleQuantityChange(item, item?.quantity - 1)}>
                        {minusLoading === item.cartItemId ? (
                          <LoadingOutlined />
                        ) : (
                          <MinusOutlined />
                        )}
                      </button>
                      <span className="px-3">{item?.quantity}</span>
                      <button disabled={item.quantity === item.productQuantity} className="border p-1 rounded" onClick={() => handleQuantityChange(item, item?.quantity + 1)}>
                        {plusLoading === item.cartItemId ? (
                          <LoadingOutlined />
                        ) : (
                          <PlusOutlined />
                        )}
                      </button>
                      <button className="text-red-500 ml-2" onClick={() => handleDeleteCartItem(item?.cartItemId)}>
                        {isProcessing ? (
                          <LoadingOutlined />
                        ) : (
                          <DeleteOutlined />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(item?.totalPrice)} vnđ</p>
                </div>
              ))}

              <div className="border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Estimated total</span>
                  <span className="text-lg font-bold">{formatCurrency(userCart?.totalPrice)} vnđ</span>
                </div>
                <p className="text-xs text-gray-500">Taxes, Discounts and shipping calculated at checkout</p>
              </div>

              <div className="flex items-center mt-2">
                <Checkbox defaultChecked className="mr-2" />
                <div className="text-xs">
                  <span className="font-semibold">Shipping Protection</span> <span className="text-gray-500">$7.15</span>
                </div>
              </div>

              <button onClick={() => {
                navigate("/carts");
                toggleDrawer();
              }} className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-semibold mt-4">Check out</button>
            </div>
          </Drawer>
        </DrawerContext.Provider>
      </div>
    </>
  );
};

export const useDrawer = () => useContext(DrawerContext);
export default Layout;
