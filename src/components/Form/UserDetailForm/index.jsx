// UserDetailForm.jsx
import React from "react";
import { Form, Input, Button, Select, Image, Menu } from "antd";

const UserDetailForm = ({ user, onUpdate }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    onUpdate(values);
  };
  console.log(user)

  return (
    <>
      <div>
        <Image
          width={100}
          height={100}
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        />
        <div className="text-2xl font-bold mt-2">{user.email}</div>
        {/* <Menu
          // onClick={onClick}
          width={100}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          items={items}
        /> */}
      </div>
    </>
  );
};

export default UserDetailForm;