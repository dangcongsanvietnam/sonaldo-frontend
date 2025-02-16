import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Typography, Card, notification } from 'antd';
import 'antd/dist/reset.css';
import "./index.scss";
import { useNavigate } from 'react-router-dom';
import { emailValidator } from '../../../utils/validataData';
import { useDispatch } from 'react-redux';
import { login } from '../../../services/authService';
import Cookies from "js-cookie";

const { Title } = Typography;
const { Option } = Select;

const AdminLogin = () => {
  const [form] = Form.useForm();
  const [role, setRole] = useState('ROLE_ADMIN');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = Cookies.get("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      navigate("/admin")
    }
  }, [navigate]);

  const handleRoleChange = (value) => {
    setRole(value);
  };

  const onFinish = (values) => {
    setLoading(true);
    const user = {
      email: values.email,
      password: values.password,
      googleLoginFlag: false,
    }
    dispatch(login(user))
      .unwrap()
      .then((res) => {
        if (res.data.role !== role) {
          notification.error({
            message: "Thất bại",
            description: "Đăng nhập thất bại, Quyền đăng nhập không hợp lệ",
          });
        } else {
          notification.success({
            message: "Thành công",
            description: "Đăng nhập thành công",
          });
          if (res.data.role === "ROLE_ADMIN") {
            navigate("/admin")
          }
        }
      })
      .catch((err) => {
        notification.error({
          message: "Thất bại",
          description: "Đăng nhập thất bại",
        });
      }).finally(() => {
        setLoading(false);
      })
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="login-container">
      <div className="background-animation"></div>
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: 'center' }}>Đăng Nhập</Title>
        <Form
          form={form}
          name="login"
          layout="vertical"
          initialValues={{ role: 'ROLE_ADMIN' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Quyền Đăng Nhập"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn quyền đăng nhập!' }]}
          >
            <Select onChange={handleRoleChange}>
              <Option value="ROLE_ADMIN">Admin</Option>
              <Option value="ROLE_MANAGER">Quản lý</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Tài Khoản"
            name="email"
            rules={[
              {
                required: true,
                validator: emailValidator,
              },
            ]}
          >
            <Input placeholder="Nhập tài khoản" />
          </Form.Item>

          <Form.Item
            label="Mật Khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button loading={loading} type="primary" htmlType="submit" block>
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminLogin;

