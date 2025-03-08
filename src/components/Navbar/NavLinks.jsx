import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Drawer } from "antd";
import Logo from '../../assets/logo.svg'
import './Navbar.css'
import { RightOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const NavLinks = ({ categoryList, menu, setMenu, brandList }) => {
  const [heading, setHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const [open, setOpen] = useState(false);
  const vnMode = true;
  const getLocalizedText = (text) => {
    if (!text) return "";
    const parts = text.split(" || ");
    return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
  };
  const [subData, setSubData] = useState([]);
  const [childData, setChildData] = useState([])
  const [activeLink, setActiveLink] = useState("");
  const [activeSubLink, setActiveSubLink] = useState("");
  const [activeObject, setActiveObject] = useState("");
  const [animationKey, setAnimationKey] = useState(0);
  const [animationKey2, setAnimationKey2] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const selectedLink = linkka.find(link => link.name === heading);
    setSubData(selectedLink ? selectedLink.sublinks : []);
  }, [heading]);

  useEffect(() => {
    setActiveLink(heading);
  }, [heading]);

  useEffect(() => {
    const selectedLink = subData.find((link) => link.head === subHeading);
    setChildData(selectedLink ? selectedLink.sublink : []);
  }, [subHeading]);

  useEffect(() => {
    setActiveSubLink(subHeading);
  }, [subHeading]);

  const linkka = [
    {
      name: "Khám phá",
      submenu: true,
      link: "/category",
      sublinks: categoryList?.map((item) => ({
        head: getLocalizedText(item?.categoryName),
        link: `/category/${item.categoryId}`,
        sublink: item?.categoryItems?.map((catItem) => ({
          name: getLocalizedText(catItem?.name),
          link: `/category/${item.categoryId}/${catItem?.categoryItemId}`,
        })),
      })),
    },
    {
      name: "Thương hiệu",
      submenu: true,
      link: "/brand",
      sublinks: brandList?.map((item) => ({
        head: getLocalizedText(item?.brandName),
        link: `/brand/${item.brandId}`,
        sublink: item?.brandCategories?.map((catItem) => ({
          name: getLocalizedText(catItem?.name),
          link: `/brand/${item.brandId}/${catItem?.brandCategoryId}`,
        })),
      })),
    },
  ];

  const handleClick = (name) => {
    setActiveLink(name);
    setHeading(name);
    setSubData(linkka.find((link) => link.name === name)?.sublinks || []);
    setSubHeading("");
    setActiveSubLink("");
    setChildData([]);
    setIsAnimating(false);
  };

  const handleChildClick = (name, item) => {
    setActiveObject(item.link);
    setActiveSubLink(name);
    setSubHeading(name);
    setChildData(subData.find((link) => link.head === name)?.sublink || []);
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <>
      {linkka?.map((link, index) => (
        <div key={index}>
          <div className="px-3 text-left md:cursor-pointer group font-semibold hover:underline hover:underline-offset-4 hover:text-black">
            <div
              onClick={() => setOpen(true)}
            >
              <h1
                className={`py-7 ${menu === "product" ? "active" : ""
                  }`}
                onClick={() => {
                  setTimeout(() => {
                    setIsAnimating(true);
                    handleClick(link.name);
                    setAnimationKey2((prev) => prev + 1);
                  }, 300);
                }}
              >
                {link.name}
              </h1>
            </div>
          </div>
          <div className="hidden md:block w-1/4">
            <Drawer open={open} onClose={() => {
              setOpen(false);
              setActiveLink("");
              setHeading("");
              setSubData([]);
            }} placement="left" width="56%" zIndex={10000}>
              <div className="ml-14 flex justify-between">
                <ul className="md:flex hidden uppercase items-center gap-8 font-sans text-sm font-semibold">
                  <li>
                    <Link to="/" className="px-3 inline-block hover:underline hover:underline-offset-4 hover:text-black">
                      Home
                    </Link>
                  </li>
                  <li>
                    <div
                      className={`px-3 inline-block hover:underline hover:underline-offset-4 hover:text-black cursor-pointer`}
                      onClick={() => {
                        handleClick("Khám phá");
                        setAnimationKey2((prev) => prev + 1);
                      }}
                      style={activeLink === "Khám phá" ? {
                        textDecoration: "underline",
                        textUnderlineOffset: '4px'
                      } : null}
                    >
                      Khám phá
                    </div>
                  </li>

                  <li>
                    <div
                      className={`px-3 inline-block hover:underline hover:underline-offset-4 hover:text-black cursor-pointer`}
                      style={activeLink === "Thương hiệu" ? {
                        textDecoration: "underline",
                        textUnderlineOffset: '4px'
                      } : null}
                      onClick={() => {
                        handleClick("Thương hiệu");
                        setAnimationKey2((prev) => prev + 1);
                      }}
                    >
                      Thương hiệu
                    </div>
                  </li>
                </ul>
                <img src={Logo} alt="LEGO" className="h-14" />
              </div>
              <div className="ml-10 mt-5 flex">
                <div className={`w-[50%] overflow-y-auto`}>
                  {!isAnimating && (
                    <motion.div
                      key={animationKey2}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {subData?.map((item, id) => (

                        <div
                          key={id}
                          className="flex justify-between items-center py-3"
                          onClick={() => handleChildClick(item.head, item)}
                        >
                          <div className="flex items-center gap-2 cursor-pointer">
                            <span className="font-medium hover:underline hover:underline-offset-4"
                              style={activeSubLink === item.head ? {
                                textDecoration: "underline",
                                textUnderlineOffset: '4px'
                              } : null}
                            >
                              {item.head}
                            </span>
                            <RightOutlined />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
                <motion.div
                  key={animationKey}
                  className="ml-5 w-[50%]"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className={`h-full ${activeSubLink !== "" ? "border-l border-black overflow-y-auto" : ""}`}>

                    {childData?.length > 0 && (
                      <>
                        <div className="ml-5">
                          <span className="text-gray-600 py-3 hover:text-black hover:underline hover:underline-offset-4 cursor-pointer"
                          onClick={() => navigate(activeObject)}
                          >
                            Xem tất cả {activeSubLink}
                          </span>
                        </div>
                        <div className="ml-5 mt-3 grid">
                          {childData?.map((child, i) => (
                            <span key={i} className="text-gray-600 py-3 hover:text-black hover:underline hover:underline-offset-4 cursor-pointer"
                            onClick={() => navigate(child.link)}
                            >
                              {child.name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            </Drawer>
          </div>
        </div>
      ))}
    </>
  );
};

export default NavLinks;
