import React, { useEffect, useState } from "react";
import { Card, List, Button, Spin, Tabs, Avatar } from "antd";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchAdminProducts } from "../../../services/productService";
import TabPane from "antd/es/tabs/TabPane";
import {
    UserOutlined
  } from "@ant-design/icons";

const SearchResults = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const query = new URLSearchParams(location.search).get("q");
    const { searchResults = [], searchValue = "" } = location.state || {};
    const { vnMode } = useOutletContext();

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            const searchFields = ["productName", "brandCategoryId", "categoryItemIds"];
            const fetchedResults = [];

            for (const field of searchFields) {
                const params = {
                    productName: "",
                    status: "",
                    brandCategoryId: "",
                    categoryItemIds: [],
                };

                params[field] = field === "categoryItemIds" ? [query] : query;
                const res = await dispatch(searchAdminProducts({ params, page: 0, limit: 50 })).unwrap();

                res.data.forEach((product) => {
                    fetchedResults.push({
                        name: product.name,
                        type: field,
                        link: `/admin/product/${product.id}`,
                    });
                });
            }

            setResults(fetchedResults);
            setLoading(false);
        };

        if (query) {
            fetchSearchResults();
        }
    }, [query, dispatch]);

    const groupedResults = searchResults.reduce((acc, result) => {
        (acc[result.type] = acc[result.type] || []).push(result);
        return acc;
    }, {});

    return (
        <div style={{ padding: 24, minHeight: "100vh" }}>
            {loading ? (
                <Spin size="large" />
            ) : (
                <>
                    <h1 className="mb-5">
                        {vnMode ? "Tổng kết quả tìm kiếm:" : "Total search results:"} {searchResults.length}
                    </h1>
                    <Tabs>
                        {Object.entries(groupedResults).map(([type, results]) => (
                            <TabPane
                                tab={
                                    `(${results.length})` + " " + (type === "brand"
                                        ? vnMode ? "Nhãn hàng" : "Brand"
                                        : type === "category"
                                            ? vnMode ? "Danh mục" : "Category"
                                            : type === "user" ? vnMode ? "Người dùng" : "User" : type == "menu" ? vnMode ? "Đầu mục" : "Menu" : vnMode ? "Sản phẩm" : "Product")
                                }
                                key={type}
                            >
                                <List
                                    grid={{ gutter: 16, column: 1 }}
                                    dataSource={results}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <Card>
                                                <div className="flex justify-between">
                                                    <div className="flex items-center">
                                                        {item.avatar ? item.avatar.src !== '' ? (
                                                            <Avatar src={item.avatar.src} alt={item.avatar.alt} />
                                                        ) : (
                                                            <Avatar icon={<UserOutlined />} />
                                                        ) : (<></>)}
                                                        <span className="ml-2">{item.name}</span> {/* Hiển thị tên */}
                                                    </div>
                                                    <div
                                                        className="cursor-pointer underline text-cyan-700 hover:text-cyan-900"
                                                        onClick={() => navigate(item.link)}
                                                    >
                                                        <span>{vnMode ? "Điều hướng > > >" : "Navigate > > >"}</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </TabPane>
                        ))}
                    </Tabs>
                    {/* {Object.entries(groupedResults).map(([type, results]) => (
                        <div key={type}>
                            <h2 className="mb-2">
                                {type === "brand"
                                    ? vnMode ? "Nhãn hàng" : "Brand"
                                    : type === "category"
                                        ? vnMode ? "Danh mục" : "Category"
                                        : type === "user" ? vnMode ? "Người dùng" : "User" : vnMode ? "Sản phẩm" : "Product"}
                            </h2>
                            <List
                                grid={{ gutter: 16, column: 1 }}
                                dataSource={results}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Card>
                                            <div className="flex justify-between">
                                                {item.name}
                                                <div
                                                    className="cursor-pointer underline text-cyan-700 hover:text-cyan-900"
                                                    onClick={() => navigate(item.link)}
                                                >
                                                    <span>{vnMode ? "Điều hướng > > >" : "Navigate > > >"}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </List.Item>
                                )}
                            />
                        </div>
                    ))} */}
                    {searchResults.length === 0 && (
                        <p>{vnMode ? "Không có kết quả phù hợp." : "No matching results found."}</p>
                    )}
                    <Button style={{ marginTop: 16 }} onClick={() => navigate(-1)}>
                        {vnMode ? "Quay lại" : "Go back"}
                    </Button>
                </>
            )}
        </div>

    );
};

export default SearchResults;