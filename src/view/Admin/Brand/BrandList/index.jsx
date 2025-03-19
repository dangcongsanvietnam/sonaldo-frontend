import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Modal,
  Table,
  Tag,
  Spin,
} from "antd";
import Icon, { MoreOutlined, EyeOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
import { deleteBrand, getAdminBrands } from "../../../../services/brandService";
import { toast } from "react-toastify";
import { useLoading } from "../../../../provider/LoadingProvider";

const { Search } = Input;

const BrandList = () => {
  const { startLoading, stopLoading } = useLoading();
  const brands = useSelector((state) => state?.brand?.brands?.data);
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [isBulkDeleteModalVisible, setIsBulkDeleteModalVisible] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { vnMode } = useOutletContext();
  const condition = searchKeyword.length > 0;
  const suffix = condition ? <Icon component={CheckOutlined} type="smile" className="hidden" /> : <span />;
  const getLocalizedText = (text) => {
    if (!text) return "";
    const parts = text.split(" || ");
    return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
  };

  const fetchData = async () => {
    startLoading();
    try {
      await Promise.all([
        dispatch(getAdminBrands())
          .unwrap()
          .then(async () => {
            toast.success(vnMode ? "Tải dữ liệu thương hiệu thành công." : "Successfully loaded brand data.");
            await stopLoading();
          }).catch(() => {
            stopLoading();
          })
      ]);
    } catch (error) {
      toast.error(vnMode ? "Tải dữ liệu thương hiệu thất bại." : "Failed to load brand data.");
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

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
      brandCategories: brand?.brandCategories?.map((brandCategory) => ({
        ...brandCategory,
        brandId: brand.brandId,
        brandName: brand.brandName,
      })),
    }));

  const alphanumericSort = (a, b) => {
    return a.brandId.localeCompare(b.brandId, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const handleDelete = (brandId) => {
    setSelectedBrandId(brandId);
    setIsModalVisible(true);
  };

  const handleConfirmDelete = () => {
    setIsModalVisible(false);
    setLoading(true);
    dispatch(deleteBrand(selectedBrandId))
      .unwrap()
      .then(() => {
        toast.success(vnMode ? "Xóa thương hiệu thành công" : "Delete brand successfully");
        fetchData();
      })
      .catch(() => {
        toast.error(vnMode ? "Xóa thương hiệu thất bại" : "Failed to delete brand");
      })
      .finally(() => setLoading(false));
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
    setIsBulkDeleteModalVisible(true);
  };

  const handleConfirmBulkDelete = async () => {
    setIsBulkDeleteModalVisible(false);
    setLoading(true);
    try {
      for (const brandId of selectedRowKeys) {
        await dispatch(deleteBrand(brandId)).unwrap();
      }
      toast.success(
        vnMode ? "Xóa tất cả thương hiệu thành công!" : "Successfully deleted all brands!"
      );
      setSelectedRowKeys([]);
      fetchData();
      setLoading(false);
    } catch (error) {
      toast.error(
        vnMode ? "Xóa một số thương hiệu thất bại!" : "Failed to delete some brands!"
      );
    }
  };

  const handleCancelBulkDelete = () => {
    setIsBulkDeleteModalVisible(false);
  };

  const columns = [
    {
      title: vnMode ? "Mã Thương Hiệu" : "Brand Id",
      dataIndex: "brandId",
      sorter: alphanumericSort,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: vnMode ? "Tên Thương Hiệu" : "Brand Name",
      dataIndex: "brandName",
      sorter: (a, b) => a.brandName.localeCompare(b.brandName),
      sortDirections: ["ascend", "descend"],
      render: (brandName) => getLocalizedText(brandName),
    },
    {
      title: vnMode ? "Ảnh Thương Hiệu" : "Brand Image",
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
      title: vnMode ? "Danh Mục Thương Hiệu" : "Brand Category",
      dataIndex: "brandCategories",
      render: (items) =>
        items && items.length > 0 ? (
          items.map((item, index) => (
            <Tag
              onClick={() => navigate(`/admin/brand/${item.brandId}/${item?.brandCategoryId}`)}
              className="cursor-pointer"
              color="blue"
              key={index}
            >
              {getLocalizedText(item.name)}
            </Tag>
          ))
        ) : (
          <Tag color="red">{vnMode ? "Danh mục thương hiệu trống" : "Brand category is empty"}</Tag>
        ),
    },
    {
      title: vnMode ? "Thao Tác" : "Action",
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
          <div className="grid-cols-2 grid gap-4 gap-x-3">
            <Button
              type="primary"
              icon={<DeleteOutlined />}
              danger
              onClick={handleDeleteSelectedBrands}
              disabled={selectedRowKeys.length === 0} // Chỉ bật khi có sản phẩm được chọn
            >
              {vnMode ? "Xoá các thương hiệu đã chọn" : "Delete all selected brands"}
            </Button>
            <Search
              placeholder={vnMode ? "Nhập mã, tên thương hiệu, hoặc danh mục thương hiệu" : "Enter Id, brand name, or brand category"}
              onSearch={(value) => setSearchKeyword(value)}
              className="w-auto"
              enterButton
              allowClear
              suffix={suffix}
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
        <Modal
          title={vnMode ? "Bạn có chắc chắn muốn xóa thương hiệu này không?" : "Are you sure you want to delete the selected brand?"}
          open={isModalVisible}
          onOk={handleConfirmDelete}
          onCancel={handleCancel}
          okText={vnMode ? "Xóa" : "Delete"}
          cancelText={vnMode ? "Hủy" : "Cancel"}
          okType="danger"
        >
          <p>{vnMode
            ? "Hành động này sẽ xóa vĩnh viễn thương hiệu đã chọn."
            : "This action will permanently delete the selected brand."}</p>
        </Modal>
        <Modal
          title={
            vnMode
              ? "Bạn có chắc chắn muốn xóa các thương hiệu đã chọn không?"
              : "Are you sure you want to delete the selected brands?"
          }
          open={isBulkDeleteModalVisible}
          onOk={handleConfirmBulkDelete}
          onCancel={handleCancelBulkDelete}
          okText={vnMode ? "Xóa" : "Delete"}
          cancelText={vnMode ? "Hủy" : "Cancel"}
          okType="danger"
        >
          <p>
            {vnMode
              ? "Hành động này sẽ xóa vĩnh viễn các thương hiệu đã chọn."
              : "This action will permanently delete the selected brands."}
          </p>
        </Modal>;
      </Spin>
    </>
  );
};

export default BrandList;
