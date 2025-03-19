import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Drawer } from "antd";
import Logo from '../../assets/logo.svg'
import './Navbar.css'
import { RightOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const NavLinks = ({ categoryList, menu, setMenu, brandList, vnMode }) => {
  const [heading, setHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const [open, setOpen] = useState(false);
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
  const [menuLevel, setMenuLevel] = useState(0);
  const [activeSubmenu, setActiveSubmenu] = useState([]);
  const [activeChildLinks, setActiveChildLinks] = useState([]);
  const [link, setLink] = useState("");
  const navigate = useNavigate();

  const isShopByAgeCategory = (category) => category?.categoryName?.toLowerCase().includes("shop by age || mua sắm theo độ tuổi");

  const parseAge = (name) => {
    const match = name.match(/\d+/);
    return match ? parseInt(match[0], 10) : Infinity;
  };

  const sortedCategoryList = useMemo(() => {
    return categoryList
      ?.slice()
      .sort((a, b) => getLocalizedText(a?.categoryName).localeCompare(getLocalizedText(b?.categoryName)));
  }, [categoryList, vnMode]);

  const sortedBrandList = useMemo(() => {
    return brandList
      ?.slice()
      .sort((a, b) => getLocalizedText(a?.brandName).localeCompare(getLocalizedText(b?.brandName)));
  }, [brandList, vnMode]);

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
      name: vnMode ? "Khám phá" : "Discover",
      submenu: true,
      link: "/category",
      sublinks: sortedCategoryList?.map((item) => ({
        head: getLocalizedText(item?.categoryName),
        link: `/category/${item.categoryId}`,
        sublink: item?.categoryItems
          ?.slice()
          .sort((a, b) =>
            isShopByAgeCategory(item)
              ? parseAge(a?.name) - parseAge(b?.name)
              : getLocalizedText(a?.name).localeCompare(getLocalizedText(b?.name))
          )
          .map((catItem) => ({
            name: getLocalizedText(catItem?.name),
            link: `/category/${item.categoryId}/${catItem?.categoryItemId}`,
          })),
      })),
    },
    {
      name: vnMode ? "Thương hiệu" : "Brand",
      submenu: true,
      link: "/brand",
      sublinks: sortedBrandList?.map((item) => ({
        head: getLocalizedText(item?.brandName),
        link: `/brand/${item.brandId}`,
        sublink: item?.brandCategories
          ?.slice()
          .sort((a, b) => getLocalizedText(a?.name).localeCompare(getLocalizedText(b?.name)))
          .map((catItem) => ({
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

  const handleSubmenuClick = (submenu) => {
    setActiveSubmenu(submenu);
    setMenuLevel(1);
  };

  const handleChildClick2 = (childLinks) => {
    setActiveChildLinks(childLinks);
    setMenuLevel(2);
  };

  const handleBack = () => {
    if (menuLevel === 2) {
      setMenuLevel(1);
      setActiveChildLinks([]);
    } else if (menuLevel === 1) {
      setMenuLevel(0);
      setActiveSubmenu([]);
    }
  };

  const handleClose = () => {
    setMenu(false);
    setMenuLevel(0);
    setActiveSubmenu([]);
    setActiveChildLinks([]);
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
                className={`py-7`}
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
                      {vnMode ? "Trang chủ" : "Home"}
                    </Link>
                  </li>
                  <li>
                    <div
                      className={`px-3 inline-block hover:underline hover:underline-offset-4 hover:text-black cursor-pointer`}
                      onClick={() => {
                        handleClick(vnMode ? "Khám phá" : "Discover");
                        setAnimationKey2((prev) => prev + 1);
                      }}
                      style={activeLink === (vnMode ? "Khám phá" : "Discover") ? {
                        textDecoration: "underline",
                        textUnderlineOffset: '4px'
                      } : null}
                    >
                      {vnMode ? "Khám phá" : "Discover"}
                    </div>
                  </li>

                  <li>
                    <div
                      className={`px-3 inline-block hover:underline hover:underline-offset-4 hover:text-black cursor-pointer`}
                      style={activeLink === (vnMode ? "Thương hiệu" : "Brand") ? {
                        textDecoration: "underline",
                        textUnderlineOffset: '4px'
                      } : null}
                      onClick={() => {
                        handleClick(vnMode ? "Thương hiệu" : "Brand");
                        setAnimationKey2((prev) => prev + 1);
                      }}
                    >
                      {vnMode ? "Thương hiệu" : "Brand"}
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
                          key={item.head}
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
                            onClick={() => {
                              setOpen(false);
                              setActiveLink("");
                              setHeading("");
                              setSubData([]);
                              navigate(activeObject);
                            }}
                          >
                            {vnMode ? "Xem tất cả" : "View All"} {activeSubLink}
                          </span>
                        </div>
                        <div className="ml-5 mt-3 grid">
                          {childData?.map((child, i) => (
                            <span key={child.name} className="text-gray-600 py-3 hover:text-black hover:underline hover:underline-offset-4 cursor-pointer"
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
      <Drawer title="Menu" placement="left" onClose={handleClose} open={menu} zIndex={10000}>
        {menuLevel === 0 && (
          <ul className="uppercase font-sans text-sm font-semibold">
            <li>
              <Link to="/" className="py-3 px-3 block hover:underline hover:underline-offset-4 hover:text-black" onClick={handleClose}>
                {vnMode ? "Trang chủ" : "Home"}
              </Link>
            </li>
            {linkka.map((link, index) => (
              <li key={index}>
                <div className="py-3 px-3 block hover:underline hover:underline-offset-4 hover:text-black cursor-pointer" onClick={() => {
                  handleSubmenuClick(link.sublinks);
                  setHeading(link.name);
                }}>
                  {link.name}
                </div>
              </li>
            ))}
          </ul>
        )}

        {menuLevel === 1 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            <button className="text-gray-600 py-3 hover:text-black hover:underline hover:underline-offset-4" onClick={handleBack}>
              ← {heading}
            </button>
            <div className="flex flex-col">
              {activeSubmenu?.map((item) => (
                <div key={item.head} className="py-3 flex justify-between items-center cursor-pointer hover:underline hover:underline-offset-4" onClick={() => {
                  handleChildClick2(item.sublink);
                  setSubHeading(item.head);
                  setLink(item.link);
                }}>
                  <span>{item.head}</span>
                  <RightOutlined />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {menuLevel === 2 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            <button className="text-gray-600 py-3 hover:text-black hover:underline hover:underline-offset-4" onClick={handleBack}>
              ← {subHeading}
            </button>
            <div className="ml-5 mt-3 grid">
              <span className="text-gray-600 py-3 hover:text-black hover:underline hover:underline-offset-4 cursor-pointer"
                onClick={() => {
                  navigate(link);
                  setMenu(false);
                }}
              >
                {vnMode ? "Xem tất cả" : "View All"} {subHeading}
              </span>
              {activeChildLinks.map((child) => (
                <span key={child.name} className="text-gray-600 py-3 hover:text-black hover:underline hover:underline-offset-4 cursor-pointer" onClick={() => {
                  navigate(child.link);
                  setMenu(false);
                }}>
                  {child.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </Drawer>
    </>
  );
};

export default NavLinks;
