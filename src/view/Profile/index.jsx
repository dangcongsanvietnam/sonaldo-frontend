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
        toast.success("Cập nhật thông tin thành công!");
      })
      .catch(() => {
        toast.error("Cập nhật thông tin thất bại!");
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
      <div className="font-bold text-2xl mb-5">Profile</div>
      <div className="flex bg-white p-5 rounded-md mt-2">
        <div className="ml-10 mr-24 items-center">
          <div className="w-44 h-44 rounded-full overflow-hidden">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <span>Loading...</span>
              </div>
            ) : (
              <Image
                alt="Avatar"
                src={`data:image/jpeg;base64,${user?.avatar !== null
                    ? userAvatar
                      ? userAvatar
                      : user?.avatar?.file?.data
                    : "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"
                  }`}
                className="w-full h-full"
              />
            )}
          </div>
          <div className="mt-5">
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
              label="Họ tên"
              name="fullName"
              rules={[{ required: true, message: "Hãy nhập họ tên của bạn!" }]}
              required={false}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: "Hãy nhập số điện thoại của bạn!" },
              ]}
              required={false}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Ngày sinh"
              name="birthday"
              rules={[
                { required: true, message: "Hãy chọn ngày sinh của bạn!" },
              ]}
              required={false} // Remove the red asterisk
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={buttonLoading}>
                Cập nhật
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </>
  );
};

export default Profile;
