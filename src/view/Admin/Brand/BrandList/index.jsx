import React, { useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  notification,
  Modal,
  Table,
  Tag,
  Spin,
} from "antd";
import { MoreOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteBrand, getAdminBrands } from "../../../../services/brandService";

const { Search } = Input;

const BrandList = () => {
  const brands = useSelector((state) => state?.brand?.brands?.data);
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const filteredData = brands
  ?.filter((brand) => {
    const matchesBrandId = brand?.brandId
      ?.toString()
      .toLowerCase()
      .includes(searchKeyword.toLowerCase());
    const matchesBrandName = brand?.brandName
      ?.toLowerCase()
      .includes(searchKeyword.toLowerCase());
    const matchesSubCategory = brand?.brandCategories?.some((item) => {
      return (
        item?.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item?.brandCategoryId
          ?.toString()
          .toLowerCase()
          .includes(searchKeyword.toLowerCase())
      );
    });
    return matchesBrandId || matchesBrandName || matchesSubCategory;
  })
  ?.map((brand, index) => ({
    key: index,
    brandId: brand?.brandId,
    brandName: brand?.brandName,
    imageFile: brand?.imageFile?.file?.data,
    brandCategories: brand?.brandCategories,
  }));

  const alphanumericSort = (a, b) => {
    return a.brandId.localeCompare(b.brandId, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const handleDelete = (brandId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa thương hiệu này không?",
      onOk: () => {
        setLoading(true);
        dispatch(deleteBrand(brandId))
          .unwrap()
          .then(() => {
            notification.success({ message: "Xóa thương hiệu thành công" });
            dispatch(getAdminBrands()); // Cập nhật lại danh sách sau khi xóa
          })
          .catch((error) => {
            notification.error({ message: "Xóa thương hiệu thất bại" });
            console.error("Lỗi khi xóa:", error);
          }).finally(() => setLoading(false));
      },
    });
  };

  const renderDropdownMenu = (record) => ({
    items: [
      {
        label: (
          <div onClick={() => navigate(`/admin/brand/${record.brandId}`)}>
            <EyeOutlined style={{ marginRight: 8 }} />
            Xem chi tiết
          </div>
        ),
        key: "view",
      },
      {
        label: (
          <div onClick={() => handleDelete(record.brandId)}>
            <DeleteOutlined style={{ marginRight: 8, color: "red" }} />
            Xóa
          </div>
        ),
        key: "delete",
      },
    ],
  });

  const handleDeleteSelectedBrands = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa các thương hiệu đã chọn không?",
      onOk: async () => {
        try {
          setLoading(true);
          for (const brandId of selectedRowKeys) {
            await dispatch(deleteBrand(brandId)).unwrap();
          }
          notification.success({ message: "Xóa tất cả thương hiệu thành công" });
          setSelectedRowKeys([]);
          dispatch(getAdminBrands()).finally(() => setLoading(false))
        } catch (error) {
          notification.error({ message: "Xóa một số thương hiệu thất bại" });
          console.error("Lỗi khi xóa nhiều thương hiệu:", error);
        }
      },
    });
  };

  const columns = [
    {
      title: "Mã thương hiệu",
      dataIndex: "brandId",
      sorter: alphanumericSort,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Tên thương hiệu",
      dataIndex: "brandName",
      sorter: (a, b) => a.brand.localeCompare(b.brand),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Ảnh thương hiệu",
      dataIndex: "imageFile",
      render: (imageFile) => (
        <img
          alt="Brand"
          src={`data:image/jpeg;base64,${imageFile}`}
          className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    {
      title: "Thương hiệu con",
      dataIndex: "brandCategories",
      render: (items) =>
        items && items.length > 0 ? (
          items.map((item, index) => (
            <Tag onClick={() => {
              navigate(
                `/admin/brand/${item.brandId}/${item?.brandCategoryId}`
              );
            }} className="cursor-pointer" color="blue" key={index}>
              {item.name}
            </Tag>
          ))
        ) : (
          <Tag color="red">Không có thương hiệu con</Tag>
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
          <h1 className="text-lg font-bold mb-5">Thương hiệu sản phẩm</h1>
          <div className="grid-cols-2 grid gap-4 gap-x-3">
            <Button
              type="primary"
              icon={<DeleteOutlined />}
              danger
              onClick={handleDeleteSelectedBrands}
              disabled={selectedRowKeys.length === 0} // Chỉ bật khi có sản phẩm được chọn
            >
              Xóa thương hiệu đã chọn
            </Button>
            <Search
              placeholder="Nhập ID, tên thương hiệu, hoặc thương hiệu con"
              onSearch={(value) => setSearchKeyword(value)}
              className="w-auto"
              enterButton
            />
          </div>
        </div>
        <div className="pt-5">
          <Table
            rowKey="brandId"
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

export default BrandList;
