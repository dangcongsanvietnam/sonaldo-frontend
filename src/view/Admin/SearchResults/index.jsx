import React, { useEffect, useState } from "react";
import { Card, List, Button, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchAdminProducts } from "../../../services/productService";

const SearchResults = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const query = new URLSearchParams(location.search).get("q");
    const { searchResults = [], searchValue = "" } = location.state || {};

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

    return (
        <div style={{ padding: 24, minHeight: "100vh" }}>
            {loading ? (
                <Spin size="large" />
            ) : (
                <>
                    <h1 className="mb-5">Tổng kết quả tìm kiếm: {searchResults.length}</h1>
                    <List
                        grid={{ gutter: 16, column: 1 }}
                        dataSource={searchResults}
                        renderItem={(item) => (
                            <List.Item>
                                <Card
                                    title={
                                        item.type === "brand"
                                            ? "Nhãn hàng"
                                            : item.type === "category"
                                                ? "Danh mục"
                                                : "Sản phẩm"
                                    }

                                >
                                    <div className="flex justify-between">
                                        {item.name}
                                        <div className="cursor-pointer underline text-cyan-700 hover:text-cyan-900" onClick={() => navigate(item.link)}>
                                            <span>Điều hướng {'>'}{'>'}{'>'} </span>
                                        </div>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                    {searchResults.length === 0 && <p>Không có kết quả phù hợp.</p>}
                    <Button style={{ marginTop: 16 }} onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                </>
            )}
        </div>
    );
};

export default SearchResults;