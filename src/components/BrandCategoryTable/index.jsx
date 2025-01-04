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
  deleteBrandCategory
} from "../../services/brandService";

const { Search } = Input;

const BrandCategoryTable = ({ brandId, selectedRowKeys, setSelectedRowKeys, searchKeyword }) => {
  const brandCategory = useSelector((state) => {
    return state?.brand?.brand?.data?.brandCategories;
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const alphanumericSort = (a, b) => {
    return a.brandCategoryId.localeCompare(b.brandCategoryId, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const handleDelete = (brandCategoryId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa nhãn hàng này không?",
      onOk: () => {
        dispatch(deleteBrandCategory({ brandId, brandCategoryId }))
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
      title: "Mã thương hiệu",
      dataIndex: "brandCategoryId",
      sorter: alphanumericSort,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Thương hiêu thuộc thương hiệu sản phẩm",
      dataIndex: "brandCategory",
      sorter: (a, b) => a.brandCategory.localeCompare(b.brandCategory),
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
                    `/admin/brand/${brandId}/${record?.brandCategoryId}`
                  );
                }}
              >
                Xem chi tiết
              </Button>
              <Button
                className="w-full border-none flex items-center justify-start"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record?.brandCategoryId)} // Kích hoạt hàm xóa
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

  const filteredData = brandCategory
    ?.filter((brandCategory) => {
      const matchesBrandId = brandCategory?.brandCategoryId
        ?.toString()
        .toLowerCase()
        .includes(searchKeyword.toLowerCase());
      const matchesBrandName = brandCategory?.name
        ?.toLowerCase()
        .includes(searchKeyword.toLowerCase());
      return matchesBrandId || matchesBrandName;
    })
    ?.map((brandCategory, index) => ({
      key: index,
      brandCategoryId: brandCategory?.brandCategoryId,
      brandCategory: brandCategory?.name,
      imageFile: brandCategory?.imageFile.file.data,
    }));

  return (
    <>
      <div className="pt-5">
        <Table
          rowKey="brandCategoryId"
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

export default BrandCategoryTable;
