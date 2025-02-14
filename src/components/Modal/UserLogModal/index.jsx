import React, { useState } from "react";
import { Modal, Table, Button, Input } from "antd";

const UserLogModal = ({ logs }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const columns = [
    { title: "Event ID", dataIndex: "eventId", key: "eventId" },
    { title: "Type", dataIndex: "eventType", key: "eventType" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Timestamp", dataIndex: "timestamp", key: "timestamp" },
  ];

  const filteredLogs = logs?.filter((log) =>
    log.eventType.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <Button onClick={() => setIsModalVisible(true)}>View Logs</Button>
      <Modal
        title="User Logs"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Input
          placeholder="Search by type"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="mb-4"
        />
        <Table dataSource={filteredLogs} columns={columns} rowKey="eventId" />
      </Modal>
    </>
  );
};

export default UserLogModal;