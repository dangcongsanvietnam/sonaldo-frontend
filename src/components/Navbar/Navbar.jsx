import React, { useCallback, useEffect, useState } from "react";
import logo from "./../../assets/download.png";
import { Link } from "react-router-dom";
import NavLinks from "./NavLinks";
import Button from "../Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CloseOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons";
import { Card, Col, Row } from "antd";
const { Meta } = Card;
import debounce from "lodash/debounce";
import {
  faMagnifyingGlass,
  faHeart,
  faCartShopping,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Input, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { searchProducts } from "../../services/productService";

const Navbar = ({ categoryList }) => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const dispatch = useDispatch();

  const tags = useSelector((state) => {
    return state?.product?.tags;
  });
  const suggestProducts = useSelector((state) => {
    return state?.product?.suggestProducts;
  });

  console.log("tag", tags);
  console.log("suggestProducts", suggestProducts);

  const debouncedSearch = useCallback(
    debounce((keyword) => {
      dispatch(searchProducts(keyword)); // Gọi Redux action để tìm kiếm
    }, 1000), // Thời gian debounce: 500ms
    []
  );

  // Hàm xử lý khi thay đổi input
  const inputHandleChange = (e) => {
    const keyword = e.target.value;
    console.log("kw", keyword);
    setSearchText(keyword);
    debouncedSearch(keyword); // Gọi hàm debounce
  };

  const enterHandle = (e) => {
    console.log(e.key);
  };

  return (
    <nav className="bg-white border border-b-black">
      <div
        className="flex items-center font-medium w-[100%] justify-around"
        style={{
          display: !searchOpen ? "" : "none",
        }}
      >
        <ul className="md:flex hidden uppercase items-center gap-8 font-sans text-xs w-[33%]">
          <li>
            <Link to="/" className="py-7 px-3 inline-block">
              Home
            </Link>
          </li>
          <NavLinks categoryList={categoryList} />
        </ul>

        <div className="z-50 p-5 md:w-[10%] w-full flex md:place-content-center justify-between">
          <img src={logo} alt="logo" className="md:cursor-pointer h-9"></img>
          <div
            className="text-3xl md:hidden"
            onClick={() => {
              setOpen(!open);
            }}
          >
            <ion-icon name={`${open ? "close" : "menu"}`}></ion-icon>
          </div>
        </div>

        <div className="md:flex justify-around w-[33%] uppercase font-sans text-xs hidden">
          <div className="flex gap-1">
            <div>0</div>
            <FontAwesomeIcon icon={faHeart} className="fa-xl" />
          </div>
          <Link to="/profile">
            <FontAwesomeIcon icon={faUser} className="fa-xl" />
          </Link>

          <div className="flex gap-1" href="">
            <div
              onClick={() => {
                setSearchOpen(!searchOpen);
              }}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="fa-xl" />
            </div>
          </div>
          <div className="flex gap-1" href="">
            <FontAwesomeIcon icon={faCartShopping} className="fa-xl" />
          </div>
        </div>

        {/* mobile */}
        <ul
          className={`md:hidden bg-white absolute w-full h-full bottom-0 py-24 pl-4 duration-500 ${
            open ? "left-0" : "left-[-100%]"
          } `}
        >
          <li>
            <Link to="/" className="py-7 px-3 inline-block">
              Home
            </Link>
          </li>
          <NavLinks />
          <div className="py-5 ">
            <Button></Button>
          </div>
        </ul>
      </div>
      <div
        style={{
          display: searchOpen ? "" : "none",
        }}
      >
        <div className={`flex justify-center space-x-2 py-[18px]`}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm sản phẩm ... "
            className="w-1/2 rounded-full h-10"
            onChange={inputHandleChange}
            // onKeyDown={enterHandle}
          />
          <CloseOutlined
            onClick={() => {
              setSearchOpen(!searchOpen);
            }}
          />
        </div>
        {searchText && tags.length > 0 && suggestProducts.length > 0 && (
          <div className=" absolute z-10 bg-white border border-gray-300 shadow-md  pt-2 w-2/3 left-0 right-0 mx-auto -translate-y-4 ">
            <Row className=" cursor-pointer" gutter={16}>
              {tags.map((result, index) => (
                <Col key={index} span={8}>
                  <Card
                    bordered={true}
                    onClick={() => alert(`You selected: ${result}`)}
                    className="ml-3 mr-3"
                  >
                    {result.tagName}
                  </Card>
                </Col>
              ))}
            </Row>
            {suggestProducts.map((result, index) => (
              <div key={index} className="p-2 hover:bg-gray-100 cursor-pointer">
                <Card
                  hoverable
                  style={{
                    width: 240,
                  }}
                  onClick={() => alert(`You selected: ${result}`)}
                  cover={
                    <img
                      alt="example"
                      src={`data:image/jpeg;base64,${result?.imageUrl.file.data}`}
                    />
                  }
                >
                  <div className="flex justify-between">
                    <Meta title={result.name} />
                    <div>Price:{result.price}</div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown kết quả */}
      {/* {searchText && tags.length > 0 && (
        <div className="absolute z-10 bg-white border border-gray-300 shadow-md rounded w-full max-h-60 overflow-y-auto">
          {tags.map((result, index) => (
            <div
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => alert(`You selected: ${result}`)}
            >
              {result.tagName}
            </div>
          ))}
        </div>
      )} */}
    </nav>
  );
};

export default Navbar;
