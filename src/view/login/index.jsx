import { Button, Dropdown, Input } from "antd";
import React, { useState } from "react";
import "./index.scss";
import { useDispatch } from "react-redux";
import { login } from "../../services/authService";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import GoogleLogin from "../../components/GoogleLogin";
import { ArrowLeftOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import Logo from '../../assets/logo.png'
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const { vnMode, languageItems } = useOutletContext();
  const [user, setUser] = useState({
    email: "",
    password: "",
    googleLoginFlag: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setVisible(!visible);
  };

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    dispatch(login(user))
      .unwrap()
      .then(() => {
        setLoading(false);
        navigate("/");
      })
      .catch(() => {
        setLoading(false);
        toast.error(vnMode ? "Thất bại" : "Failed");
      });
  };

  return (
    <>
      <div className="relative min-h-screen bg-gray-100 flex flex-col justify-center px-4 md:px-0">

        <Dropdown
          menu={{ items: languageItems }}
          placement="bottomRight"
          arrow
          className="absolute right-4 top-4 md:right-10 md:top-10"
        >
          <i className="text-xl md:text-2xl">
            <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
          </i>
        </Dropdown>

        <div className="absolute left-4 top-4 md:left-10 md:top-10 text-xl md:text-3xl cursor-pointer text-[#006CB7] hover:text-black" onClick={() => navigate("/")}>
          <ArrowLeftOutlined />
        </div>

        <div className="flex flex-col items-center">
          <div className="w-full pb-2 text-center">
            <img src={Logo} alt="LEGO" className="h-16 md:h-20 mx-auto" />
            <h3 className="text-lg md:text-xl font-bold mb-4">
              {vnMode ? "Đăng nhập hoặc tạo tài khoản Baybee® của bạn" : "Sign in or create your Baybee® account"}
            </h3>
            <span className="text-gray-600">
              {vnMode ? "Nếu bạn là người hâm mộ Baybee® mới" : "If you’re a new Baybee® fan"}
              <Link to="/register" className="text-blue-500"> {vnMode ? "Đăng ký" : "Register"} </Link>
            </span>
          </div>
        </div>

        <div className="border px-6 py-5 rounded shadow-md bg-white w-full max-w-md mx-auto">
          <form className="form space-y-3" onSubmit={handleSubmit}>
            <div className="form-group space-y-2">
              <label className="form-label">Email</label>
              <Input className="form-input h-12 text-lg px-4" name="email" onChange={handleChange} />
            </div>
            <div className="form-group space-y-2">
              <label className="form-label">{vnMode ? "Mật khẩu" : "Password"}</label>
              <Input type={visible ? "text" : "password"} className="form-input h-12 text-lg px-4" name="password" onChange={handleChange} suffix={
                <span onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
                  {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </span>
              } />
            </div>
            <div className="button-login text-center">
              <Button loading={loading} className="w-full py-4 md:w-80 md:py-6 !rounded-full text-lg font-bold mt-2" htmlType="submit" type="primary">
                {vnMode ? "Đăng nhập" : "Sign In"}
              </Button>
            </div>
            <div className="text-center">
              <Link to="/forget-password" className="text-sky-500 hover:text-sky-600">
                {vnMode ? "Quên mật khẩu?" : "Forgot Password?"}
              </Link>
            </div>
            <hr />
            <div className="text-center space-y-2">
              <div>{vnMode ? "Hoặc đăng nhập bằng" : "Or Sign In With"}</div>
              <GoogleLogin vnMode={vnMode} />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
