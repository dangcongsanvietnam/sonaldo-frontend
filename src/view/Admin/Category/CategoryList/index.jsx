import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  notification,
  Modal,
  Select,
  Table,
  Tag,
  Spin,
} from "antd";
import { MoreOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  deleteCategory,
  getAdminCategories,
} from "../../../../services/categoryService";
const { Search } = Input;

const CategoryList = () => {
  const categories = useSelector((state) => {
    return state.category.categories.data;
  });
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const filteredData = categories
    ?.filter((category) => {
      const matchesCategoryId = category?.categoryId
        ?.toString()
        .toLowerCase()
        .includes(searchKeyword.toLowerCase());
      const matchesCategoryName = category?.categoryName
        ?.toLowerCase()
        .includes(searchKeyword.toLowerCase());
      const matchesSubCategory = category?.categoryItems?.some((item) => {
        return (
          item?.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          item?.categoryItemId
            ?.toString()
            .toLowerCase()
            .includes(searchKeyword.toLowerCase())
        );
      });
      return matchesCategoryId || matchesCategoryName || matchesSubCategory;
    })
    ?.map((category, index) => ({
      key: index,
      categoryId: category?.categoryId,
      category: category?.categoryName,
      imageFile: category?.imageFile?.file?.data,
      categoryItems: category?.categoryItems,
    }));

  const alphanumericSort = (a, b) => {
    return a.categoryId.localeCompare(b.categoryId, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const handleDelete = (categoryId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa danh mục này không?",
      onOk: () => {
        setLoading(true);
        dispatch(deleteCategory(categoryId))
          .unwrap()
          .then(() => {
            notification.success({ message: "Xóa danh mục thành công" });
            dispatch(getAdminCategories()); // Cập nhật lại danh sách sau khi xóa
          })
          .catch((error) => {
            notification.error({ message: "Xóa danh mục thất bại" });
            console.error("Lỗi khi xóa:", error);
          }).finally(() => setLoading(false));
      },
    });
  };

  const renderDropdownMenu = (record) => ({
    items: [
      {
        label: (
          <div onClick={() => navigate(`/admin/category/${record.categoryId}`)}>
            <EyeOutlined style={{ marginRight: 8 }} />
            Xem chi tiết
          </div>
        ),
        key: "view",
      },
      {
        label: (
          <div onClick={() => handleDelete(record.categoryId)}>
            <DeleteOutlined style={{ marginRight: 8, color: "red" }} />
            Xóa
          </div>
        ),
        key: "delete",
      },
    ],
  });

  const handleDeleteSelectedProducts = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn không?",
      onOk: async () => {
        try {
          setLoading(true);
          for (const categoryId of selectedRowKeys) {
            await dispatch(deleteCategory(categoryId)).unwrap();
          }
          notification.success({ message: "Xóa tất cả danh mục thành công" });
          setSelectedRowKeys([]);
          dispatch(getAdminCategories()).finally(() => setLoading(false))
        } catch (error) {
          notification.error({ message: "Xóa một số danh mục thất bại" });
          console.error("Lỗi khi xóa nhiều danh mục:", error);
        }
      },
    });
  };

  const columns = [
    {
      title: "Mã danh mục",
      dataIndex: "categoryId",
      sorter: alphanumericSort,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Tên danh mục",
      dataIndex: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
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
      title: "Danh mục con",
      dataIndex: "categoryItems",
      render: (items) =>
        items && items.length > 0 ? (
          items.map((item, index) => (
            <Tag onClick={() => {
              navigate(
                `/admin/category/${item.categoryId}/${item?.categoryItemId}`
              );
            }} className="cursor-pointer" color="blue" key={index}>
              {item.name}
            </Tag>
          ))
        ) : (
          <Tag color="red">Không có danh mục</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "operation",
      fixed: "right",
      render: (record) => (
        <Dropdown
          menu={renderDropdownMenu(record)}
          trigger={["click"]}
          overlayClassName="dropdown-custom"
        >
          <MoreOutlined style={{ cursor: "pointer", fontSize: 16 }} />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <Spin spinning={loading}>
        <div className="flex justify-between">
          <h1 className="text-lg font-bold mb-5">Danh mục sản phẩm</h1>
          <div className="grid-cols-2 grid gap-4 gap-x-3">
            <Button
              type="primary"
              icon={<DeleteOutlined />}
              danger
              onClick={handleDeleteSelectedProducts}
              disabled={selectedRowKeys.length === 0} // Chỉ bật khi có sản phẩm được chọn
            >
              Xóa danh mục đã chọn
            </Button>
            <Search
              placeholder="Nhập ID, tên danh mục, hoặc danh mục con"
              onSearch={(value) => setSearchKeyword(value)}
              className="w-auto"
              enterButton
            />
          </div>
        </div>
        <div className="pt-5">
          <Table
            rowKey="categoryId"
            columns={columns}
            dataSource={filteredData}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
            pagination={{ pageSize: 10 }}
            showSorterTooltip={{ target: "sorter-icon" }}
          />
        </div>
      </Spin>
    </>
  );
};

export default CategoryList;
