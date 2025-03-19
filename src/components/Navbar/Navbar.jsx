import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavLinks from "./NavLinks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CloseOutlined, FireOutlined, HeartOutlined, LeftOutlined, MenuOutlined, QuestionCircleOutlined, RightOutlined, SearchOutlined, ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Col, Row, Input, Tag, Modal, Button } from "antd";
import debounce from "lodash/debounce";
import Cookies from "js-cookie";
import "./Navbar.css";
import {
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { searchProducts } from "../../services/productService";
import { getAllHotSearch } from "../../services/searchService";
import Logo from '../../assets/logo.svg';
import { motion } from "framer-motion";
import { useDrawer } from "../Layout";

const slides = [
  "Get a Ferrari 499P – Hypercar with selected Ferrari vehicle purchase*",
  "Exclusive Lamborghini Huracán EVO discount available now!",
  "Limited-time offer on McLaren 720S – Drive your dream car today!",
  "New Porsche 911 Turbo S – Performance meets luxury!",
];

const Navbar = ({ categoryList, brandList, vnMode, setVNMode }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [menu, setMenu] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const token = Cookies.get("token");
  const { toggleDrawer } = useDrawer();
  const getLocalizedText = (text) => {
    if (!text) return "";
    const parts = text.split(" || ");
    return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
  };

  const handleProfileClick = () => {
    if (token) {
      navigate("/profile");
    } else {
      setIsModalVisible(true);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const tags = useSelector((state) => state?.product?.tags);
  const products = useSelector(
    (state) => state?.product?.suggestProducts
  );

  const suggestProducts = useMemo(() => {
    if (!products) return null;

    return products.map((product) => ({
      ...product,
      name: getLocalizedText(product.name),
    }));
  }, [products, vnMode]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 10000);

    return () => clearInterval(interval);
  }, [index, isPaused]);

  useEffect(() => {
    const storedHistory = Cookies.get("searchHistory");
    setSearchHistory(storedHistory ? JSON.parse(storedHistory) : []);
  }, []);

  const toggleVNMode = () => {
    setVNMode(true);
  };

  const toggleENGMode = () => {
    setVNMode(false);
  };

  const saveSearchHistory = (keyword) => {
    if (keyword.trim() === "") return;

    let updatedHistory = [...searchHistory];
    if (!updatedHistory.includes(keyword)) {
      updatedHistory = [keyword, ...updatedHistory.slice(0, 9)];
    }

    setSearchHistory(updatedHistory);
    Cookies.set("searchHistory", JSON.stringify(updatedHistory), {
      expires: 7,
    });
  };

  const debouncedSearch = useCallback(
    debounce((keyword) => {
      dispatch(searchProducts(keyword));
      dispatch(getAllHotSearch(1, 10));
    }, 500),
    []
  );

  useEffect(() => {
    dispatch(getAllHotSearch(1, 10));
  }, [dispatch]);

  const nextSlide = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const prevSlide = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const hotTag = useSelector((state) => state?.search?.data);

  const inputHandleChange = (e) => {
    const keyword = e.target.value;
    setSearchText(keyword);

    if (keyword.length > 0) {
      const matchingHistory = searchHistory
        .filter((item) => item.toLowerCase().includes(keyword.toLowerCase()))
        .slice(0, 3);
      setFilteredHistory(matchingHistory);

      debouncedSearch(keyword);
    } else {
      setFilteredHistory([]);
      debouncedSearch("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchText.trim() !== "") {
      saveSearchHistory(searchText.trim());
      setSearchOpen(false);
    }
  };

  const showModal = () => {
    setIsModalVisible2(true);
  };

  const handleCancel2 = () => {
    setIsModalVisible2(false);
  };

  return (
    <>
      <div className="text-black text-center">
        <div className="flex justify-between items-center px-4 bg-[#F8F8F8] w-full">
          <button className="text-black bg-[#ABD9FF] justify-start border py-1 px-2 rounded-md text-xs shadow-xl">&larr; {vnMode ? "CỘNG ĐỒNG" : "COMMUNITY"}</button>
          <div className="flex w-[20%] justify-end">
            <span onClick={handleProfileClick} className="cursor-pointer mx-4">
              <UserOutlined />
              <span className="hidden sm:block">
                {token ? vnMode ? "Tài khoản" : "Account" : vnMode ? "Đăng nhập" : "Login"}
              </span>
            </span>
            <span className="cursor-pointer"><QuestionCircleOutlined />
              <span className="hidden sm:block">
                {vnMode ? "Trung tâm hỗ trợ" : "Help Center"}
              </span>
            </span>
            <button onClick={showModal} className="mx-4 text-lg">
              <i className="text-2xl"> <svg viewBox="0 0 24 24" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true" > <path d="M0 0h24v24H0z" fill="none" /> <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z " className="css-c4d79v" /> </svg> </i>
            </button>
          </div>
        </div>
        <div
          className="relative w-full bg-white shadow-md flex justify-center items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="w-full max-w-full relative flex justify-center p-2 sm:p-4">
            <motion.div
              key={index}
              initial={{ x: direction === 1 ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: direction === 1 ? "-100%" : "100%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full text-center text-sm sm:text-base whitespace-normal leading-normal"
            >
              <span>
                {slides[index]}{" "}
                <a href="#" className="text-blue-500 underline">
                  Learn more
                </a>
              </span>
            </motion.div>
          </div>

          <button
            className="absolute left-5"
            onClick={prevSlide}
          >
            <LeftOutlined />
          </button>

          <button
            className="absolute right-5"
            onClick={nextSlide}
          >
            <RightOutlined />
          </button>
        </div>
      </div>
      <nav className="bg-yellow-400 px-4">
        <div className="flex items-center font-medium w-full justify-around">
          <ul className="md:flex hidden uppercase items-center gap-8 font-sans text-sm w-[30%]">
            <li>
              <Link to="/" className="py-7 px-3 inline-block hover:underline hover:underline-offset-4 hover:text-black">
                {vnMode ? "Trang chủ" : "Home"}
              </Link>
            </li>
            <NavLinks menu={menu} setMenu={setMenu} categoryList={categoryList} brandList={brandList} vnMode={vnMode} />
          </ul>
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenu(true)} className="p-3">
              <MenuOutlined className="text-2xl" />
            </button>
          </div>

          <div onClick={() => navigate("/")} className="z-50 p-2 md:w-[10%] w-full flex md:place-content-center justify-between cursor-pointer">
            <img src={Logo} alt="LEGO" className="h-14" />
          </div>

          <div className="flex justify-around space-x-2 md:w-[30%] uppercase font-sans text-xs cursor-pointer">
            <div className="flex gap-1" onClick={() => navigate("/wishlists")}>
              <HeartOutlined style={{ fontSize: '20px' }} />
            </div>
            <div
              className="flex gap-1"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <SearchOutlined style={{ fontSize: '20px' }} />
            </div>
            <div className="relative cursor-pointer" onClick={toggleDrawer}>
              <ShoppingCartOutlined style={{ fontSize: '20px' }} />
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="relative flex justify-center py-4">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm sản phẩm ... "
              className="w-1/2 rounded-full h-10"
              onChange={inputHandleChange}
              onKeyDown={handleKeyDown}
              value={searchText}
              allowClear
            />
            <CloseOutlined
              onClick={() => {
                setSearchOpen(false);
                setSearchText("");
              }}
              className="absolute right-0 top-0 mt-2 mr-10 cursor-pointer"
            />

            {(filteredHistory.length > 0 || tags.length > 0 || suggestProducts.length > 0) && searchText !== "" && (
              <div className="absolute z-10 bg-white border w-1/2 border-gray-300 shadow-md rounded-md mt-[50px] max-h-96 overflow-y-auto transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <div>
                    <div className="font-semibold text-gray-700 mb-2">{vnMode ? "Đề xuất" : "Suggestions"}</div>
                    <div className="space-y-2">
                      {hotTag && searchText.length < 4 && [...hotTag]
                        .sort((a, b) => b.frequency - a.frequency)
                        .slice(0, 4)
                        .map((tag, index) => (
                          <div
                            key={index}
                            className="flex px-4 py-2 cursor-pointer text-gray-700 justify-between hover:bg-gray-100"
                            onClick={() => alert(`Tag Selected: ${tag.tagName}`)}
                          >
                            <span className="font-bold">{tag.tagName}</span>
                            <FireOutlined className="text-red-500" />
                          </div>
                        ))}
                      {tags.map((tag, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                          onClick={() => alert(`Tag Selected: ${tag.tagName}`)}
                        >
                          {tag.tagName}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-gray-700 mb-2">{vnMode ? "Sản phẩm" : "Products"}</div>
                    <div className="space-y-2">
                      {suggestProducts.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 p-2 rounded"
                          onClick={() => alert(`You selected: ${product.name}`)}
                        >
                          <img
                            alt="example"
                            src={`data:image/jpeg;base64,${product?.imageUrl?.file?.data}`}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-semibold text-gray-800">{product.name}</div>
                            <div className="text-gray-600 text-sm">{vnMode ? "Giá:" : "Price:"} {product.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}



        <Modal
          title={vnMode ? "Đăng nhập vào tài khoản LEGO® của bạn" : "Sign In to your LEGO® Account"}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          centered
          zIndex={10000}
        >
          <div className="text-center">
            <Button
              onClick={() => navigate("/login")}
              className="w-full border-blue-500 text-lg rounded-lg"
            >
              {vnMode ? "Đăng nhập" : "Sign In"}
            </Button>
            <p className="mt-4">
              {vnMode ? "Bạn chưa có tài khoản?" : "Don't have an account?"}{" "}
              <a href="/register" className="text-blue-500">
                {vnMode ? "Đăng ký" : "Register"}
              </a>
            </p>
          </div>
        </Modal>

        <Modal
          title={vnMode ? "Chọn ngôn ngữ" : "Select Language"}
          open={isModalVisible2}
          onCancel={handleCancel2}
          footer={null}
          zIndex={10000}
          className="!w-56"
        >
          <div className="flex items-center flex-col gap-4">
            <div className="border px-6 py-2 cursor-pointer hover:bg-gray-100" onClick={() => { toggleVNMode(); handleCancel2(); }}>
              <span className="flex items-center">
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
            </div>
            <div className="border px-5 py-2 cursor-pointer hover:bg-gray-100" onClick={() => { toggleENGMode(); handleCancel2(); }}>
              <span className="flex items-center">
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
            </div>
          </div>
        </Modal>
      </nav>
    </>

  );
};

export default Navbar;
