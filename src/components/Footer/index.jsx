import React from "react";
import { Link } from "react-router-dom";

import "./index.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Button, Input } from "antd";

const Footer = () => {
  return (
    <>
      <div className="footer text-white bg-[#007cbb] md:flex justify-between px-14 py-10 ">
        <div className="footer-content md:space-y-5 pb-5">
          <div className="header-footer ">Shop By</div>
          <div>
            <ul className="md:space-y-2 py-2">
              <li>
                <Link>Age group</Link>
              </li>
              <li>
                <Link>Category</Link>
              </li>
              <li>
                <Link>Brand</Link>
              </li>
              <li>
                <Link>Gift Guides</Link>
              </li>
              <li>
                <Link>Wishlist</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-content md:space-y-5 pb-5">
          <div className="header-footer">Shop By</div>
          <div>
            <ul className="md:space-y-2 py-2">
              <li>
                <Link>Age group</Link>
              </li>
              <li>
                <Link>Category</Link>
              </li>
              <li>
                <Link>Brand</Link>
              </li>
              <li>
                <Link>Gift Guides</Link>
              </li>
              <li>
                <Link>Wishlist</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-content md:space-y-5 pb-5">
          <div className="header-footer">Shop By</div>
          <div className="md:space-x-2 py-2 space-x-2">
            <a href="">
              <FontAwesomeIcon className="fa-2x" icon={faFacebook} />
            </a>
            <a href="">
              <FontAwesomeIcon className="fa-2x  " icon={faInstagram} />
            </a>
          </div>
        </div>
        <div className="footer-content md:space-y-5 space-y-2 pb-5">
          <div className="header-footer pb-2">Shop By</div>

          <div>
            <p>
              Sign up to get toy updates, play tips & exclusive offers to your
              inbox!
            </p>
          </div>

          <Input
            placeholder="Email"
            className="h-[40px]  w-full rounded-none"
          ></Input>

          <div>
            <Button className="bg-[#00A4E4] border-none text-[12px] h-[36px] font-medium uppercase rounded-none">
              Subcribe
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
