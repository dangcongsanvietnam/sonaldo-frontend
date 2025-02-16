import React, { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import {
  Button,
  Dropdown,
  Input,
  Table,
  Modal,
  notification,
  Select,
  Cascader,
  Radio,
  InputNumber,
  Upload,
  Spin,
} from "antd";
import {
  PlusCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { addNewProduct, deleteProduct, getAdminProducts, searchAdminProducts, updateProducts } from "../../../../services/productService";
import { useNavigate } from "react-router-dom";
import './index.css'
import { addProductsToCategory } from "../../../../services/categoryService";
import { addProductsToBrand } from "../../../../services/brandService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import '..//..//..//..//utils/roboto'
import { font_data } from "..//..//..//..//utils/roboto";

const { Search } = Input;
const { SHOW_CHILD } = Cascader;

const ProductList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useState({
    productName: "",
    status: "",
    brandCategoryId: "",
    categoryItemIds: [],
  });

  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [updateOption, setUpdateOption] = useState("quantity"); // Tùy chọn cập nhật
  const [updateValue, setUpdateValue] = useState(""); // Giá trị cập nhật
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const products = useSelector((state) => state.product?.adminProducts.data);
  const brands = useSelector((state) => state.brand.brands.data);
  const categories = useSelector((state) => state.category.categories.data);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSearch();
  }, [searchParams.categoryItemIds,
  searchParams.status,
  searchParams.brandCategoryId,]);

  useEffect(() => {
    dispatch(getAdminProducts({ page: 0, limit: 10 }));
  }, [dispatch]);

  const debouncedSearch = useMemo(() => {
    return debounce((params) => {
      dispatch(searchAdminProducts({ ...params, page: 0, limit: 10 }));
    }, 300);
  }, [dispatch]);

  const brandOptions = Array.isArray(brands)
    ? brands.map((brand) => ({
      label: brand?.brandName,
      value: brand?.brandId,
      children: Array.isArray(brand.brandCategories)
        ? brand.brandCategories.map((subBrand) => ({
          label: subBrand?.name,
          value: subBrand?.brandCategoryId,
        }))
        : [],
    }))
    : [];

  const categoryOptions = Array.isArray(categories)
    ? categories.map((category) => ({
      label: category?.categoryName,
      value: category?.categoryId,
      children: Array.isArray(category.categoryItems)
        ? category.categoryItems.map((subCategory) => ({
          label: subCategory?.name,
          value: subCategory?.categoryItemId,
        }))
        : [],
    }))
    : [];

  const handleDeleteSelectedProducts = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn không?",
      onOk: async () => {
        try {
          for (const productId of selectedRowKeys) {
            await dispatch(deleteProduct(productId)).unwrap();
          }
          notification.success({ message: "Xóa tất cả sản phẩm thành công" });
          setSelectedRowKeys([]); // Reset danh sách đã chọn
          dispatch(getAdminProducts({ page: 0, limit: 10 })); // Refresh danh sách sản phẩm
        } catch (error) {
          notification.error({ message: "Xóa một số sản phẩm thất bại" });
          console.error("Lỗi khi xóa nhiều sản phẩm:", error);
        }
      },
    });
  };


  const filter = (inputValue, path) =>
    path.some((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );


  const handleInputChange = (key, value) => {
    setSearchParams((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  };

  const handleSearch = () => {
    const formattedParams = {
      ...searchParams,
      categoryItemIds: searchParams.categoryItemIds.join(","),
    };
    debouncedSearch(formattedParams);
  };

  const handleDeleteProduct = (productId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa sản phẩm này không?",
      onOk: () => {
        dispatch(deleteProduct(productId))
          .unwrap()
          .then(() => {
            notification.success({ message: "Xóa sản phẩm thành công" });
            dispatch(getAdminProducts({ page: 0, limit: 10 }));
          })
          .catch((error) => {
            notification.error({ message: "Xóa sản phẩm thất bại" });
            console.error("Lỗi khi xóa:", error);
          });
      },
    });
  };

  const handleImport = async (file) => {
    setLoading(true);

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (fileExtension === "json") {
      // Xử lý file JSON
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);

          for (const product of jsonData) {
            const stateMapping = {
              active: "In Stock",
              inactive: "Out of stock",
              preorder: "Preorder",
            };

            const updateValues = {
              name: product.name || "",
              description: product.description || "",
              files: Array.isArray(product.files) ? product.files.map((file) => file?.originFileObj) : null,
              price: product.price || 0,
              brandCategoryId: product.brandCategoryId || null,
              categoryItems: Array.isArray(product.categoryItems) ? product.categoryItems : null,
              status: stateMapping[product.status] || product.status || "Unknown",
              tagsDescription: product.tagsDescription || "",
              quantity: product.quantity || 0,
            };

            await dispatch(addNewProduct(updateValues));
          }

          notification.success({
            message: "Thành công",
            description: "Nhập dữ liệu sản phẩm từ file JSON thành công.",
          });
          dispatch(getAdminProducts({ page: 0, limit: 10 }));
        } catch (error) {
          notification.error({
            message: "Lỗi nhập dữ liệu",
            description: "File JSON không hợp lệ hoặc xảy ra lỗi trong quá trình xử lý.",
          });
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } else if (fileExtension === "xls" || fileExtension === "xlsx") {
      // Xử lý file Excel
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          const parseJSON = (value) => {
            try {
              return JSON.parse(value);
            } catch (error) {
              console.warn("Invalid JSON:", value);
              return [];
            }
          };

          const parsedData = jsonData.map((product) => ({
            ...product,
            categoryItems: product.categoryItems ? parseJSON(product.categoryItems) : [],
          }));

          console.log(parsedData)

          for (const product of parsedData) {
            const stateMapping = {
              active: "In Stock",
              inactive: "Out of stock",
              preorder: "Preorder",
            };
            console.log("Original files value:", product.categoryItems);

            const updateValues = {
              name: product.name || "",
              description: product.description || "",
              files: Array.isArray(product.files) ? product.files.map((file) => file?.originFileObj) : null,
              price: product.price || 0,
              brandCategoryId: product.brandCategoryId || null,
              categoryItems: Array.isArray(product.categoryItems) ? product.categoryItems : null,
              status: stateMapping[product.status] || product.status || "Unknown",
              tagsDescription: product.tagsDescription || "",
              quantity: product.quantity || 0,
            };

            await dispatch(addNewProduct(updateValues));
          }

          notification.success({
            message: "Thành công",
            description: "Nhập dữ liệu sản phẩm từ file Excel thành công.",
          });
          dispatch(getAdminProducts({ page: 0, limit: 10 }));
        } catch (error) {
          notification.error({
            message: "Lỗi nhập dữ liệu",
            description: "File Excel không hợp lệ hoặc xảy ra lỗi trong quá trình xử lý.",
          });
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      notification.error({
        message: "Lỗi nhập dữ liệu",
        description: "Chỉ hỗ trợ file JSON và Excel (.xls, .xlsx).",
      });
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Thêm font Roboto vào jsPDF
    doc.addFileToVFS("Roboto-Regular.ttf", font_data); // RobotoRegular là biến được export từ file roboto.js
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    // Lấy dữ liệu cho bảng
    const tableData = products.map((product) => [
      product.productId,
      product.name,
      product.price,
      product.stockStatus === "In Stock" ? "Còn hàng" : "Hết hàng", // Xử lý trạng thái để hiển thị tiếng Việt
    ]);

    // Tạo bảng với font Roboto
    doc.autoTable({
      head: [["Mã sản phẩm", "Tên sản phẩm", "Giá", "Trạng thái"]],
      body: tableData,
      styles: {
        font: "Roboto", // Sử dụng font Roboto
      },
    });

    // Lưu file PDF
    doc.save("products.pdf");
  };

  const renderDropdownMenu = (record) => ({
    items: [
      {
        label: (
          <div onClick={() => navigate(`/admin/products/${record.productId}`)}>
            <EyeOutlined style={{ marginRight: 8 }} />
            Xem chi tiết
          </div>
        ),
        key: "view",
      },
      {
        label: (
          <div onClick={() => handleDeleteProduct(record.productId)}>
            <DeleteOutlined style={{ marginRight: 8, color: "red" }} />
            Xóa
          </div>
        ),
        key: "delete",
      },
    ],
  });

  const handleUpdateSelectedProducts = () => {
    if (selectedRowKeys.length === 0) {
      notification.warning({
        message: "Cảnh báo",
        description: "Vui lòng chọn ít nhất một sản phẩm để cập nhật!",
      });
      return;
    }
    setIsUpdateModalVisible(true);
  };

  const handleConfirmUpdate = async () => {
    if (selectedRowKeys.length === 0) {
      notification.warning({
        message: "Cảnh báo",
        description: "Vui lòng chọn ít nhất một sản phẩm để cập nhật!",
      });
      return;
    }

    try {
      if (updateOption === "category") {
        const updateValues = {
          productIds: selectedRowKeys, // Array of product IDs
          categoryItemIds: [updateValue], // Array containing the selected category ID
        };

        await dispatch(addProductsToCategory(updateValues))
          .unwrap()
          .then(() => {
            notification.success({
              message: "Thành công",
              description: "Cập nhật danh mục sản phẩm thành công",
            });
          });
      }
      else if (updateOption === "brand") {
        const updateValues = {
          productIds: selectedRowKeys, // Array of product IDs
          brandCategoryId: updateValue, // Array containing the selected category ID
        };

        // Dispatch action to update products and category items
        await dispatch(addProductsToBrand(updateValues))
          .unwrap()
          .then(() => {
            notification.success({
              message: "Thành công",
              description: "Cập nhật danh mục sản phẩm thành công",
            });
          });
      } else {
        // Handle other update options (quantity, price, status)
        const updates = {
          productIds: selectedRowKeys.join(","), // Concatenate product IDs into a comma-separated string
          object: updateOption,
          value: updateValue,
        };

        await dispatch(updateProducts(updates))
          .unwrap()
          .then(() => {
            notification.success({
              message: "Thành công",
              description: "Cập nhật sản phẩm thành công",
            });
          });
      }

      // Close modal and refresh products after successful update
      setIsUpdateModalVisible(false);
      dispatch(getAdminProducts({ page: 0, limit: 10 }));
    } catch (error) {
      notification.error({
        message: "Thất bại",
        description: "Cập nhật sản phẩm thất bại",
      });
    }
  };

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "productId",
      sorter: (a, b) =>
        a.productId.localeCompare(b.productId, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Ảnh sản phẩm",
      dataIndex: "imageUrl",
      render: (imageUrl) => (
        <img
          alt="Product"
          src={`data:image/jpeg;base64,${imageUrl}`}
          className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Trạng thái",
      dataIndex: "stockStatus",
      sorter: (a, b) => a.stockStatus.localeCompare(b.stockStatus),
      render: (status) => (
        <span>{status === "In Stock" ? "Còn hàng" : "Hết hàng"}</span>
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
    }
  ];

  const data = products?.map((product, index) => ({
    key: index,
    productId: product.productId,
    name: product.name,
    price: product.price,
    stockStatus: product.stockStatus,
    imageUrl: product.imageUrl?.file?.data,
  }));

  return (
    <div>
      <Spin spinning={loading}>
        <div className="search-actions-container flex flex-wrap items-center justify-between gap-4 mb-5 ">
          {/* Bộ lọc tìm kiếm */}
          <div className="search-filters flex flex-wrap items-center gap-3">
            <Search
              placeholder="Tìm kiếm sản phẩm"
              value={searchParams.productName}
              onChange={(e) => handleInputChange("productName", e.target.value)}
              onSearch={(value) => {
                handleInputChange("productName", value);
                handleSearch();
              }}
              className="w-48"
            />

            <Select
              placeholder="Trạng thái"
              value={searchParams.status || undefined}
              defaultValue={undefined}
              onChange={(value) => handleInputChange("status", value)}
              className="w-48"
              allowClear
            >
              <Option value="In Stock">Còn hàng</Option>
              <Option value="Out of Stock">Hết hàng</Option>
            </Select>

            <Cascader
              options={brandOptions}
              maxTagCount="responsive"
              showCheckedStrategy={SHOW_CHILD}
              showSearch={{ filter }}
              onChange={(value) => handleInputChange("brandCategoryId", value ? value[1] : "")}
              allowClear
              placeholder="Thương hiệu"
            />

            <Cascader
              options={categoryOptions}
              multiple
              maxTagCount="responsive"
              showCheckedStrategy={SHOW_CHILD}
              showSearch={{ filter }}
              onChange={(value) => handleInputChange("categoryItemIds", value.map((subcategory) => subcategory[1]))}
              allowClear
              placeholder="Danh mục"
            />
          </div>

          {/* Nút hành động */}
          <div className="action-buttons flex gap-3">
            <Button
              type="primary"
              icon={<DeleteOutlined />}
              danger
              onClick={handleDeleteSelectedProducts}
              disabled={selectedRowKeys.length === 0} // Chỉ bật khi có sản phẩm được chọn
            >
              Xóa sản phẩm đã chọn
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleUpdateSelectedProducts}
              disabled={selectedRowKeys.length === 0}
            >
              Cập nhật sản phẩm đã chọn
            </Button>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={() => navigate("/admin/add-product")}
            >
              Thêm sản phẩm
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportPDF}
            >
              Xuất PDF
            </Button>
            <Upload
              accept=".xlsx, .xls, .json"
              showUploadList={false}
              beforeUpload={(file) => {
                handleImport(file);
                return false;
              }}
            >
              <Button type="primary" icon={<UploadOutlined />}>Nhập dữ liệu</Button>
            </Upload>
          </div>
        </div>

        <Modal
          title="Cập nhật sản phẩm"
          visible={isUpdateModalVisible}
          onOk={async () => {
            setLoading(true);
            await handleConfirmUpdate();
            setLoading(false);
          }}
          onCancel={() => setIsUpdateModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
          confirmLoading={loading}>
          <div className="flex flex-col gap-4">
            <Radio.Group
              value={updateOption}
              onChange={(e) => setUpdateOption(e.target.value)}
            >
              <Radio value="quantity">Số lượng</Radio>
              <Radio value="price">Giá</Radio>
              <Radio value="state">Trạng thái</Radio>
              <Radio value="category">Danh mục</Radio>
              <Radio value="brand">Thương hiệu</Radio>
            </Radio.Group>

            {updateOption === "quantity" && (
              <InputNumber
                min={1}
                max={100000}
                className="w-full"
                value={updateValue}
                onChange={(value) => setUpdateValue(value)}
                placeholder="Số lượng sản phẩm"
              />
            )}

            {updateOption === "price" && (
              <InputNumber
                formatter={(value) =>
                  `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/₫\s?|\D/g, "")}
                className="w-full"
                value={updateValue}
                onChange={(value) => setUpdateValue(value)}
                placeholder="Giá sản phẩm"
              />
            )}

            {updateOption === "state" && (
              <Select
                options={[
                  { value: "Out of stock", label: "Out of Stock" },
                  { value: "In Stock", label: "In Stock" },
                  { value: "Preorder", label: "Preorder" },
                  { value: "New Arrivals", label: "New Arrivals" },
                ]}
                onChange={(value) => setUpdateValue(value)}
                placeholder="Chọn trạng thái"
                className="w-full"
              />
            )}

            {updateOption === "category" && (
              <Cascader
                options={categoryOptions}
                multiple
                maxTagCount="responsive"
                showCheckedStrategy={SHOW_CHILD}
                showSearch={{ filter }}
                onChange={(value) => setUpdateValue(value.map((subcategory) => subcategory[1]))}
                allowClear
                placeholder="Danh mục"
                className="w-full"
              />
            )}

            {updateOption === "brand" && (
              <Cascader
                options={brandOptions}
                maxTagCount="responsive"
                showCheckedStrategy={SHOW_CHILD}
                showSearch={{ filter }}
                onChange={(value) => setUpdateValue(value ? value[1] : "")}
                allowClear
                placeholder="Thương hiệu"
                className="w-full"
                value={updateValue}
              />
            )}
          </div>
        </Modal>

        <Table
          rowKey="productId"
          columns={columns}
          dataSource={data}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
};

export default ProductList;