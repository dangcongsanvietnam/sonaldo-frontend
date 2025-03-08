import { Button, Input, notification } from "antd";
import React, { useState } from "react";
import "./index.scss";
import { useDispatch } from "react-redux";
import { login } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import GoogleLogin from "../../components/GoogleLogin";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Logo from '../../assets/logo.png'

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [user, setUser] = useState({
    email: "",
    password: "",
    googleLoginFlag: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log({ name, value });
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(user))
      .unwrap()
      .then((res) => {
        if (res.data.role === "ROLE_ADMIN") {
          navigate("/admin");
        }
        navigate("/");
        notification.success({
          message: "Thành công",
          description: "Đăng nhập thành công",
        });
      })
      .catch((err) => {
        notification.error({
          message: "Thất bại",
          description: "Đăng nhập thất bại",
        });
      });
  };

  return (
    <>
      <div className="relative h-screen bg-gray-100">
        <div className="absolute inset-0 bg-gray-200 clip-diagonal"></div>
        <div className="relative flex flex-col items-center justify-center h-full">
          <div className="absolute left-[250px] top-10 text-3xl cursor-pointer text-[#006CB7] hover:text-black" onClick={() => navigate("/")}><ArrowLeftOutlined /></div>
          <div className="justify-center z-50">
            <div className="w-full pb-2 text-center">
              <img src={Logo} alt="LEGO" className="h-20 mx-auto" />
              <h3 className="text-xl font-bold mb-4">Create your adult LEGO account</h3>

              <p className="text-gray-600">Already have an account? <Link to="/login" className="text-blue-500">Sign in</Link></p>
            </div>
          </div>
          <div className="w-[500px] border px-6 py-5 rounded shadow-md bg-white">
            <form className="form space-y-3" onSubmit={handleSubmit}>
              <div className="form-group space-y-2">
                <label htmlFor="" className="form-label">
                  Email
                </label>
                <Input
                  className="form-input h-12 text-lg px-4"
                  name="email"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group space-y-2">
                <label htmlFor="" className="form-label">
                  Mật khẩu
                </label>
                <Input
                  className="form-input h-12 text-lg px-4"
                  name="password"
                  onChange={handleChange}
                />
              </div>
              <div className="button-login text-center">
                <Button className="w-80 py-6 !rounded-full text-lg font-bold mt-2" htmlType="submit" type="primary">
                  Đăng nhập
                </Button>
              </div>
              <div className="text-center">
                <Link
                  to="/forget-password"
                  className="text-sky-500 hover:text-sky-600"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <hr />
              <div className="text-center space-y-2">
                <div>Or Sign In With</div>
                <GoogleLogin />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
