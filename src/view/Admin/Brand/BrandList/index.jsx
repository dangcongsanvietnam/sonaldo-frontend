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
import { deleteBrand, getAdminBrands } from "../../../../services/brandService";

const { Search } = Input;

const BrandList = () => {
  const brands = useSelector((state) => state.brand.brands.data);
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState(""); // State cho từ khóa tìm kiếm
  const navigate = useNavigate();

  // Hàm bỏ dấu tiếng Việt
  const removeAccents = (str) => {
    return str
      .normalize("NFD") // Chuyển chuỗi sang dạng Normalization Form D (Decomposition)
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các ký tự dấu (accent)
      .replace(/đ/g, "d") // Thay thế ký tự đặc biệt 'đ' thành 'd'
      .replace(/Đ/g, "D"); // Thay thế ký tự đặc biệt 'Đ' thành 'D'
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const alphanumericSort = (a, b) => {
    return a.brandId.localeCompare(b.brandId, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const handleDelete = (brandId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa nhãn hàng này không?",
      onOk: () => {
        dispatch(deleteBrand(brandId))
          .unwrap()
          .then(() => {
            notification.success({ message: "Xóa nhãn hàng thành công" });

            // Cập nhật lại danh sách nhãn hàng sau khi xóa
            dispatch(getAdminBrands());
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
      title: "Mã nhãn hàng",
      dataIndex: "brandId",
      sorter: alphanumericSort,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Nhãn hàng",
      dataIndex: "brand",
      sorter: (a, b) => a.brand.localeCompare(b.brand),
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
                  navigate(`/admin/brand/${record.brandId}`);
                }}
              >
                Xem chi tiết
              </Button>
              <Button
                className="w-full border-none flex items-center justify-start"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.brandId)} // Kích hoạt hàm xóa
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

  // Lọc dữ liệu dựa trên từ khóa tìm kiếm và loại bỏ dấu tiếng Việt
  const filteredData = brands
    ?.filter((brand) => {
      const keyword = removeAccents(searchKeyword.toLowerCase()); // Từ khóa đã bỏ dấu
      const brandId = removeAccents(brand?.brandId?.toLowerCase()); // Bỏ dấu mã nhãn hàng
      const brandName = removeAccents(brand?.name?.toLowerCase()); // Bỏ dấu tên nhãn hàng
      const brandDescription = removeAccents(brand?.description?.toLowerCase()); // Bỏ dấu mô tả

      return (
        brandId.includes(keyword) ||
        brandName.includes(keyword) ||
        brandDescription.includes(keyword)
      );
    })
    .map((brand, index) => ({
      key: index,
      brandId: brand?.brandId,
      brand: brand?.name,
      description: brand?.description,
    }));

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-lg font-bold mb-5">Danh sách nhãn hàng</h1>
        <Search
          placeholder="Nhập từ khóa tìm kiếm"
          onSearch={(value) => setSearchKeyword(value)} // Cập nhật từ khóa tìm kiếm
          // onChange={(e) => setSearchKeyword(e.target.value)} // Cập nhật từ khóa khi gõ chữ
          className="w-auto"
          enterButton
        />
      </div>
      <div className="pt-5">
        <Table
          columns={columns}
          dataSource={filteredData} // Dùng dữ liệu đã được lọc
          rowSelection={rowSelection}
          showSorterTooltip={{ target: "sorter-icon" }}
        />
      </div>
    </>
  );
};

export default BrandList;
