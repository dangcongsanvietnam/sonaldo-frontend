import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Menu,
  Select,
  Table,
  Tag,
  Modal,
  notification,
} from "antd";
import {
  DownOutlined,
  PlusCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
// import { getAdminProducts } from "../../../services/productService";
import Cookies from "js-cookie";
import {
  deleteProduct,
  getAdminProducts,
} from "../../../../services/productService";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;

const ProductList = () => {
  const navigate = useNavigate();

  const products = useSelector((state) => {
    return state?.product?.products?.data;
  });

  console.log(products);

  console.log(1123, products);
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    // selections: [
    //   Table.SELECTION_ALL,
    //   Table.SELECTION_INVERT,
    //   Table.SELECTION_NONE,
    //   {
    //     key: "odd",
    //     text: "Select Odd Row",
    //     onSelect: (changeableRowKeys) => {
    //       let newSelectedRowKeys = [];
    //       newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
    //         if (index % 2 !== 0) {
    //           return false;
    //         }
    //         return true;
    //       });
    //       setSelectedRowKeys(newSelectedRowKeys);
    //     },
    //   },
    //   {
    //     key: "even",
    //     text: "Select Even Row",
    //     onSelect: (changeableRowKeys) => {
    //       let newSelectedRowKeys = [];
    //       newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
    //         if (index % 2 !== 0) {
    //           return true;
    //         }
    //         return false;
    //       });
    //       setSelectedRowKeys(newSelectedRowKeys);
    //     },
    //   },
    // ],
  };

  const handleDeleteProduct = (productId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa sản phẩm này không?",
      onOk: () => {
        dispatch(deleteProduct(productId))
          .unwrap()
          .then(() => {
            notification.success({ message: "Xóa sản phẩm thành công" });

            // Cập nhật lại danh sách nhãn hàng sau khi xóa
            dispatch(getAdminProducts());
          })
          .catch((error) => {
            notification.error({ message: "Xóa sản phẩm thất bại" });
            console.error("Lỗi khi xóa:", error);
          });
      },
    });
  };

  const alphanumericSort = (a, b) => {
    return a.brandCategoryId.localeCompare(b.brandCategoryId, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "productId",
      sorter: alphanumericSort,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      showSorterTooltip: {
        target: "full-header",
      },
      // Sắp xếp theo bảng chữ cái
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      render: (categories) => {
        return (
          <>
            {/* Chỉ render khi categories có dữ liệu */}
            {console.log(55, categories)}
            {categories[0] == null ||
              categories.length === 0 ||
              categories.map((category, index) => (
                <Tag
                  key={index}
                  style={{
                    display: "inline-block", // Để Tag chỉ chiếm chiều rộng của nội dung
                    marginBottom: "4px", // Khoảng cách giữa các Tag
                  }}
                >
                  {category?.name}
                </Tag>
              ))}
          </>
        );
      },
    },
    {
      title: "Hãng",
      dataIndex: "brand", // Cần thay đổi nếu bạn có một cột riêng cho danh mục
      sorter: (a, b) => a.brand.localeCompare(b.brand),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Giá",
      dataIndex: "price",
      sorter: (a, b) => a.price - b.price,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Số lượng sản phẩm",
      dataIndex: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Trạng thái",
      dataIndex: "state",
      sorter: (a, b) => a.state.localeCompare(b.state),
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
          dropdownRender={(menu) => (
            <div>
              <div className="flex flex-col bg-white rounded-md shadow-lg">
                <Button
                  className="w-full border-none flex items-center justify-start "
                  icon={<EyeOutlined />}
                  onClick={() => {
                    navigate(`/admin/products/${record.productId}`);
                  }}
                >
                  Xem chi tiết
                </Button>
                <Button
                  className="w-full  border-none flex items-center justify-start"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteProduct(record?.productId)}
                >
                  Xoá
                </Button>
              </div>
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
    dispatch(getAdminProducts())
      .unwrap()
      .then((res) => {
        console.log(res);
      });
  }, [token]);

  const data = products?.map((product, index) => ({
    key: index,
    productId: product?.productId,
    name: product?.name,
    category: product?.categoryItems,
    brand: product?.brandCategory?.name,
    price: product?.price,
    quantity: product?.quantity,
    state: product?.state,
  }));

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Search
            placeholder="input search text"
            onSearch={() => {}}
            className="w-48"
          />
          <Select
            placeholder="Category"
            suffixIcon={<DownOutlined />}
            className="w-48"
            onChange={(value) => console.log(value)}
          >
            <Option value="option1">Option 1</Option>
            <Option value="option2">Option 2</Option>
            <Option value="option3">Option 3</Option>
          </Select>
          <Select
            placeholder="Brand"
            suffixIcon={<DownOutlined />}
            className="w-48"
            onChange={(value) => console.log(value)}
          >
            <Option value="option1">Option 1</Option>
            <Option value="option2">Option 2</Option>
            <Option value="option3">Option 3</Option>
          </Select>
        </div>
        <div>
          <Button type="primary" icon={<PlusCircleOutlined />}>
            Add Product
          </Button>
        </div>
      </div>

      <div className="pt-5">
        <Table
          columns={columns}
          dataSource={data}
          onChange={onChange}
          rowSelection={rowSelection}
          showSorterTooltip={{
            target: "sorter-icon",
          }}
        />
      </div>
    </>
  );
};

export default ProductList;
