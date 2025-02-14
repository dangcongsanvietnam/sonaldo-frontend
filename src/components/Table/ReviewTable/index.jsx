import React, { useState } from "react";
import { Modal, Table, Button, Input } from "antd";

const ReviewTable = ({ reviews }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const columns = [
    { title: "Review ID", dataIndex: "reviewId", key: "reviewId" },
    { title: "Content", dataIndex: "content", key: "content" },
    { title: "Voting", dataIndex: "voting", key: "voting" },
  ];

  const filteredReviews = reviews?.filter((review) =>
    review.content.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <Button onClick={() => setIsModalVisible(true)}>View Reviews</Button>
      <Modal
        title="Reviews"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Input
          placeholder="Search by content"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="mb-4"
        />
        <Table dataSource={filteredReviews} columns={columns} rowKey="reviewId" />
      </Modal>
    </>
  );
};

export default ReviewTable;