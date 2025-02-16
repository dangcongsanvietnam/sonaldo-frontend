import React from "react";
import {
    Dropdown,
    Table,
} from "antd";
import {
    MoreOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ProductTable = ({ selectedRowKeys, setSelectedRowKeys, searchKeyword, loading, products }) => {
    const navigate = useNavigate();

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
        ],
    });

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

    const filteredData = products
        ?.filter((product) => {
            const matchesCategoryId = product?.productId
                ?.toString()
                .toLowerCase()
                .includes(searchKeyword.toLowerCase());
            const matchesCategoryName = product?.name
                ?.toLowerCase()
                .includes(searchKeyword.toLowerCase());
            const matchesProductStock = product?.stockStatus
                ?.toLowerCase()
                .includes(searchKeyword.toLowerCase());
            // const matchesProductPrice = product?.price
            //     ?.toLowerCase()
            //     .includes(searchKeyword.toLowerCase());
            return matchesCategoryId || matchesCategoryName || matchesProductStock;
        })
        ?.map((product, index) => ({
            key: index,
            productId: product?.productId,
            name: product?.name,
            imageUrl: product?.images[0]?.file?.data,
            price: product?.price,
            stockStatus: product?.stockStatus
        }));

    return (
        <>
            <div className="pt-5">
                <Table
                    rowKey="productId"
                    columns={columns}
                    dataSource={filteredData}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys) => setSelectedRowKeys(keys),
                    }}
                    showSorterTooltip={{ target: "sorter-icon" }}
                    loading={loading}
                />
            </div>
        </>
    );
};

export default ProductTable;
