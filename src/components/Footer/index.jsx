import React, { useEffect } from "react";
import "./index.scss";
import { Input, Button } from "antd";
import { TwitterOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined, PinterestOutlined, } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import Logo from '../../assets/big-logo.png';
import { useNavigate } from "react-router-dom";
import { findDefault } from "../../services/informationService";

const Footer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { defaultData } = useSelector(state => state.information);

  useEffect(() => {
    dispatch(findDefault());
  }, [dispatch]);

  return (
    <>
      <footer className="bg-[#1F1D48] text-white py-10 px-5 md:px-20">
        <div className="max-w-7xl mx-auto pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* About */}
            <div>
              <h3 className="font-bold mb-3 text-2xl">About</h3>
              <ul className="space-y-2">
                <li>{defaultData?.address}</li>
                <li>{defaultData?.email}</li>
                <li>{defaultData?.phone}</li>
                <li>{defaultData?.slogan}</li>
              </ul>
            </div>

            {/* Activities */}
            <div>
              <h3 className="font-bold mb-3 text-2xl">Activities</h3>
              <ul className="space-y-2">
                <li><a onClick={() => navigate(`/blog/a375423d-7b84-40df-9c6c-560a8b6d04d3`)} className="hover:underline">Baybee's World</a></li>
                <li><a onClick={() => navigate(`/blog/a375423d-7b84-40df-9c6c-560a8b6d04d3`)} className="hover:underline">About Us</a></li>
                <li><a onClick={() => navigate(`/blog/a375423d-7b84-40df-9c6c-560a8b6d04d3`)} className="hover:underline">Coloring & Activities</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold mb-3 text-2xl">Support</h3>
              <ul className="space-y-2">
                <li><a onClick={() => navigate(`/blog/650ba8c3-9db5-474f-97fe-312b3116e08b`)} className="hover:underline">Help</a></li>
                <li><a onClick={() => navigate(`/blog/650ba8c3-9db5-474f-97fe-312b3116e08b`)} className="hover:underline">Shipping</a></li>
                <li><a onClick={() => navigate(`/blog/650ba8c3-9db5-474f-97fe-312b3116e08b`)} className="hover:underline">Returns</a></li>
                <li><a onClick={() => navigate(`/blog/650ba8c3-9db5-474f-97fe-312b3116e08b`)} className="hover:underline">Contact Us</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-bold mb-3 text-2xl">Sign Up for Fun!</h3>
              <p className="text-sm mb-3">Get exclusive updates on new toys, playtime ideas, and reviews!</p>
              <div className="flex flex-col space-y-3">
                <Input
                  placeholder="Enter your email"
                  className="w-full h-12 text-lg px-4 rounded-md"
                />
                <Button onClick={() => navigate("/register")} type="primary" className="bg-white text-blue-700 border border-white w-full h-12 text-lg rounded-md">
                  Sign Up
                </Button>
              </div>
              <p className="text-xs mt-2">
                By signing up, you agree to our <a href="#" className="underline">terms & conditions</a>.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-10 mb-5">
            <div onClick={() => navigate("/")} className="z-50 w-auto flex justify-center cursor-pointer">
              <img src={Logo} alt="LEGO" className="w-[300px] md:w-[500px] lg:w-[300px]" />
            </div>
            <div className="flex items-center justify-center space-x-4 text-xl">
              <a href="https://github.com/facebook/create-react-app/issues/11779" className="hover:text-gray-300"><TwitterOutlined /></a>
              <a href="https://github.com/facebook/create-react-app/issues/11779" className="hover:text-gray-300"><FacebookOutlined /></a>
              <a href="https://github.com/facebook/create-react-app/issues/11779" className="hover:text-gray-300"><PinterestOutlined /></a>
              <a href="https://github.com/facebook/create-react-app/issues/11779" className="hover:text-gray-300"><InstagramOutlined /></a>
              <a href="https://github.com/facebook/create-react-app/issues/11779" className="hover:text-gray-300"><YoutubeOutlined /></a>
            </div>
          </div>

          <hr />
          {/* Copyright */}
          <p className="text-center text-sm mt-5">© 2025 Baybee. All Rights Reserved.</p>
        </div>
      </footer>

    </>
  );
};

export default Footer;
