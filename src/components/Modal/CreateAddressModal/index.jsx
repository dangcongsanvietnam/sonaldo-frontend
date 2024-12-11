import { Button, Form, Input } from "antd";
import React, { useState } from "react";
import DropDown from "../DropDown";
import { Checkbox } from "antd";
import TextArea from "antd/es/input/TextArea";
import "./index.css";
const CreateAddressModal = ({
  closeModal,
  openModal,
  isCreateModal,
  setAddress,
  form,
  editAddress,
}) => {
  const handleChange = (changedValues) => {
    setAddress((prev) => ({
      ...prev,
      ...changedValues,
    }));
  };

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
            <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
          </Form.Item>
          <div className="flex justify-end pt-14">
            <Button className="w-[20%]" onClick={closeModal}>
              Trở lại
            </Button>
            <Button className="w-[20%]" type="primary" onClick={openModal}>
              Hoàn thành
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};
export default CreateAddressModal;
