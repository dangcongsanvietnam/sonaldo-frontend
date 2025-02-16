import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Modal,
  Table,
  Tag,
} from "antd";
import Icon, { MoreOutlined, EyeOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  deleteCategory,
  getAdminCategories,
} from "../../../../services/categoryService";
import { toast } from "react-toastify";
import { useLoading } from "../../../../provider/LoadingProvider";
const { Search } = Input;

const CategoryList = () => {
  const { startLoading, stopLoading } = useLoading();
  const categories = useSelector((state) => {
    return state.category.categories.data;
  });
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { vnMode } = useOutletContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const condition = searchKeyword.length > 0;
  const suffix = condition ? <Icon component={CheckOutlined} type="smile" className="hidden" /> : <span />;

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

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const fetchData = async () => {
    startLoading();
    try {
      await Promise.all([
        dispatch(getAdminCategories())
          .unwrap()
          .then(async () => {
            toast.success(vnMode ? "Tải dữ liệu danh mục thành công." : "Successfully loaded category data.");
            await stopLoading();
          }).catch(() => {
            stopLoading();
          })
      ]);
    } catch (error) {
      toast.error(vnMode ? "Tải dữ liệu danh mục thất bại." : "Failed to load product data.");
    } finally {
      stopLoading();
    }
  };

  const alphanumericSort = (a, b) => {
    return a.categoryId.localeCompare(b.categoryId, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const showDeleteModal = (categoryId) => {
    setCategoryToDelete(categoryId);
    setModalType("single");
    setIsModalVisible(true);
  };

  const showDeleteSelectedModal = () => {
    setModalType("multiple");
    setIsModalVisible(true);
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
          <div onClick={() => showDeleteModal(record.categoryId)}>
            <DeleteOutlined style={{ marginRight: 8, color: "red" }} />
            Xóa
          </div>
        ),
        key: "delete",
      },
    ],
  });

  const handleDelete = async () => {
    setLoading(true);

    try {
      if (modalType === "single" && categoryToDelete) {
        await dispatch(deleteCategory(categoryToDelete)).unwrap();
        toast.success(vnMode ? "Xóa danh mục thành công" : "Deleted category successfully");
      } else if (modalType === "multiple" && selectedRowKeys.length > 0) {
        for (const categoryId of selectedRowKeys) {
          await dispatch(deleteCategory(categoryId)).unwrap();
        }
        toast.success(vnMode ? "Xóa tất cả danh mục thành công" : "Deleted all selected categories successfully");
        setSelectedRowKeys([]);
      }
      fetchData();
    } catch (error) {
      toast.error(
        vnMode
          ? "Xóa danh mục thất bại. Vui lòng thử lại!"
          : "Failed to delete category. Please try again!"
      );
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      setCategoryToDelete(null);
    }
  };

  const columns = [
    {
      title: vnMode ? "Mã Danh Mục" : "Category ID",
      dataIndex: "categoryId",
      sorter: alphanumericSort,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: vnMode ? "Tên Danh Mục" : "Category Name",
      dataIndex: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: vnMode ? "Ảnh Danh Mục" : "Category Image",
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
      title: vnMode ? "Danh Mục Con" : "Category Item",
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
          <Tag color="red">{vnMode ? "Không có danh mục con" : "Category Item List is empty"}</Tag>
        ),
    },
    {
      title: vnMode ? "Thao tác" : "Action",
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
      <div className="flex justify-between">
        <div className="grid-cols-2 grid gap-4 gap-x-3">
          <Button
            type="primary"
            icon={<DeleteOutlined />}
            danger
            onClick={showDeleteSelectedModal}
            disabled={selectedRowKeys.length === 0}
          >
            {vnMode ? "Xóa các danh mục đã chọn" : "Delete all selected categories"}
          </Button>
          <Search
            placeholder={vnMode ? "Nhập mã, tên danh mục, hoặc danh mục con" : "Enter id, category name, or category item"}
            onSearch={(value) => setSearchKeyword(value)}
            className="w-auto"
            allowClear
            enterButton
            suffix={suffix}
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
      <Modal
        title={
          modalType === "single"
            ? vnMode
              ? "Bạn có chắc chắn muốn xóa danh mục này không?"
              : "Are you sure you want to delete this category?"
            : vnMode
              ? "Bạn có chắc chắn muốn xóa các danh mục đã chọn không?"
              : "Are you sure you want to delete selected categories?"
        }
        open={isModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
        okText={vnMode ? "Xác nhận" : "Confirm"}
        cancelText={vnMode ? "Hủy bỏ" : "Cancel"}
      >
        <p>
          {vnMode
            ? "Hành động này không thể hoàn tác. Vui lòng xác nhận!"
            : "This action cannot be undone. Please confirm!"}
        </p>
      </Modal>
    </>
  );
};

export default CategoryList;
