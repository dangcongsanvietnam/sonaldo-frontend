import React, { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import {
  Button,
  Dropdown,
  Input,
  Table,
  Modal,
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
import { useNavigate, useOutletContext } from "react-router-dom";
import './index.css'
import { addProductsToCategory, getAdminCategories } from "../../../../services/categoryService";
import { addProductsToBrand, getAdminBrands } from "../../../../services/brandService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import '..//..//..//..//utils/roboto'
import { font_data } from "..//..//..//..//utils/roboto";
import { toast } from "react-toastify";
import { useLoading } from "../../../../provider/LoadingProvider";

const { Search } = Input;
const { SHOW_CHILD } = Cascader;

const ProductList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const firstRender = useRef(true);

  const [searchParams, setSearchParams] = useState({
    productName: "",
    status: "",
    state: "",
    brandCategoryId: "",
    categoryItemIds: [],
  });

  const { startLoading, stopLoading } = useLoading();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [updateOption, setUpdateOption] = useState("quantity");
  const [updateValue, setUpdateValue] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const products = useSelector((state) => state.product?.adminProducts);
  const brands = useSelector((state) => state.brand.brands.data);
  const categories = useSelector((state) => state.category.categories.data);
  const [loading, setLoading] = useState(false);
  const { vnMode } = useOutletContext();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalImportVisible, setIsModalImportVisible] = useState(false);
  const [buttonDeleteLoading, setButtonDeleteLoading] = useState(false);
  const [fileToImport, setFileToImport] = useState(null);

  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    handleSearch();
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      startLoading();
      try {
        await Promise.all([
          dispatch(getAdminBrands()),
          dispatch(getAdminCategories())
        ]);
      } catch (error) {
      } finally {
        stopLoading();
      }
    };
    getProductData();
    fetchData();
  }, [dispatch]);

  const getProductData = () => {
    startLoading();
    try {
      dispatch(getAdminProducts({ page: 0, limit: 10 }))
        .unwrap()
        .then(async () => {
          toast.success(vnMode ? "Tải dữ liệu sản phẩm thành công." : "Successfully loaded product data.");
          await stopLoading();
        }).catch(() => {
          stopLoading();
        })
    } catch (error) {
      toast.error(vnMode ? "Không thể tải dữ liệu sản phẩm. Vui lòng thử lại!" : "Failed to load product data. Please try again!");
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (params) => {
      setLoading(true);
      try {
        const response = await dispatch(searchAdminProducts({ ...params, page: 0, limit: 10 }));
        if (!response.payload || response.payload.length === 0) {
          toast.warning(
            vnMode
              ? "Không có sản phẩm nào khớp với tiêu chí tìm kiếm của bạn."
              : "No products match your search criteria."
          );
        } else {
          toast.success(
            vnMode
              ? `Tìm thấy ${response.payload.length} sản phẩm phù hợp.`
              : `Found ${response.payload.length} matching products.`
          );
        }
      } catch (error) {
        toast.error(
          vnMode
            ? "Đã xảy ra lỗi trong quá trình tìm kiếm. Vui lòng thử lại!"
            : "An error occurred during the search process. Please try again!"
        );
      } finally {
        setLoading(false);
      }
    }, 300),
    [dispatch]
  );

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

  const showDeleteModal = (productId) => {
    setSelectedProductId(productId);
    setIsModalDeleteVisible(true);
  };

  const showImportModal = (file) => {
    setFileToImport(file);
    setIsModalImportVisible(true);
  };

  const handleImport = async () => {
    if (!fileToImport) return;

    setLoading(true);
    const file = fileToImport;
    const fileExtension = file.name.split(".").pop().toLowerCase();

    try {
      if (fileExtension === "json") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);
            await processProducts(jsonData);
          } catch (error) {
            toast.error(
              vnMode
                ? "File JSON không hợp lệ hoặc xảy ra lỗi trong quá trình xử lý."
                : "Invalid JSON file or an error occurred during processing."
            );
          }
        };
        reader.readAsText(file);
      } else if (fileExtension === "xls" || fileExtension === "xlsx") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            await processProducts(jsonData);
          } catch (error) {
            toast.error(
              vnMode
                ? "File Excel không hợp lệ hoặc xảy ra lỗi trong quá trình xử lý."
                : "Invalid Excel file or an error occurred during processing."
            );
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast.error(
          vnMode
            ? "Chỉ hỗ trợ file JSON và Excel (.xls, .xlsx)."
            : "Only JSON and Excel files (.xls, .xlsx) are supported."
        );
      }
    } finally {
      setLoading(false);
      setIsModalImportVisible(false);
      setFileToImport(null);
    }
  };

  const processProducts = async (products) => {
    const stateMapping = {
      active: "InStock",
      inactive: "OutofStock",
    };

    for (const product of products) {
      const updateValues = {
        name: product.name || "",
        description: product.description || "",
        files: Array.isArray(product.files)
          ? product.files.map((file) => file?.originFileObj)
          : null,
        price: product.price || 0,
        brandCategoryId: product.brandCategoryId || null,
        categoryItems: Array.isArray(product.categoryItems)
          ? product.categoryItems
          : null,
        status:
          stateMapping[product.status] ||
          product.status ||
          (vnMode ? "Không xác định" : "Unknown"),
        tagsDescription: product.tagsDescription || "",
        quantity: product.quantity || 0,
      };

      await dispatch(addNewProduct(updateValues));
    }

    toast.success(
      vnMode
        ? "Nhập dữ liệu sản phẩm thành công."
        : "Successfully imported product data."
    );

    getProductData();
  };

  const handleDeleteSelectedProducts = async () => {
    setButtonDeleteLoading(true);
    try {
      for (const productId of selectedRowKeys) {
        await dispatch(deleteProduct(productId)).unwrap();
      }
      toast.success(
        vnMode
          ? "Xóa tất cả sản phẩm thành công"
          : "Successfully deleted all products"
      );
      setSelectedRowKeys([]);
      getProductData();
      setButtonDeleteLoading(false);

      setIsModalVisible(false);
    } catch (error) {
      console.log(error)
      toast.error(
        vnMode
          ? "Xóa một số sản phẩm thất bại."
          : "Failed to delete some products"
      );
      setButtonDeleteLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setSearchParams({
      productName: "",
      status: "",
      state: "",
      brandCategoryId: "",
      categoryItemIds: [],
    });
    getProductData();
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

  const handleDeleteProduct = async () => {
    if (!selectedProductId) return;

    try {
      await dispatch(deleteProduct(selectedProductId)).unwrap();
      toast.success(
        vnMode ? "Xóa sản phẩm thành công" : "Successfully deleted the product"
      );
      getProductData();
      setIsModalDeleteVisible(false);
      setSelectedProductId(null);
    } catch (error) {
      toast.error(
        vnMode ? "Xóa sản phẩm thất bại" : "Failed to delete the product"
      );
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.addFileToVFS("Roboto-Regular.ttf", font_data);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    const tableData = products.map((product) => [
      product.productId,
      product.name,
      product.price,
      product.stockStatus === "InStock" ? "Còn hàng" : "Hết hàng",
    ]);

    doc.autoTable({
      head: [["Mã sản phẩm", "Tên sản phẩm", "Giá", "Trạng thái"]],
      body: tableData,
      styles: {
        font: "Roboto",
      },
    });

    doc.save("products.pdf");
  };

  const renderDropdownMenu = (record) => ({
    items: [
      {
        label: (
          <div onClick={() => navigate(`/admin/products/${record.productId}`)}>
            <EyeOutlined style={{ marginRight: 8 }} />
            {vnMode ? "Xem chi tiết" : "Detail"}
          </div>
        ),
        key: "view",
      },
      {
        label: (
          <div onClick={() => showDeleteModal(record.productId)}>
            <DeleteOutlined style={{ marginRight: 8, color: "red" }} />
            {vnMode ? "Xóa" : "Delete"}
          </div>
        ),
        key: "delete",
      },
    ],
  });

  const handleUpdateSelectedProducts = () => {
    if (selectedRowKeys.length === 0) {
      toast.warning(
        vnMode
          ? "Vui lòng chọn ít nhất một sản phẩm để cập nhật!"
          : "Please select at least one product to update!"
      );
      return;
    }

    setIsUpdateModalVisible(true);
  };

  const handleConfirmUpdate = async () => {
    if (selectedRowKeys.length === 0) {
      toast.warning(
        vnMode
          ? "Vui lòng chọn ít nhất một sản phẩm để cập nhật!"
          : "Please select at least one product to update!"
      );
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
            toast.success(
              vnMode
                ? "Cập nhật sản phẩm thành công."
                : "Successfully updated products."
            );
          });
      } else if (updateOption === "brand") {
        const updateValues = {
          productIds: selectedRowKeys, // Array of product IDs
          brandCategoryId: updateValue, // Array containing the selected category ID
        };

        await dispatch(addProductsToBrand(updateValues))
          .unwrap()
          .then(() => {
            toast.success(
              vnMode
                ? "Cập nhật sản phẩm thành công."
                : "Successfully updated products."
            );
          });
      } else {
        const updates = {
          productIds: selectedRowKeys.join(","), // Concatenate product IDs into a comma-separated string
          object: updateOption,
          value: updateValue,
        };

        await dispatch(updateProducts(updates))
          .unwrap()
          .then(() => {
            toast.success(
              vnMode
                ? "Cập nhật sản phẩm thành công."
                : "Successfully updated products."
            );
          });
      }

      setIsUpdateModalVisible(false);
      getProductData();
    } catch (error) {
      toast.error(
        vnMode
          ? "Đã xảy ra lỗi trong quá trình cập nhật sản phẩm."
          : "An error occurred while updating products."
      );
    }
  };

  const columns = [
    {
      title: vnMode ? "Mã sản phẩm" : "Product ID",
      dataIndex: "productId",
      sorter: (a, b) =>
        a.productId.localeCompare(b.productId, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
    },
    {
      title: vnMode ? "Sản phẩm" : "Product",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: vnMode ? "Ảnh sản phẩm" : "Image",
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
      title: vnMode ? "Giá" : "Price",
      dataIndex: "price",
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: vnMode ? "Trạng thái hàng" : "Stock",
      dataIndex: "stockStatus",
      sorter: (a, b) => a.stockStatus.localeCompare(b.stockStatus),
      render: (status) => (
        vnMode ?
          <span>{status === "InStock" ? "Còn hàng" : "Hết hàng"}</span> :
          <span>{status === "InStock" ? "In Stock" : "Out of Stock"}</span>
      ),
    },
    {
      title: vnMode ? "Trạng thái" : "State",
      dataIndex: "state",
      sorter: (a, b) => a.stockStatus.localeCompare(b.stockStatus),
      render: (status) => (
        vnMode ?
          <span>{status === "Lock" ? "Khoá" : (status === "Normal" ? "Bình thường" : (status === "Preorder" ? "Đặt trước" : "Sản phẩm mới"))}</span> :
          <span>{status === "Lock" ? "Lock" : (status === "Normal" ? "Normal" : (status === "Preorder" ? "Preorder" : "New Arrival"))}</span>
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
    }
  ];

  const data = products?.map((product, index) => ({
    key: index,
    productId: product.productId,
    name: product.name,
    price: product.price,
    stockStatus: product.stockStatus,
    imageUrl: product.imageUrl?.file?.data,
    state: product.state
  }));

  return (
    <div>
      <Spin spinning={loading}>
        <div className="search-actions-container flex flex-wrap items-center justify-between gap-4 mb-5 ">
          <div className="search-filters flex flex-wrap items-center gap-3">
            <Search
              placeholder={vnMode ? "Tìm kiếm theo tên và id" : "Search by name and id"}
              value={searchParams.productName}
              onChange={(e) => handleInputChange("productName", e.target.value)}
              onSearch={(value) => {
                handleInputChange("productName", value);
                handleSearch();
              }}
              className="w-48"
            />

            <Select
              placeholder={vnMode ? "Số lượng" : "Quantity"}
              value={searchParams.status || undefined}
              defaultValue={undefined}
              onChange={(value) => handleInputChange("status", value)}
              className="w-48"
              allowClear
            >
              {vnMode ? <>
                <Select.Option value="InStock">Còn hàng</Select.Option>
                <Select.Option value="OutofStock">Hết hàng</Select.Option>
              </> : <>
                <Select.Option value="InStock">In Stock</Select.Option>
                <Select.Option value="OutofStock">Out of Stock</Select.Option>
              </>
              }
            </Select>

            <Select
              placeholder={vnMode ? "Trạng thái" : "State"}
              value={searchParams.state || undefined}
              defaultValue={undefined}
              onChange={(value) => handleInputChange("state", value)}
              className="w-48"
              allowClear
            >
              {vnMode ? <>
                <Select.Option value="Lock">Khoá</Select.Option>
                <Select.Option value="Preorder">Đặt trước</Select.Option>
                <Select.Option value="NewArrival">Sản phẩm mới</Select.Option>
                <Select.Option value="Normal">Bình thường</Select.Option>
              </> : <>
                <Select.Option value="Lock">Lock</Select.Option>
                <Select.Option value="Preorder">Preorder</Select.Option>
                <Select.Option value="NewArrival">New Arrival</Select.Option>
                <Select.Option value="Normal">Normal</Select.Option>
              </>
              }
            </Select>

            <Cascader
              options={brandOptions}
              maxTagCount="responsive"
              showCheckedStrategy={SHOW_CHILD}
              showSearch={{ filter }}
              onChange={(value) => handleInputChange("brandCategoryId", value ? value[1] : "")}
              allowClear
              placeholder={vnMode ? "Thương hiệu" : "Brand"}
            />

            <Cascader
              options={categoryOptions}
              multiple
              maxTagCount="responsive"
              showCheckedStrategy={SHOW_CHILD}
              showSearch={{ filter }}
              onChange={(value) => handleInputChange("categoryItemIds", value.map((subcategory) => subcategory[1]))}
              allowClear
              placeholder={vnMode ? "Danh mục" : "Category"}
            />
            <Button type="primary" danger onClick={handleClear}>
              {vnMode ? "Xoá" : "Clear"}
            </Button>
          </div>

          <div className="action-buttons flex gap-3">
            <Button
              type="primary"
              icon={<DeleteOutlined />}
              danger
              onClick={() => setIsModalVisible(true)}
              disabled={selectedRowKeys.length === 0}
            >
              {vnMode ? "Xoá các sản phẩm đã chọn" : "Delete all selected products"}
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleUpdateSelectedProducts}
              disabled={selectedRowKeys.length === 0}
            >
              {vnMode ? "Cập nhật các sản phẩm đã chọn" : "Update all selected products"}
            </Button>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={() => navigate("/admin/add-product")}
            >
              {vnMode ? "Thêm sản phẩm" : "Add product"}
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportPDF}
            >
              {vnMode ? "Xuất PDF" : "Export PDF"}
            </Button>
            <Upload
              accept=".xlsx, .xls, .json"
              showUploadList={false}
              beforeUpload={(file) => {
                showImportModal(file);
                return false;
              }}
            >
              <Button type="primary" icon={<UploadOutlined />}>{vnMode ? "Nhập dữ liệu" : "Import data"}</Button>
            </Upload>
          </div>
        </div>

        <Modal
          title="Cập nhật sản phẩm"
          open={isUpdateModalVisible}
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
              <Radio value="quantity">{vnMode ? "Số lượng" : "Quantity"}</Radio>
              <Radio value="price">{vnMode ? "Giá" : "Price"}</Radio>
              <Radio value="state">{vnMode ? "Trạng thái" : "State"}</Radio>
              <Radio value="category">{vnMode ? "Danh mục" : "Category"}</Radio>
              <Radio value="brand">{vnMode ? "Thương hiệu" : "Brand"}</Radio>
            </Radio.Group>

            {updateOption === "quantity" && (
              <InputNumber
                min={1}
                max={100000}
                className="w-full"
                value={updateValue}
                onChange={(value) => setUpdateValue(value)}
                placeholder={vnMode ? "Số lượng sản phẩm" : "Quantity"}
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
                placeholder={vnMode ? "Giá" : "Price"}
              />
            )}

            {updateOption === "state" && (
              <Select
                options={vnMode ? [
                  { value: "Lock", label: "Khoá" },
                  { value: "Preorder", label: "Đặt trước" },
                  { value: "NewArrival", label: "Sản phẩm mới" },
                  { value: "Normal", label: "Bình thường" },
                ] :
                  [
                    { value: "Lock", label: "Lock" },
                    { value: "Preorder", label: "Preorder" },
                    { value: "NewArrival", label: "New Arrival" },
                    { value: "Normal", label: "Normal" },
                  ]}
                onChange={(value) => setUpdateValue(value)}
                placeholder={vnMode ? "Trạng thái" : "State"}
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
                placeholder={vnMode ? "Danh mục" : "Category"}
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
                placeholder={vnMode ? "Thương hiệu" : "Brand"}
                className="w-full"
                value={updateValue}
              />
            )}
          </div>
        </Modal>

        <Modal
          title={
            vnMode
              ? "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn không?"
              : "Are you sure you want to delete the selected products?"
          }
          open={isModalVisible}
          onOk={handleDeleteSelectedProducts}
          onCancel={() => setIsModalVisible(false)}
          okText={vnMode ? "Xác nhận" : "Confirm"}
          cancelText={vnMode ? "Hủy bỏ" : "Cancel"}
          okButtonProps={{ loading: buttonDeleteLoading }}
        >
          <p>
            {vnMode
              ? "Hành động này không thể hoàn tác. Vui lòng xác nhận!"
              : "This action cannot be undone. Please confirm!"}
          </p>
        </Modal>

        <Modal
          title={
            vnMode
              ? "Bạn có chắc chắn muốn xóa sản phẩm này không?"
              : "Are you sure you want to delete this product?"
          }
          open={isModalDeleteVisible}
          onOk={handleDeleteProduct}
          onCancel={() => setIsModalDeleteVisible(false)}
          okText={vnMode ? "Xác nhận" : "Confirm"}
          cancelText={vnMode ? "Hủy bỏ" : "Cancel"}
        >
          <p>
            {vnMode
              ? "Hành động này không thể hoàn tác. Vui lòng xác nhận!"
              : "This action cannot be undone. Please confirm!"}
          </p>
        </Modal>

        <Modal
          title={
            vnMode
              ? "Bạn có chắc chắn muốn nhập các tệp đã chọn không?"
              : "Are you sure you want to import the selected files?"
          }
          open={isModalImportVisible}
          onOk={handleImport}
          onCancel={() => {
            setIsModalImportVisible(false);
            setFileToImport(null);
          }}
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