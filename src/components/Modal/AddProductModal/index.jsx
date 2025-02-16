import React, { useState, useEffect } from "react";
import { Modal, Button, List, Table, notification, Spin, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addProductsToCategoryItem, getAdminCategories } from "../../../services/categoryService";
import { getProductsByCategoryItem } from "../../../services/productService";
import { ArrowDropDown, ArrowDropUp, ArrowUpward } from "@mui/icons-material";

const AddProductModal = ({ isVisible, onClose, currentCategoryItemId, setLoadingTable, fetchProducts }) => {
    const dispatch = useDispatch();
    const [selectedParentCategoryId, setSelectedParentCategoryId] = useState(null);
    const [selectedCategoryItemId, setSelectedCategoryItemId] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [searchCategory, setSearchCategory] = useState("");
    const [searchProduct, setSearchProduct] = useState("");
    const categories = useSelector((state) => state?.category?.categories?.data || []);

    useEffect(() => {
        dispatch(getAdminCategories());
    }, [dispatch]);

    useEffect(() => {
        if (selectedCategoryItemId) {
            const fetchProducts = async () => {
                setLoading(true);
                try {
                    const productsData = await dispatch(getProductsByCategoryItem(selectedCategoryItemId)).unwrap();
                    const processedProducts = productsData?.data.map((product) => ({
                        ...product,
                        selected: product.categoryItems.some(
                            (item) => item.categoryItemId === currentCategoryItemId
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
    }, [dispatch, selectedCategoryItemId, currentCategoryItemId]);

    const handleAddProducts = async () => {
        setLoading(true);
        setLoadingTable(true);
        try {
            console.log(selectedProductIds)
            await dispatch(addProductsToCategoryItem({ productIds: selectedProductIds, categoryItemId: currentCategoryItemId })).unwrap().then(() => {
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

    const filteredCategories = categories.filter((parentCategory) =>
        parentCategory.categoryName.toLowerCase().includes(searchCategory.toLowerCase()) ||
        parentCategory.categoryItems.some((item) =>
            item.name.toLowerCase().includes(searchCategory.toLowerCase())
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

    const renderCategorySidebar = () => {
        const toggleParentCategory = (parentCategoryId) => {
            setSelectedParentCategoryId((prev) =>
                prev === parentCategoryId ? null : parentCategoryId
            );
        };
        return (
            <List
                size="small"
                dataSource={filteredCategories}
                renderItem={(parentCategory) => (
                    <>
                        <List.Item
                            style={{ fontWeight: "bold", cursor: "pointer" }}
                            onClick={() => toggleParentCategory(parentCategory.categoryId)}
                        >
                            <div className="flex justify-between w-full">
                                {parentCategory.categoryName}
                                {selectedParentCategoryId === parentCategory.categoryId ? <ArrowDropUp /> : <ArrowDropDown />}
                            </div>
                        </List.Item>
                        {selectedParentCategoryId === parentCategory.categoryId && (
                            <List
                                size="small"
                                dataSource={parentCategory.categoryItems || []}
                                renderItem={(subCategory) => (
                                    <List.Item
                                        style={{ marginLeft: 16, cursor: "pointer" }}
                                        onClick={() => setSelectedCategoryItemId(subCategory.categoryItemId)}
                                    >
                                        {subCategory.name}
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
                    {/* Sidebar for categories */}
                    <div style={{ flex: 1, maxHeight: "400px", overflowY: "auto", borderRight: "1px solid #f0f0f0", paddingRight: 16 }}>
                        <h3>Danh mục</h3>
                        <Input
                            placeholder="Tìm kiếm danh mục..."
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                            style={{ marginBottom: 16 }}
                        />
                        {renderCategorySidebar()}
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

export default AddProductModal;
