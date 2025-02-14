import React, { useState } from "react";
import { Modal, Table, Button, Input } from "antd";

const QuestionTable = ({ questions }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const columns = [
    { title: "Question ID", dataIndex: "questionId", key: "questionId" },
    { title: "Content", dataIndex: "content", key: "content" },
    { title: "State", dataIndex: "state", key: "state" },
  ];

  const filteredQuestions = questions?.filter((question) =>
    question.content.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <Button onClick={() => setIsModalVisible(true)}>View Questions</Button>
      <Modal
        title="Questions"
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
        <Table dataSource={filteredQuestions} columns={columns} rowKey="questionId" />
      </Modal>
    </>
  );
};

export default QuestionTable;