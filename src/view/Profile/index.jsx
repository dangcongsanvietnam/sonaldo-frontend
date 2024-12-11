import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo, updateUserInfo } from "../../services/userService";
import Cookies from "js-cookie";
import { Button, Form, Input, DatePicker, notification, Upload } from "antd";
import dayjs from "dayjs";
import BASE_URL from "../../api";
import ImgCrop from "antd-img-crop";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AvatarProfile from "./AvatarProfile";

dayjs.extend(utc);
dayjs.extend(timezone);

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);

  const handleFinish = async (values) => {
    console.log("Received values from form: ", values);
    const nameParts = values.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    console.log(2, values);

    const updateValue = {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: values.phoneNumber,
      birthday: values.birthday
        ? dayjs(values.birthday).startOf("day").toISOString()
        : null,
      avatar: avatar,
    };
    // Xử lý logic cập nhật thông tin người dùng tại đây
    // BASE_URL.put("api/v1/users");

    dispatch(updateUserInfo(updateValue))
      .unwrap()
      .then((res) => {
        console.log("res", res);
        const token = Cookies.get("token");
        dispatch(getUserInfo(token));
        notification.success({ message: "Cập nhật thông tin thành công!" });
      })
      .catch((err) =>
        notification.error({ message: "Cập nhật thông tin thất bại!" })
      );
  };

  const [form] = Form.useForm();
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      dispatch(getUserInfo(token))
        .unwrap()
        .then(() => {
          form.resetFields();
        });
    }
  }, [dispatch]);

  const [avatar, setAvatar] = useState(null);
  const isRegister = false;

  console.log(1111, user);
  return (
    <>
      <Form
        form={form}
        initialValues={{
          fullName: user
            ? `${user?.firstName ? user?.firstName : ""} ${
                user?.lastName ? user?.lastName : ""
              }`
            : "",
          phoneNumber: user?.phoneNumber,
          birthday: user?.birthday
            ? dayjs(user?.birthday).startOf("day")
            : null,
        }}
        onFinish={handleFinish}
        // onValuesChange={handleChange}
      >
        <Form.Item label="Email">
          <div>{user?.email} </div>
        </Form.Item>

        <Form.Item
          label="Họ tên"
          name="fullName"
          rules={[{ required: true, message: "Hãy nhập họ tên của bạn!" }]}
          required={false} // Remove the red asterisk
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[
            { required: true, message: "Hãy nhập số điện thoại của bạn!" },
          ]}
          required={false} // Remove the red asterisk
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Ngày sinh"
          name="birthday"
          rules={[{ required: true, message: "Hãy chọn ngày sinh của bạn!" }]}
          required={false} // Remove the red asterisk
        >
          <DatePicker format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item label="Avatar" name="avatar" valuePropName="fileList">
          <AvatarProfile
            isRegister={isRegister}
            user={user}
            setAvatar={setAvatar}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default Profile;
