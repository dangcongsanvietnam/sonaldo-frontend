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
  loading
}) => {
  const handleChange = (changedValues) => {
    setAddress((prev) => ({
      ...prev,
      ...changedValues,
    }));
  };

  const userAddress = useSelector((state) => state?.address?.data);

  console.log(123, editAddress)


  return (
    <>
      <div className="flex flex-col gap-5">
        <Form form={form} layout="vertical" onValuesChange={handleChange}>
          <div className="flex justify-between">
            <Form.Item
              name="fullName"
              className="w-48%"
              rules={[{ required: true, message: "Tên là bắt buộc" }]}
            >
              <Input
                className=" h-[38px] rounded-none"
                placeholder="Họ và tên"
              ></Input>
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              className="w-48%"
              rules={[{ required: true, message: "Số điện thoại là bắt buộc" }]}
            >
              <Input
                className=" h-[38px] rounded-none"
                placeholder="Số điện thoại"
              ></Input>
            </Form.Item>
          </div>
          <div>
            <DropDown
              editAddress={editAddress}
              isCreateModal={isCreateModal}
              setAddress={setAddress}
            />
          </div>
          <Form.Item name="address" className="w-full">
            <TextArea
              showCount
              maxLength={100}
              placeholder="Địa chỉ cụ thể"
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
              Đặt làm địa chỉ mặc định
            </Checkbox>

          </Form.Item>
          <div className="flex justify-end pt-14 space-x-2">
            <Button className="w-[20%]" onClick={closeModal}>
              Trở lại
            </Button>
            <Button loading={loading} className="w-[20%] bg-[#015AD2]" type="primary" onClick={openModal}>
              Hoàn thành
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};
export default CreateAddressModal;
