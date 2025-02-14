import React, { useState } from "react";
import { Table, Input } from "antd";

const OrderTable = ({ orders }) => {
  const [searchText, setSearchText] = useState("");

  const columns = [
    { title: "Order ID", dataIndex: "orderId", key: "orderId" },
    { title: "Total Price", dataIndex: "totalPrice", key: "totalPrice" },
    { title: "Status", dataIndex: "orderStatus", key: "orderStatus" },
  ];

  const filteredOrders = orders?.filter((order) =>
    order.orderId.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="shadow-md rounded-md p-4">
      <Input
        placeholder="Search by Order ID"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="mb-4"
      />
      <Table dataSource={filteredOrders} columns={columns} rowKey="orderId" />
    </div>
  );
};

export default OrderTable;