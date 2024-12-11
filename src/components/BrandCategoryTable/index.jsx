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
// import { deleteBrand, getAdminBrands } from "../../../../services/brandService";
import { useNavigate } from "react-router-dom";
import {
  deleteBrandCategory,
  getBrandCategory,
  getBrandDetail,
} from "../../services/brandService";

const { Search } = Input;

const BrandCategoryTable = ({ brandId, brandCategoryId }) => {
  const brandCategory = useSelector(
    (state) => state?.brand?.brandCategories?.data
  );
  console.log("brandCategory", brandCategory);
  console.log("brandId", brandId);
  console.log("brandCategoryId", brandCategoryId);
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

            // Cập nhật lại danh sách nhãn hàng sau khi xóa
            dispatch(getBrandCategory(brandId));
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
      dataIndex: "brandCategoryId",
      sorter: alphanumericSort,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Danh mục thuộc nhãn hàng",
      dataIndex: "brandCategory",
      sorter: (a, b) => a.brandCategory.localeCompare(b.brandCategory),
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

  const token = Cookies.get("token");

  useEffect(() => {
    dispatch(getBrandCategory(brandId));
  }, [dispatch, token]);

  const data = brandCategory?.map((brandCategoryItem, index) => ({
    key: index,
    brandCategoryId: brandCategoryItem?.brandCategoryId,
    brandCategory: brandCategoryItem?.name,
    description: brandCategoryItem?.description,
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

export default BrandCategoryTable;
