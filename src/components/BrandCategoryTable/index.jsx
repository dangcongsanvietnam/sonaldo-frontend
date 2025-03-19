import React, { useState } from "react";
import { Button, Dropdown, Modal, Spin, Table } from "antd";
import { MoreOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteBrandCategory, getBrandDetail } from "../../services/brandService";
import { toast } from "react-toastify";

const BrandCategoryTable = ({ brandId, selectedRowKeys, setSelectedRowKeys, searchKeyword, vnMode }) => {
  const brandCategory = useSelector((state) => state?.brand?.brand?.data?.brandCategories);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBrandCategoryId, setSelectedBrandCategoryId] = useState(null);

  const alphanumericSort = (a, b) => {
    return a.brandCategoryId.localeCompare(b.brandCategoryId, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const handleDelete = (brandCategoryId) => {
    setSelectedBrandCategoryId(brandCategoryId);
    setIsModalVisible(true);
  };

  const confirmDelete = () => {
    setLoading(true);
    dispatch(deleteBrandCategory({ brandId, brandCategoryId: selectedBrandCategoryId }))
      .unwrap()
      .then(() => {
        dispatch(getBrandDetail(brandId)).finally(() => {
          setLoading(false);
        });
        toast.success(vnMode ? "Xóa nhãn hàng con thành công" : "Deleted sub-brand successfully");
        setIsModalVisible(false);
      })
      .catch(() => {
        toast.error(vnMode ? "Xóa nhãn hàng thất bại" : "Failed to delete sub-brand");
        setLoading(false);
      })
  };

  const columns = [
    {
      title: vnMode ? "Mã thương hiệu con" : "Sub-brand Id",
      dataIndex: "brandCategoryId",
      sorter: alphanumericSort,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: vnMode ? "Tên thương hiệu con" : "Sub-Brand Name",
      dataIndex: "brandCategory",
      sorter: (a, b) => a.brandCategory.localeCompare(b.brandCategory),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: vnMode ? "Ảnh thương hiệu con" : "Image",
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
      title: vnMode ? "Hành động" : "Action",
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
                onClick={() => navigate(`/admin/brand/${brandId}/${record?.brandCategoryId}`)}
              >
                {vnMode ? "Xem chi tiết" : "View Details"}
              </Button>
              <Button
                className="w-full border-none flex items-center justify-start"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record?.brandCategoryId)}
              >
                {vnMode ? "Xóa" : "Delete"}
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

      <Modal
        title={vnMode ? "Xác nhận xóa" : "Confirm Deletion"}
        open={isModalVisible}
        onOk={confirmDelete}
        onCancel={() => setIsModalVisible(false)}
        okButtonProps={{ loading }}
      >
        <p>{vnMode ? "Bạn có chắc chắn muốn xóa nhãn hàng con này không?" : "Are you sure you want to delete this sub-brand?"}</p>
      </Modal>
    </>
  );
};

export default BrandCategoryTable;
