import { Button, Input, notification } from "antd";
import React, { useState } from "react";
import "./index.scss";
import { useDispatch } from "react-redux";
import { login } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import GoogleLogin from "../../components/GoogleLogin";

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
      <div className="ra-login-container">
        <form className="form" onSubmit={handleSubmit}>
          <h3 className="heading">Đăng nhập tài khoản</h3>
          <div className="text-center">
            <span>Bạn chưa có tài khoản? </span>
            <Link to="/register" className="text-sky-500 hover:text-sky-600">
              Đăng ký
            </Link>
          </div>
          <div className="form-group">
            <label htmlFor="" className="form-label">
              Email
            </label>
            <Input
              className="form-input"
              name="email"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="" className="form-label">
              Mật khẩu
            </label>
            <Input
              className="form-input"
              name="password"
              onChange={handleChange}
            />
          </div>
          <div className="button-login">
            <Button htmlType="submit" type="primary">
              Đăng nhập
            </Button>
          </div>
          <GoogleLogin />
          <div className="text-center">
            <Link
              to="/forget-password"
              className="text-sky-500 hover:text-sky-600"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
