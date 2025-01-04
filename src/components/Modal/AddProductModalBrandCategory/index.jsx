import React, { useState, useEffect } from "react";
import { Modal, Button, List, Table, notification, Spin, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getProductsByBrandCategory } from "../../../services/productService";
import { ArrowDropDown, ArrowDropUp, ArrowUpward } from "@mui/icons-material";
import { addProductsToBrand, getAdminBrands } from "../../../services/brandService";

const AddProductModalBrandBrand = ({ isVisible, onClose, currentBrandItemId, setLoadingTable, fetchProducts }) => {
    const dispatch = useDispatch();
    const [selectedParentBrandId, setSelectedParentBrandId] = useState(null);
    const [selectedBrandItemId, setSelectedBrandItemId] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [searchBrand, setSearchBrand] = useState("");
    const [searchProduct, setSearchProduct] = useState("");
    const brands = useSelector((state) => state?.brand?.brands?.data || []);

    useEffect(() => {
        dispatch(getAdminBrands());
    }, [dispatch]);

    useEffect(() => {
        if (selectedBrandItemId) {
            const fetchProducts = async () => {
                setLoading(true);
                try {
                    console.log(currentBrandItemId)
                    const productsData = await dispatch(getProductsByBrandCategory(selectedBrandItemId)).unwrap();
                    const processedProducts = productsData?.data.map((product) => ({
                        ...product,
                        selected: product.categoryItems.some(
                            (item) => item.brandBrandId === selectedBrandItemId
                        ),
                    }));
                    setProducts(processedProducts);
                    setFilteredProducts(processedProducts);
                    const preselected = processedProducts
                        .filter((product) => product.selected)
                        .map((product) => product.productId);
                    setSelectedProductIds(preselected);
                } catch (error) {
                    console.error("Error fetching products:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchProducts();
        }
    }, [dispatch, selectedBrandItemId, currentBrandItemId]);

    const handleAddProducts = async () => {
        setLoading(true);
        setLoadingTable(true);
        try {
            console.log(selectedProductIds)
            await dispatch(addProductsToBrand({ productIds: selectedProductIds, brandCategoryId: currentBrandItemId })).unwrap().then(() => {
                setProducts([]);
                fetchProducts().finally(() => setLoadingTable(false))
            })
            notification.success({ message: "Thêm sản phẩm thành công" });
            onClose();
        } catch (error) {
            notification.error({ message: "Thêm sản phẩm thất bại" });
            console.error("Error adding products:", error);
        } finally {
            setLoading(false);
        }
    };

    console.log(6,brands)

    const filteredCategories = brands.filter((parentBrand) =>
        parentBrand.brandName.toLowerCase().includes(searchBrand.toLowerCase()) ||
        parentBrand.brandCategories.some((item) =>
            item.name.toLowerCase().includes(searchBrand.toLowerCase())
        )
    );


    // Handle product search
    useEffect(() => {
        setFilteredProducts(
            products.filter((product) =>
                product.name.toLowerCase().includes(searchProduct.toLowerCase())
            )
        );
    }, [searchProduct, products]);

    const renderBrandSidebar = () => {
        const toggleParentBrand = (parentBrandId) => {
            setSelectedParentBrandId((prev) =>
                prev === parentBrandId ? null : parentBrandId
            );
        };
        return (
            <List
                size="small"
                dataSource={filteredCategories}
                renderItem={(parentBrand) => (
                    <>
                        <List.Item
                            style={{ fontWeight: "bold", cursor: "pointer" }}
                            onClick={() => toggleParentBrand(parentBrand.brandId)}
                        >
                            <div className="flex justify-between w-full">
                                {parentBrand.brandName}
                                {selectedParentBrandId === parentBrand.brandId ? <ArrowDropUp /> : <ArrowDropDown />}
                            </div>
                        </List.Item>
                        {selectedParentBrandId === parentBrand.brandId && (
                            <List
                                size="small"
                                dataSource={parentBrand.brandCategories || []}
                                renderItem={(subBrand) => (
                                    <List.Item
                                        style={{ marginLeft: 16, cursor: "pointer" }}
                                        onClick={() => setSelectedBrandItemId(subBrand.brandCategoryId)}
                                    >
                                        {subBrand.name}
                                    </List.Item>
                                )}
                            />
                        )}
                    </>
                )}
            />
        );
    };

    const columns = [
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Danh mục",
            dataIndex: "categoryName",
            key: "categoryName",
        },
    ];

    return (
        <Modal
            title="Thêm sản phẩm vào danh mục con"
            visible={isVisible}
            onCancel={onClose}
            onOk={handleAddProducts}
            okButtonProps={{ disabled: selectedProductIds.length === 0 }}
            confirmLoading={loading}
            width={800}
        >
            <Spin spinning={loading}>
                <div style={{ display: "flex", gap: "16px" }}>
                    {/* Sidebar for brands */}
                    <div style={{ flex: 1, maxHeight: "400px", overflowY: "auto", borderRight: "1px solid #f0f0f0", paddingRight: 16 }}>
                        <h3>Danh mục</h3>
                        <Input
                            placeholder="Tìm kiếm danh mục..."
                            value={searchBrand}
                            onChange={(e) => setSearchBrand(e.target.value)}
                            style={{ marginBottom: 16 }}
                        />
                        {renderBrandSidebar()}
                    </div>

                    {/* Product list */}
                    <div style={{ flex: 2 }}>
                        <h3>Sản phẩm</h3>
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchProduct}
                            onChange={(e) => setSearchProduct(e.target.value)}
                            style={{ marginBottom: 16 }}
                        />
                        <Table
                            rowSelection={{
                                selectedRowKeys: selectedProductIds,
                                onChange: (selectedKeys) => setSelectedProductIds(selectedKeys),
                            }}
                            columns={columns}
                            dataSource={filteredProducts}
                            rowKey="productId"
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: filteredProducts.length,
                                onChange: (page, pageSize) => {
                                    setPagination({ current: page, pageSize });
                                },
                            }}
                        />
                    </div>
                </div>
            </Spin>
        </Modal>
    );
};

export default AddProductModalBrandBrand;
