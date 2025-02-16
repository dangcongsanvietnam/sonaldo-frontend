import React, { useCallback, useEffect, useState } from "react";
import logo from "./../../assets/download.png";
import { Link, useNavigate } from "react-router-dom";
import NavLinks from "./NavLinks";
import Button from "../Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { Card, Col, Row, Input, Tag } from "antd";
import debounce from "lodash/debounce";
import Cookies from "js-cookie";
import "./Navbar.css";
import {
  faMagnifyingGlass,
  faHeart,
  faCartShopping,
  faUser,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { searchProducts } from "../../services/productService";
import { getAllHotSearch } from "../../services/searchService";

const Navbar = ({ isLoading, cart, categoryList }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredHistory, setFilteredHistory] = useState([]); // Lưu lịch sử gợi ý đã lọc
  const [searchHistory, setSearchHistory] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = Cookies.get("token");

  console.log("tk", token);

  const handleProfileClick = () => {
    token ? navigate("/profile") : navigate("/login");
  };

  const tags = useSelector((state) => state?.product?.tags);
  const suggestProducts = useSelector(
    (state) => state?.product?.suggestProducts
  );

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

  const hotTag = useSelector((state) => state?.search?.data);

  console.log("jajaja", hotTag);

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
    <nav className="bg-white border border-b-black">
      <div className="flex items-center font-medium w-full justify-around">
        <ul className="md:flex hidden uppercase items-center gap-8 font-sans text-xs w-[33%]">
          <li>
            <Link to="/" className="py-7 px-3 inline-block">
              Home
            </Link>
          </li>
          <NavLinks menu="" setMenu={() => {}} categoryList={categoryList} />
        </ul>

        <div className="z-50 p-5 md:w-[10%] w-full flex md:place-content-center justify-between">
          <img src={logo} alt="logo" className="md:cursor-pointer h-9" />
        </div>

        <div className="md:flex justify-around w-[33%] uppercase font-sans text-xs hidden">
          <div className="flex gap-1">
            <div>0</div>
            <FontAwesomeIcon icon={faHeart} className="fa-xl" />
          </div>
          <div onClick={handleProfileClick}>
            <FontAwesomeIcon icon={faUser} className="fa-xl" />
          </div>
          <div
            className="flex gap-1"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="fa-xl" />
          </div>
          <div className="relative">
            <FontAwesomeIcon
              icon={faCartShopping}
              className="fa-xl cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Search Dropdown */}
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
              {/* Gợi ý lịch sử tìm kiếm */}
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

              {/* Nhãn sản phẩm */}
              {tags.length > 0 && (
                <div>
                  <div className="pl-4 py-2 font-semibold text-gray-700">
                    Nhãn sản phẩm
                  </div>
                  <Row className="cursor-pointer px-4" gutter={16}>
                    {hotTag &&
                      [...hotTag] // Create a new copy of hotTag
                        .sort((a, b) => b.frequency - a.frequency) // Sort the copy
                        .slice(0, 4) // Take the first 4 items
                        .map((hot, index) => (
                          <Col key={`hot-${index}`} span={6}>
                            {" "}
                            {/* Span set to 6 for 4 tags per row */}
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
                        {/* Span set to 6 for 4 tags per row */}
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

              {/* Sản phẩm gợi ý */}
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
    </nav>
  );
};

export default Navbar;
