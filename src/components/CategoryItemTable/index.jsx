import React from "react";
import {
  Button,
  Dropdown,
  Input,
  notification,
  Modal,
  Table,
} from "antd";
import {
  MoreOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  deleteCategoryItem
} from "../../services/categoryService";

const { Search } = Input;

const CategoryItemTable = ({ categoryId, selectedRowKeys, setSelectedRowKeys, searchKeyword }) => {
  const categoryItem = useSelector((state) => {
    return state?.category?.category?.data?.categoryItems;
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const alphanumericSort = (a, b) => {
    return a.categoryItemId.localeCompare(b.categoryItemId, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const handleDelete = (categoryItemId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa nhãn hàng này không?",
      onOk: () => {
        dispatch(deleteCategoryItem({ categoryId, categoryItemId }))
          .unwrap()
          .then(() => {
            notification.success({ message: "Xóa nhãn hàng thành công" });
          })
          .catch((error) => {
            notification.error({ message: "Xóa nhãn hàng thất bại" });
            console.error("Lỗi khi xóa:", error);
          });
      },
    });
  };

  const columns = [
    {
      title: "Mã danh mục",
      dataIndex: "categoryItemId",
      sorter: alphanumericSort,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Danh mục thuộc danh mục sản phẩm",
      dataIndex: "categoryItem",
      sorter: (a, b) => a.categoryItem.localeCompare(b.categoryItem),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Ảnh danh mục",
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
      title: "Action",
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
                Xem chi tiết
              </Button>
              <Button
                className="w-full border-none flex items-center justify-start"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record?.categoryItemId)} // Kích hoạt hàm xóa
              >
                Xoá
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
    </>
  );
};

export default CategoryItemTable;
