import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  notification,
  Modal,
  Select,
  Table,
} from "antd";
import {
  PlusCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

import {
  deleteCategoryItem,
  getCategoryItem,
} from "../../services/categoryService";

const { Search } = Input;

const CategoryItemTable = ({ categoryId, categoryItemId }) => {
  const categoryItem = useSelector(
    (state) => state?.category?.categoryItems.data
  );
  console.log(11111, categoryItem);
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const navigate = useNavigate();

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

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

            // Cập nhật lại danh sách nhãn hàng sau khi xóa
            dispatch(getCategoryItem(categoryId));
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
      title: "Mô tả",
      dataIndex: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
      sortDirections: ["ascend", "descend"],
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

  const token = Cookies.get("token");

  useEffect(() => {
    dispatch(getCategoryItem(categoryId));
  }, [dispatch, token]);

  const data = categoryItem?.map((categoryItemItem, index) => ({
    key: index,
    categoryItemId: categoryItemItem?.categoryItemId,
    categoryItem: categoryItemItem?.name,
    description: categoryItemItem?.description,
  }));

  return (
    <>
      <div className="pt-5">
        <Table
          columns={columns}
          dataSource={data}
          rowSelection={rowSelection}
          showSorterTooltip={{ target: "sorter-icon" }}
        />
      </div>
    </>
  );
};

export default CategoryItemTable;
