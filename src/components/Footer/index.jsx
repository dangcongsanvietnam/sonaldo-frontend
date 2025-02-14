import React, { useState } from "react";
import { Link } from "react-router-dom";

import "./index.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Button, Form, Input, notification } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { createFeedback } from "../../services/feedbackService";

const Footer = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useSelector((state) => state.user); // Lấy thông tin user từ Redux store

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      await dispatch(createFeedback(values)).unwrap();
      notification.success({ message: 'Gửi feedback thành công!' });
      form.resetFields();
    } catch (error) {
      notification.error({ message: 'Gửi feedback thất bại!' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
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

          <Form
            form={form}
            name="basic"
            layout='vertical'
            onFinish={onFinish}
            autoComplete="off"
            initialValues={data ? { // Sử dụng data từ Redux store
              name: data.firstName + " " + data.lastName,
              email: data.email,
            } : {}}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please input your name!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Please input your email!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Content"
              name="content"
              rules={[
                {
                  required: true,
                  message: 'Please input your content!',
                },
              ]}
            >
              <Input.TextArea showCount maxLength={1000} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Gửi
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Footer;
