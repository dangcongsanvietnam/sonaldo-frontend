import { Button, Form, Input, DatePicker, Select } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import defaultAvatar from "../../../../assets/download.png";
import { emailValidator, passwordValidator, phoneNumberValidator, validatePhoneNumber } from "../../../../utils/validataData";
import AvatarProfile from "../../../Profile/AvatarUser";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { createUser } from "../../../../services/userService";
import { Bounce, toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const AddManager = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { vnMode } = useOutletContext();
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        birthday: "2000-01-01T00:00:00.000Z",
        avatar: null,
        email: "string",
        password: "",
        googleLoginFlag: false,
        role: ""
    });

    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setVisible(!visible);
    };

    const [avatar, setAvatar] = useState(null);

    useEffect(() => {
        if (!avatar) {
            fetch(defaultAvatar)
                .then((res) => {
                    res.blob();
                })
                .then((blob) => {
                    const file = new File([blob], "default-avatar.png", {
                        type: "image/png",
                    });
                    setAvatar(file);
                });
        }
    }, [avatar]);

    const handleChange = (changedValues) => {
        const changedKey = Object.keys(changedValues)[0];
        if (changedKey === "phoneNumber"){
            const formattedPhoneNumber = validatePhoneNumber(changedValues[changedKey])
             setUser((prev) => ({
                ...prev,
                birthday: selectedDate,
                [changedKey]: `(+84)${formattedPhoneNumber ? formattedPhoneNumber[1] : changedValues[changedKey]}`
             }));
        } else {
          setUser((prev) => ({ ...prev, ...changedValues,
            birthday: selectedDate, }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const newData = {
                ...user,
                avatar: avatar
            }
            await dispatch(createUser(newData)).unwrap();

            toast.success(
                vnMode
                    ? "Người dùng được tạo thành công!"
                    : "User created successfully!"
            );

            navigate("/super-admin/users");
        } catch (error) {
            toast.error(
                vnMode
                    ? "Tạo người dùng thất bại. Vui lòng thử lại!"
                    : "Failed to create user. Please try again!"
            );
        } finally {
            setLoading(false);
        }
    };


    const [selectedDate, setSelectedDate] = useState(null);

    const handleDateChange = (date) => {
        if (date) {
            const dateString = dayjs(date).startOf("day").format("YYYY-MM-DD")
            setSelectedDate(dateString);
        } else {
            setSelectedDate(null);
        }
    };

    const isRegister = true;

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
            <Form
                form={form}
                onSubmit={handleSubmit}
                onValuesChange={handleChange}
            >
                <div className="grid grid-cols-2 gap-x-10">
                    <div>
                        <div className="flex flex-col gap-2 ">
                            <label className="font-semibold" htmlFor="">
                                {vnMode ? "Email" : "Email"}
                            </label>
                            <Form.Item
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        validator: emailValidator,
                                    },
                                ]}
                            >
                                <Input
                                    className="h-9"
                                    placeholder={vnMode ? "Nhập email" : "Enter email"}
                                />
                            </Form.Item>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold" htmlFor="password">
                                {vnMode ? "Mật khẩu" : "Password"}
                            </label>
                            <Form.Item
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        validator: passwordValidator,
                                    },
                                ]}
                            >
                                <Input
                                    type={visible ? "text" : "password"}
                                    className="h-9"
                                    placeholder={vnMode ? "Nhập mật khẩu" : "Enter password"}
                                    suffix={
                                        <span
                                            onClick={togglePasswordVisibility}
                                            style={{ cursor: "pointer" }}
                                        >
                                            {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                        </span>
                                    }
                                />
                            </Form.Item>
                        </div>
                        <div className="flex flex-col gap-2 ">
                            <label className="font-semibold" htmlFor="">
                                {vnMode ? "Họ" : "First Name"}
                            </label>
                            <Form.Item
                                name="firstName"
                                rules={[{ required: true, message: vnMode ? "Họ là bắt buộc" : "First name is required" }]}
                            >
                                <Input
                                    className="h-9"
                                    placeholder={vnMode ? "Nhập họ" : "Enter first name"}
                                />
                            </Form.Item>
                        </div>
                        <div className="flex flex-col gap-2 ">
                            <label className="font-semibold" htmlFor="">
                                {vnMode ? "Tên" : "Last Name"}
                            </label>
                            <Form.Item
                                name="lastName"
                                rules={[{ required: true, message: vnMode ? "Tên là bắt buộc" : "Last name is required" }]}
                            >
                                <Input
                                    className="h-9"
                                    placeholder={vnMode ? "Nhập tên" : "Enter last name"}
                                />
                            </Form.Item>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold" htmlFor="phoneNumber">
                                {vnMode ? "Số điện thoại" : "Phone Number"}
                            </label>
                            <Form.Item
                                name="phoneNumber"
                                rules={[{ required: true, validator: phoneNumberValidator }]}
                            >
                                <Input
                                    className="h-9"
                                    addonBefore="+84"
                                    placeholder={vnMode ? "Nhập số điện thoại" : "Enter phone number"}
                                />
                            </Form.Item>
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold" htmlFor="">
                                {vnMode ? "Ảnh đại diện" : "Avatar"}
                            </label>
                            <Form.Item name="avatar" valuePropName="fileList">
                                <AvatarProfile
                                    vnMode={vnMode}
                                    user={user}
                                    isRegister={isRegister}
                                    setAvatar={setAvatar}
                                />
                            </Form.Item>
                        </div>
                        <div className="flex flex-col gap-2 ">
                            <label className="font-semibold" htmlFor="">
                                {vnMode ? "Ngày sinh" : "Birthday"}
                            </label>
                            <Form.Item
                                name="birthday"
                                rules={[{ required: true, message: vnMode ? "Ngày sinh là bắt buộc" : "Birthday is required" }]}
                            >
                                <DatePicker
                                    onChange={handleDateChange}
                                    className="w-full"
                                    placeholder={vnMode ? "Chọn ngày sinh" : "Select birthday"}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </div>
                        <div className="flex flex-col gap-2 ">
                            <label className="font-semibold" htmlFor="">
                                {vnMode ? "Quyền" : "Role"}
                            </label>
                            <Form.Item
                                name="role"
                            >
                                <Select
                                    placeholder={vnMode ? "Quyền" : "Role"}
                                    options={[
                                        { value: "ROLE_MANAGER", label: vnMode ? "Quản lý" : "Manager" },
                                        { value: "ROLE_USER", label: vnMode ? "Người dùng" : "User" },
                                    ]}
                                />
                            </Form.Item>
                        </div>
                        <div className="flex flex-col gap-2 ">
                            <label className="font-semibold" htmlFor="">
                                {vnMode ? "Trạng thái" : "Status"}
                            </label>
                            <Form.Item
                                name="googleLoginFlag"
                            >
                                <Select
                                    placeholder={vnMode ? "Trạng thái" : "Status"}
                                    options={[
                                        { value: true, label: vnMode ? "Mở" : "Unlock" },
                                        { value: false, label: vnMode ? "Khoá" : "Lock" },
                                    ]}
                                />
                            </Form.Item>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={handleSubmit}
                    htmlType="submit"
                    type="primary"
                    className="mt-4 w-1/10 h-9"
                    loading={loading}
                >
                    {vnMode ? "Tạo" : "Create"}
                </Button>
            </Form>
        </>
    );
};

export default AddManager;
