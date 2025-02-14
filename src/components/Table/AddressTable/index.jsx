import React, { useState } from "react";
import { Modal, Table, Button, Input } from "antd";

const AddressTable = ({ addresses }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const columns = [
    { title: "Address ID", dataIndex: "addressId", key: "addressId" },
    { title: "Full Name", dataIndex: "fullName", key: "fullName" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Default", dataIndex: "defaultAddress", key: "defaultAddress", render: (value) => (value ? "Yes" : "No") },
  ];

  const filteredAddresses = addresses?.filter((address) =>
    address.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <Button onClick={() => setIsModalVisible(true)}>View Addresses</Button>
      <Modal
        title="Addresses"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Input
          placeholder="Search by full name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="mb-4"
        />
        <Table dataSource={filteredAddresses} columns={columns} rowKey="addressId" />
      </Modal>
    </>
  );
};

export default AddressTable;