import { Button, Form, Input } from "antd";
import React, { useState } from "react";
import DropDown from "../DropDown";
import { Checkbox } from "antd";
import TextArea from "antd/es/input/TextArea";
import "./index.css";
import { useSelector } from "react-redux";
const CreateAddressModal = ({
  closeModal,
  openModal,
  isCreateModal,
  setAddress,
  form,
  editAddress,
  loading,
  vnMode
}) => {
  const handleChange = (changedValues) => {
    setAddress((prev) => ({
      ...prev,
      ...changedValues,
    }));
  };

  const userAddress = useSelector((state) => state?.address?.data);

  return (
    <>
      <div className="flex flex-col gap-5">
        <Form form={form} layout="vertical" onValuesChange={handleChange}>
          <div className="flex justify-between">
            <Form.Item
              name="fullName"
              className="w-48%"
              rules={[{ required: true, message: vnMode ? "Tên là bắt buộc" : "Name is required" }]}
            >
              <Input
                className=" h-[38px] rounded-none"
                placeholder={vnMode ? "Họ và tên" : "Full Name"}
              ></Input>
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              className="w-48%"
              rules={[{ required: true, message: vnMode ? "Số điện thoại là bắt buộc" : "Phone number is required" }]}
            >
              <Input
                className=" h-[38px] rounded-none"
                placeholder={vnMode ? "Số điện thoại" : "Phone Number"}
              ></Input>
            </Form.Item>
          </div>
          <div>
            <DropDown
              editAddress={editAddress}
              isCreateModal={isCreateModal}
              setAddress={setAddress}
              vnMode={vnMode}
            />
          </div>
          <Form.Item name="address" className="w-full">
            <TextArea
              showCount
              maxLength={100}
              placeholder={vnMode ? "Địa chỉ cụ thể" : "Detailed Address"}
              style={{
                height: 55,
                resize: "none",
              }}
              className="rounded-none"
            />
          </Form.Item>
          <Form.Item
            name="defaultAddress"
            valuePropName="checked"
            className="w-full"
          >
            <Checkbox
              disabled={userAddress?.length < 1}
            >
              {vnMode ? "Đặt làm địa chỉ mặc định" : "Set as default address"}
            </Checkbox>

          </Form.Item>
          <div className="flex justify-end pt-14 space-x-2">
            <Button className="w-[20%]" onClick={closeModal}>
              {vnMode ? "Trở lại" : "Back"}
            </Button>
            <Button loading={loading} className="w-[20%] bg-[#015AD2]" type="primary" onClick={openModal}>
              {vnMode ? "Hoàn thành" : "Submit"}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};
export default CreateAddressModal;
