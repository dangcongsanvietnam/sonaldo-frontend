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
  const [filteredData, setFilteredData] = useState([]); // Dữ liệu danh mục đã được lọc
  const [searchKeyword, setSearchKeyword] = useState(""); // Từ khóa tìm kiếm
  const navigate = useNavigate();

  // Hàm bỏ dấu tiếng Việt
  const removeAccents = (str) => {
    return str
      .normalize("NFD") // Chuyển chuỗi sang dạng Normalization Form D (Decomposition)
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các ký tự dấu (accent)
      .replace(/đ/g, "d") // Thay thế ký tự đặc biệt 'đ' thành 'd'
      .replace(/Đ/g, "D"); // Thay thế ký tự đặc biệt 'Đ' thành 'D'
  };

  useEffect(() => {
    // Lọc dữ liệu danh mục theo từ khóa tìm kiếm
    const filtered = categories?.filter((category) => {
      const keyword = removeAccents(searchKeyword.toLowerCase());
      const categoryId = removeAccents(category?.categoryId?.toLowerCase());
      const categoryName = removeAccents(category?.name?.toLowerCase());
      const categoryDescription = removeAccents(
        category?.description?.toLowerCase()
      );

      return (
        categoryId.includes(keyword) ||
        categoryName.includes(keyword) ||
        categoryDescription.includes(keyword)
      );
    });

    setFilteredData(filtered); // Cập nhật dữ liệu đã được lọc
  }, [searchKeyword, categories]);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

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
        dispatch(deleteCategory(categoryId))
          .unwrap()
          .then(() => {
            notification.success({ message: "Xóa danh mục thành công" });
            dispatch(getAdminCategories()); // Cập nhật lại danh sách sau khi xóa
          })
          .catch((error) => {
            notification.error({ message: "Xóa danh mục thất bại" });
            console.error("Lỗi khi xóa:", error);
          });
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
      title: "Danh mục",
      dataIndex: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
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
                  navigate(`/admin/category/${record.categoryId}`);
                }}
              >
                Xem chi tiết
              </Button>
              <Button
                className="w-full border-none flex items-center justify-start"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.categoryId)}
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

  const data = filteredData?.map((category, index) => ({
    key: index,
    categoryId: category?.categoryId,
    category: category?.name,
    description: category?.description,
  }));

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-lg font-bold mb-5">Danh mục sản phẩm</h1>
        <Search
          placeholder="Nhập từ khóa tìm kiếm"
          onSearch={(value) => setSearchKeyword(value)} // Cập nhật từ khóa tìm kiếm
          className="w-auto"
          enterButton
          // onChange={(e) => setSearchKeyword(e.target.value)} // Cập nhật từ khóa khi gõ chữ
        />
      </div>
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

export default CategoryList;
