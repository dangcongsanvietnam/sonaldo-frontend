import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavLinks from "./NavLinks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CloseOutlined, HeartOutlined, LeftOutlined, QuestionCircleOutlined, RightOutlined, SearchOutlined, ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
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

const Navbar = ({ cart, categoryList, brandList }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const token = Cookies.get("token");
  const { toggleDrawer } = useDrawer();

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
  const suggestProducts = useSelector(
    (state) => state?.product?.suggestProducts
  );

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

  const handleClearHistory = () => {
    setSearchHistory([]);
    Cookies.remove("searchHistory");
  };

  return (
    <>
      <div className="text-black text-center h-16">
        <div className="flex justify-between items-center px-4 bg-[#F8F8F8] w-full h-[60%]">
          <button className="text-black bg-[#ABD9FF] justify-start border py-1 px-2 rounded-md text-xs shadow-xl">&larr; COMMUNITY</button>
          <div className="flex w-[20%] justify-end">
            <span onClick={handleProfileClick} className="cursor-pointer mx-4">
              <UserOutlined /> {token ? "Account" : "Login"}
            </span>
            <span className="cursor-pointer"><QuestionCircleOutlined /> Help Center</span>
          </div>
        </div>
        <div
          className="relative w-full h-[40%] bg-white shadow-md overflow-hidden flex justify-center items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="w-full max-w-[600px] overflow-hidden relative flex justify-center">
            <motion.div
              key={index}
              initial={{ x: direction === 1 ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: direction === 1 ? "-100%" : "100%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className=" w-full text-center"
            >
              <span>
                {slides[index]}{" "}
                <a href="#" className="text-blue-500">
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
      <nav className="bg-yellow-400">
        <div className="flex items-center font-medium w-full justify-around">
          <ul className="md:flex hidden uppercase items-center gap-8 font-sans text-sm w-[30%]">
            <li>
              <Link to="/" className="py-7 px-3 inline-block hover:underline hover:underline-offset-4 hover:text-black">
                Home
              </Link>
            </li>
            <NavLinks menu="" setMenu={() => { }} categoryList={categoryList} brandList={brandList} />
          </ul>

          <div onClick={() => navigate("/")} className="z-50 p-2 md:w-[10%] w-full flex md:place-content-center justify-between cursor-pointer">
            <img src={Logo} alt="LEGO" className="h-14" />
          </div>

          <div className="md:flex justify-around w-[30%] uppercase font-sans text-xs hidden cursor-pointer">
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
            />
            <CloseOutlined
              onClick={() => setSearchOpen(false)}
              className="absolute right-0 top-0 mt-2 mr-10 cursor-pointer"
            />

            {(filteredHistory.length > 0 ||
              tags.length > 0 ||
              suggestProducts.length > 0) && (
                <div className="absolute z-10 bg-white border w-1/2 border-gray-300 shadow-md rounded-md mt-[50px]">
                  {filteredHistory.length > 0 && (
                    <div className="px-4 py-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">
                          Lịch sử tìm kiếm
                        </span>
                        <span
                          className="text-red-500 cursor-pointer text-sm"
                          onClick={handleClearHistory}
                        >
                          Xóa tất cả
                        </span>
                      </div>
                      {filteredHistory.map((history, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSearchText(history);
                            debouncedSearch(history);
                          }}
                        >
                          {history}
                        </div>
                      ))}
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div>
                      <div className="pl-4 py-2 font-semibold text-gray-700">
                        Nhãn sản phẩm
                      </div>
                      <Row className="cursor-pointer px-4" gutter={16}>
                        {hotTag &&
                          [...hotTag]
                            .sort((a, b) => b.frequency - a.frequency)
                            .slice(0, 4)
                            .map((hot, index) => (
                              <Col key={`hot-${index}`} span={6}>
                                {" "}
                                <Tag
                                  color="gold"
                                  className="ml-3 mr-3 mb-3 flex justify-between items-center cursor-pointer"
                                  onClick={() =>
                                    alert(`Hot Tag Selected: ${hot.tagName}`)
                                  }
                                >
                                  <FontAwesomeIcon
                                    icon={faFire}
                                    className="text-red-500 mr-2"
                                  />
                                  <div className="text-lg">{hot.tagName}</div>
                                </Tag>
                              </Col>
                            ))}

                        {tags.map((result, index) => (
                          <Col key={index} span={6}>
                            {" "}
                            <Tag
                              className="ml-3 mr-3 cursor-pointer mb-3 flex justify-end items-center"
                              onClick={() =>
                                alert(`You selected: ${result.tagName}`)
                              }
                            >
                              <div className="text-lg">{result.tagName}</div>
                            </Tag>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {suggestProducts.length > 0 && (
                    <div>
                      <div className="pl-4 py-2 font-semibold text-gray-700">
                        Sản phẩm
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2 px-4">
                        {suggestProducts.map((product, index) => (
                          <Card
                            key={index}
                            hoverable
                            className="p-4"
                            onClick={() => alert(`You selected: ${product.name}`)}
                          >
                            <div className="flex items-center gap-4">
                              <img
                                alt="example"
                                src={`data:image/jpeg;base64,${product?.imageUrl?.file?.data}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <div className="font-semibold">{product.name}</div>
                                <div className="text-gray-600">
                                  Price: {product.price}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
        <Modal
          title="Sign In to your LEGO® Account"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          centered
        >
          <div className="text-center">
            <Button onClick={() => navigate("/login")} className="w-full border-blue-500 text-lg rounded-lg">
              Sign In
            </Button>
            <p className="mt-4">
              Don't have an account?{" "}
              <a href="/register" className="text-blue-500">
                Register
              </a>
            </p>
          </div>
        </Modal>
      </nav>
    </>

  );
};

export default Navbar;
