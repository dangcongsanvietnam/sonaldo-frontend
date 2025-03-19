import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo, updateUserInfo } from "../../services/userService";
import Cookies from "js-cookie";
import { Button, Form, Input, DatePicker, Image } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AvatarProfile from "./AvatarProfile";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoading } from "../../provider/LoadingProvider";

dayjs.extend(utc);
dayjs.extend(timezone);

const Profile = () => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);
  const { vnMode } = useOutletContext();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState();

  const handleFinish = async (values) => {
    setButtonLoading(true);
    setUserAvatar(user?.avatar?.file?.data);
    const nameParts = values.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    const updateValue = {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: values.phoneNumber,
      birthday: values.birthday
        ? dayjs(values.birthday).startOf("day").format("YYYY-MM-DD")
        : null,
      avatar: null,
    };

    dispatch(updateUserInfo(updateValue))
      .unwrap()
      .then(() => {
        startLoading();
        const token = Cookies.get("token");
        dispatch(getUserInfo(token))
          .unwrap()
          .then(() => {
            form.resetFields();
            stopLoading();
            setButtonLoading(false);
            setUserAvatar(null);
          })
          .catch(() => {
            setButtonLoading(false);
            setUserAvatar(null);
            stopLoading();
          });
      })
      .catch(() => {
        toast.error(vnMode ? "Cập nhật thông tin thất bại!" : "Failed to update information!");
        setButtonLoading(false);
      });
  };

  const [form] = Form.useForm();
  useEffect(() => {
    startLoading();
    const token = Cookies.get("token");
    if (token) {
      dispatch(getUserInfo(token))
        .unwrap()
        .then(() => {
          form.resetFields();
          stopLoading();
        })
        .catch(() => {
          stopLoading();
        });
    }
  }, [dispatch]);

  return (
    <>
      <div className="font-bold text-2xl mb-5 text-center md:text-left">{vnMode ? "Thông tin cá nhân" : "Profile"}</div>
      <div className="bg-white p-5 rounded-md mt-2 flex flex-col md:flex-row items-center md:items-start">
        <div className="ml-10 mr-24 items-center">
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-10">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <span>{vnMode ? "Đang tải..." : "Loading..."}</span>
              </div>
            ) : (
              <Image
                alt="Avatar"
                src={`data:image/jpeg;base64,${user?.avatar !== null ? (userAvatar ? userAvatar : user?.avatar?.file?.data) : "iVBORw0KG..."
                  }`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="text-center md:text-left">
            <AvatarProfile user={user} vnMode={vnMode} />
          </div>
        </div>
        <Form
          form={form}
          initialValues={{
            fullName: user
              ? `${user?.firstName ? user?.firstName : ""} ${user?.lastName ? user?.lastName : ""
              }`
              : "",
            phoneNumber: user?.phoneNumber,
            birthday: user?.birthday
              ? dayjs(user?.birthday).startOf("day")
              : null,
          }}
          onFinish={handleFinish}
        >
          <div>
            <Form.Item label="Email">
              <div>{user?.email} </div>
            </Form.Item>

            <Form.Item
              label={vnMode ? "Họ tên" : "Fullname"}
              name="fullName"
              rules={[{ required: true, message: vnMode ? "Hãy nhập họ tên của bạn!" : "Please fill your fullname" }]}
              required={false}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label={vnMode ? "Số điện thoại" : "Phone number"}
              name="phoneNumber"
              rules={[
                { required: true, message: vnMode ? "Hãy nhập số điện thoại của bạn!" : "Please fill your phone number!" },
              ]}
              required={false}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label={vnMode ? "Ngày sinh" : "Birthday"}
              name="birthday"
              rules={[
                { required: true, message: vnMode ? "Hãy chọn ngày sinh của bạn!" : "Please choose your birthday!" },
              ]}
              required={false}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={buttonLoading}>
                {vnMode ? "Cập nhật" : "Update"}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </>
  );
};

export default Profile;
