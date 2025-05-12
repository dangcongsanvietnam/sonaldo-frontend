import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Spin, DatePicker, Button, Modal, Pagination } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
    getTotalProductsSold,
    getTotalRevenue,
    getTotalCustomers,
    getNewCustomersThisMonth,
    getTotalOrdersPlaced,
    getAverageOrderValue,
    getOrderStatusCounts,
    getStatistics,
} from "../../services/statisticService";
import dayjs from "dayjs";
import { getAdminBrands } from "../../services/brandService";
import { getAdminCategories } from "../../services/categoryService";

const { RangePicker } = DatePicker;

const StatisticsPage = () => {
    const dispatch = useDispatch();
    const [dateRange, setDateRange] = useState([
        dayjs().startOf("month"),
        dayjs().endOf("month"),
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;
    const categoryList = useSelector((state) => state.category?.categories?.data);
    const brandList = useSelector((state) => state.brand?.brands?.data);

    const {
        loading,
        totalProductsSold,
        totalRevenue,
        totalCustomers,
        newCustomersThisMonth,
        totalOrdersPlaced,
        averageOrderValue,
        orderStatusCounts,
        error,
        statistics
    } = useSelector((state) => state.statistic);

    const tags = statistics?.tags || [];

    const allStatuses = ["PENDING", "DELVERING", "COMPLETED", "FAILED"];

    const formattedRealData = allStatuses.map(status => ({
        status,
        count: (orderStatusCounts ?? {})[status] || 0
    }));

    const formattedCategories = categoryList?.map(category => {
        const matchedCategory = statistics?.categories?.find(
            stat => stat.categoryName === category.categoryName
        );
        return {
            status: category.categoryName,
            count: matchedCategory ? matchedCategory.totalSold : 0
        };
    });

    const formattedBrands = brandList?.map(brand => {
        const matchedBrand = statistics?.brands?.find(
            stat => stat.brandName === brand.brandName
        );
        return {
            status: brand.brandName,
            count: matchedBrand ? matchedBrand.totalSold : 0
        };
    });

    const top5Tags = [...tags].sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
    const paginatedTags = [...tags].sort((a, b) => b.totalSold - a.totalSold).slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        if (dateRange.length === 2) {
            const [startDate, endDate] = dateRange.map(date => date.format("YYYY-MM-DD"));
            dispatch(getTotalProductsSold({ startDate, endDate }));
            dispatch(getTotalRevenue({ startDate, endDate }));
            dispatch(getTotalOrdersPlaced({ startDate, endDate }));
            dispatch(getAverageOrderValue({ startDate, endDate }));
            dispatch(getStatistics({ startDate, endDate }));
        }
        dispatch(getTotalCustomers());
        dispatch(getNewCustomersThisMonth());
        dispatch(getOrderStatusCounts());

        dispatch(getAdminBrands());
        dispatch(getAdminCategories());
    }, [dispatch, dateRange]);

    const handleDateChange = (dates) => {
        if (dates) {
            setDateRange(dates);
        }
    };

    const stats = [
        { title: "Total Products Sold", value: totalProductsSold },
        { title: "Total Revenue", value: `$${totalRevenue}` },
        { title: "Total Customers", value: totalCustomers },
        { title: "New Customers This Month", value: newCustomersThisMonth },
        { title: "Total Orders Placed", value: totalOrdersPlaced },
        { title: "Average Order Value", value: `$${averageOrderValue}` },
    ];

    return (
        <div className=" min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Statistics Dashboard</h1>

            <div className="mb-4 flex items-center space-x-4">
                <RangePicker
                    value={dateRange}
                    onChange={handleDateChange}
                    format="YYYY-MM-DD"
                />
                <Button type="primary" onClick={() => handleDateChange(dateRange)}>
                    Refresh Data
                </Button>
            </div>

            {loading === "pending" && <Spin size="large" />}
            {error && <p className="text-red-500">Error: {error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map(({ title, value }) => (
                    <Card key={title} className="shadow-md">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <p className="text-xl font-bold">{value ?? "Loading..."}</p>
                    </Card>
                ))}
            </div>

            <div className="mt-8 p-4 bg-white shadow-md rounded-lg">
                <h2 className="text-lg font-bold mb-4">Order Status Counts</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={formattedRealData}>
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3377FF" />
                    </BarChart>
                </ResponsiveContainer>;
            </div>

            <div className="mt-8 p-4 bg-white shadow-md rounded-lg">
                <h2 className="text-lg font-bold mb-4">Brands - Total Sold</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={formattedBrands}>
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3377FF" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Categories */}
            <div className="mt-8 p-4 bg-white shadow-md rounded-lg">
                <h2 className="text-lg font-bold mb-4">Categories - Total Sold</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={formattedCategories}>
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3377FF" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-8 p-4 bg-white shadow-md rounded-lg">
                <h2 className="text-lg font-bold mb-4">Top 5 Most Bought Tags</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {top5Tags.map(tag => (
                        <Card key={tag.tagName} className="shadow-md">
                            <h3 className="text-md font-semibold">{tag.tagName}</h3>
                            <p className="text-xl font-bold">{tag.totalSold}</p>
                        </Card>
                    ))}
                </div>
                <Button type="link" className="mt-4" onClick={() => setModalVisible(true)}>View All</Button>
            </div>

            {/* Modal for Viewing All Tags */}
            <Modal title="All Tags" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} width={800}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {paginatedTags.map(tag => (
                        <Card key={tag.tagName} className="shadow-md">
                            <h3 className="text-md font-semibold">{tag.tagName}</h3>
                            <p className="text-xl font-bold">{tag.totalSold}</p>
                        </Card>
                    ))}
                </div>
                <Pagination
                    className="mt-4 text-center"
                    current={currentPage}
                    pageSize={pageSize}
                    total={tags.length}
                    onChange={setCurrentPage}
                />
            </Modal>
        </div>
    );
};

export default StatisticsPage;
