import React, { useState } from "react";
import {
  Button,
  Dropdown,
  Modal,
  Table,
  Spin,
} from "antd";
import {
  MoreOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  deleteCategoryItem,
  getCategoryDetail
} from "../../services/categoryService";
import { toast } from "react-toastify";

const CategoryItemTable = ({ categoryId, selectedRowKeys, setSelectedRowKeys, searchKeyword, vnMode }) => {
  const categoryItem = useSelector((state) => {
    return state?.category?.category?.data?.categoryItems;
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategoryItemId, setSelectedCategoryItemId] = useState(null);
  const [loading, setLoading] = useState(false);

  const alphanumericSort = (a, b) => {
    return a.categoryItemId.localeCompare(b.categoryItemId, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const handleDelete = (brandCategoryId) => {
    setSelectedCategoryItemId(brandCategoryId);
    setIsModalVisible(true);
  };

  const confirmDelete = () => {
    setLoading(true);
    dispatch(deleteCategoryItem({ categoryId, categoryItemId: selectedCategoryItemId }))
      .unwrap()
      .then(() => {
        dispatch(getCategoryDetail(categoryId)).finally(() => {
          setLoading(false);
        });
        toast.success(vnMode ? "Xóa danh mục con thành công" : "Deleted sub-category successfully");
        setIsModalVisible(false);
      })
      .catch(() => {
        toast.error(vnMode ? "Xóa danh mục con thất bại" : "Failed to delete sub-category");
        setLoading(false);
      })
  };

  const columns = [
    {
      title: vnMode ? "Mã danh mục con" : "Sub-category Id",
      dataIndex: "categoryItemId",
      sorter: alphanumericSort,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: vnMode ? "Tên" : "Name",
      dataIndex: "categoryItem",
      sorter: (a, b) => a.categoryItem.localeCompare(b.categoryItem),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: vnMode ? "Ảnh" : "Image",
      dataIndex: "imageFile",
      render: (imageFile) => (
        <img
          alt="Category"
          src={`data:image/jpeg;base64,${imageFile}`}
          className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    {
      title: vnMode ? "Thao tác" : "Action",
      key: "operation",
      fixed: "right",
      width: 100,
      render: (record) => (
        <Dropdown
          trigger={["click"]}
          dropdownRender={() => (
            <div className="flex flex-col bg-white rounded-md shadow-lg">
              <Button
                className="w-full border-none flex items-center justify-start"
                icon={<EyeOutlined />}
                onClick={() => {
                  navigate(
                    `/admin/category/${categoryId}/${record?.categoryItemId}`
                  );
                }}
              >
                {vnMode ? "Xem chi tiết" : "Detail"}
              </Button>
              <Button
                className="w-full border-none flex items-center justify-start"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record?.categoryItemId)}
              >
                {vnMode ? "Xoá" : "Delete"}
              </Button>
            </div>
          )}
        >
          <MoreOutlined style={{ cursor: "pointer", float: "right" }} />
        </Dropdown>
      ),
    },
  ];

  const filteredData = categoryItem
    ?.filter((categoryItem) => {
      const matchesCategoryId = categoryItem?.categoryItemId
        ?.toString()
        .toLowerCase()
        .includes(searchKeyword.toLowerCase());
      const matchesCategoryName = categoryItem?.name
        ?.toLowerCase()
        .includes(searchKeyword.toLowerCase());
      return matchesCategoryId || matchesCategoryName;
    })
    ?.map((categoryItem, index) => ({
      key: index,
      categoryItemId: categoryItem?.categoryItemId,
      categoryItem: categoryItem?.name,
      imageFile: categoryItem?.imageFile.file.data,
    }));

  return (
    <>
      <div className="pt-5">
        <Table
          rowKey="categoryItemId"
          columns={columns}
          dataSource={filteredData}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          showSorterTooltip={{ target: "sorter-icon" }}
        />
      </div>
      <Modal
        title={vnMode ? "Xác nhận xóa" : "Confirm Deletion"}
        open={isModalVisible}
        onOk={confirmDelete}
        onCancel={() => setIsModalVisible(false)}
        okButtonProps={{ loading }}
      >
        <p>{vnMode ? "Bạn có chắc chắn muốn xóa không?" : "Are you sure you want to delete?"}</p>
      </Modal>
    </>
  );
};

export default CategoryItemTable;
