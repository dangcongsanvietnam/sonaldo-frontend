import { Button, Input, Form, Checkbox } from "antd";
import React from "react";
import DropDown from "../DropDown";
import TextArea from "antd/es/input/TextArea";
import "./index.css";

const EditAddressModal = ({
  isDefault,
  closeModal,
  openEditModal,
  setEditAddress,
  editAddress,
  form,
  isCreateModal,
}) => {
  const handleChange = (changedValues) => {
    setEditAddress((prev) => ({
      ...prev,
      ...changedValues,
    }));
  };

  return (
    <div className="flex flex-col gap-5">
      <Form form={form} layout="vertical" onValuesChange={handleChange}>
        <div className="flex justify-between">
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: "Họ và tên là bắt buộc" }]}
            className="w-[48%]"
          >
            <Input placeholder="Họ và tên" className="h-[38px] rounded-none" />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            rules={[{ required: true, message: "Số điện thoại là bắt buộc" }]}
            className="w-[48%]"
          >
            <Input
              placeholder="Số điện thoại"
              className="h-[38px] rounded-none"
            />
          </Form.Item>
        </div>
        <DropDown
          isCreateModal={isCreateModal}
          editAddress={editAddress}
          setAddress={setEditAddress}
        />
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
          <Checkbox disabled={isDefault ? true : false}>
            Đặt làm địa chỉ mặc định
          </Checkbox>
        </Form.Item>
        <div className="flex justify-end pt-14">
          <Button className="w-[20%]" onClick={closeModal}>
            Trở lại
          </Button>
          <Button className="w-[20%]" type="primary" onClick={openEditModal}>
            Hoàn thành
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditAddressModal;
