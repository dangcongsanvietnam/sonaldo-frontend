import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { links } from "./Mylinks";
import { useDispatch, useSelector } from "react-redux";
import { getAdminCategories } from "../../services/categoryService";

const NavLinks = ({ categoryList }) => {
  const [heading, setHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const dispatch = useDispatch();

  console.log("hehe", categoryList);

  const linkka = [
    {
      name: "Sản phẩm theo mục",
      submenu: true,
      link: "/public/category",
      sublinks: categoryList?.map((item) => ({
        head: item.name, // Lấy item.name từ categoryList làm head
        sublink: item?.categoryItems?.map((catItem) => ({
          name: catItem?.name, // Lấy item.categoryItems.name cho sublink
          link: `/public/category/${catItem?.categoryItemId}`, // Bạn có thể thay đường link thực tế nếu có
        })),
      })),
    },
  ];

  return (
    <>
      {linkka?.map((link, index) => (
        <div key={index}>
          <div className="px-3 text-left md:cursor-pointer group ">
            <Link
              to={link?.link} // Đường link sẽ dẫn tới trang "/products"
            >
              <h1
                className="py-7 hover:text-blue-500"
                onClick={() => {
                  heading !== link.name
                    ? setHeading(link.name)
                    : setHeading("");
                  setSubHeading("");
                }}
              >
                {link.name}
              </h1>
            </Link>

            {link.submenu && (
              <div>
                <div className="absolute w-[100%] left-0 top-18 hidden group-hover:md:block hover:md:block z-50">
                  <div className="bg-blue-600 p-10 flex justify-around">
                    {link?.sublinks?.map((mysublink, idx) => (
                      <div key={idx}>
                        <h1 className="text-lg font-semibold ">
                          {mysublink.head}
                        </h1>
                        {mysublink?.sublink?.map((slink, id) => (
                          <li key={id} className="text-sm text-gray-600 my-2.5">
                            <Link
                              className="hover:text-red-500"
                              to={slink.link}
                            >
                              {slink.name}
                            </Link>
                          </li>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* mmoobile menu */}

          <div className={`${heading === link.name ? "md:hidden" : "hidden"}`}>
            {/* sublink */}
            {link?.sublinks?.map((slinks, idd) => (
              <div key={idd}>
                <div>
                  <h1
                    className="py-4 pl-7 font-semibold md:pr-0 pr-5"
                    onClick={() => {
                      subHeading !== slinks.head
                        ? setSubHeading(slinks.head)
                        : setSubHeading("");
                    }}
                  >
                    {slinks.head}
                  </h1>

                  <div
                    className={`${
                      subHeading === slinks.head ? "md:hidden" : "hidden"
                    }`}
                  >
                    {slinks?.sublink?.map((slink, i) => (
                      <li key={i} className="py-3 pl-14">
                        <Link to={slink.link}>{slink.name}</Link>
                      </li>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default NavLinks;
