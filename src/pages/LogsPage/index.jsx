import React, { useState, useEffect } from "react";
import { Input, Select, DatePicker, Button, Table, Spin, Tag } from "antd";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getLogs } from "../../services/changelogService";
import moment from "moment";

const { RangePicker } = DatePicker;

const LogsPage = () => {
    const [filters, setFilters] = useState({
        eventType: "",
        eventId: "",
        status: "",
        detail: "",
        startTime: null,
        endTime: null,
    });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const data = useSelector((state) => state.changelog.data)

    const formattedData = data.map((log) => {
        const formattedTimestamp = moment(log.timestamp).format("HH:mm DD/MM/YYYY");

        // Định dạng trạng thái và thêm màu
        const statusMapping = {
            SUCCESS: { text: "Thành công", color: "green" },
            FAILURE: { text: "Thất bại", color: "red" },
        };
        const formattedStatus = statusMapping[log.status]
            ? statusMapping[log.status]
            : { text: log.status, color: "default" };
        let formattedEventType = "";
        let formattedDetail = "";

        // Chuyển đổi giá trị của eventType
        switch (log.eventType) {
            case "LOGIN":
                formattedEventType = "đã đăng nhập";
                break;
            case "DELETE":
                formattedEventType = "đã bị xoá";
                break;
            case "CREATE":
                formattedEventType = "đã được thêm";
                break;
            case "UPDATE":
                formattedEventType = "đã được cập nhật";
                break;
            case "REMOVE":
                formattedEventType = "đã xoá khỏi danh sách";
            case "ADD":
                formattedEventType = "đã thêm vào danh sách";
                break;
            case "ADD_TO_BRAND_CATEGORY" || "ADD_TO_CATEGORY_ITEM":
                formattedEventType = "đã được thêm sản phẩm";
                break;
            case "REMOVE_FROM_BRAND_CATEGORY" || "REMOVE_FROM_CATEGORY_ITEM":
                formattedEventType = "đã bị xoá sản phẩm";
                break;
            default:
                formattedEventType = log.eventType;
        }

        let productId = ""
        if (log.details.startsWith("PRODUCT ") && log.eventType == "ADD_TO_BRAND_CATEGORY") {
            productId = log.details.split(" ")[1]; // Lấy ID sản phẩm
            formattedDetail = `thương hiệu`;
        } else if (log.details.startsWith("PRODUCT ") && log.eventType == "ADD_TO_CATEGORY_ITEM") {
            productId = log.details.split(" ")[1]; // Lấy ID sản phẩm
            formattedDetail = `danh mục`;
        } else if (log.detail === "USER") {
            formattedDetail = "người dùng";
        } else if (log.detail === "BRAND") {
            formattedDetail = "thương hiệu";
        } else {
            formattedDetail = log.details;
        }

        return {
            ...log,
            detail: formattedDetail,
            eventType: productId == "" ? formattedDetail + " " + formattedEventType : formattedDetail + " " + formattedEventType + " " + productId,
            timestamp: formattedTimestamp,
            status: formattedStatus,
        };
    });

    const handleClear = async () => {
        setLoading(true);
        setFilters({
            eventType: "",
            eventId: "",
            status: "",
            detail: "",
            startTime: null,
            endTime: null,
        });
        const newClearData = {
            eventType: "",
            eventId: "",
            status: "",
            detail: "",
            startTime: null,
            endTime: null,
        };

        // Xóa dữ liệu hiển thị (nếu sử dụng Redux)
        await dispatch(getLogs(newClearData)).finally(() => setLoading(false));
    };


    useEffect(() => {
        setLoading(true);
        const fetchChangelogs = async () => {
            try {
                dispatch(getLogs(filters));
            } catch (error) {
                console.error("Failed to fetch changelogs:", error);
            } finally {
                setLoading(false)
            }
        };
        fetchChangelogs();
    }, [dispatch]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            await dispatch(getLogs(filters))
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
                <Input
                    placeholder="ID"
                    style={{ width: 200 }}
                    onChange={(e) => handleFilterChange("eventId", e.target.value)}
                    value={filters.eventId}
                    allowClear
                />
                <Select
                    placeholder="Loại thay đổi"
                    style={{ width: 200 }}
                    onChange={(value) => handleFilterChange("eventType", value)}
                    allowClear
                    defaultValue={undefined}
                    value={filters.eventType || undefined}
                >
                    <Select.Option value="CREATE">Thêm</Select.Option>
                    <Select.Option value="UPDATE">Sửa</Select.Option>
                    <Select.Option value="DELETE">Xoá</Select.Option>
                    <Select.Option value="ADD_TO_BRAND_CATEGORY">Thêm vào nhãn hàng</Select.Option>
                    <Select.Option value="REMOVE_FROM_BRAND_CATEGORY">Xoá khỏi nhãn hàng</Select.Option>
                    <Select.Option value="ADD_TO_CATEGORY_ITEM">Thêm vào danh mục</Select.Option>
                    <Select.Option value="REMOVE_FROM_CATEGORY_ITEM">Xoá khỏi danh mục</Select.Option>
                </Select>
                <Select
                    placeholder="Trạng thái"
                    defaultValue={undefined}
                    style={{ width: 200 }}
                    onChange={(value) => handleFilterChange("status", value)}
                    allowClear
                    value={filters.status || undefined}
                >
                    <Select.Option value="SUCCESS">Thành công</Select.Option>
                    <Select.Option value="FAILURE">Thất bại</Select.Option>
                </Select>
                <RangePicker
                    value={
                        filters.startTime && filters.endTime
                            ? [moment(filters.startTime), moment(filters.endTime)]
                            : null
                    }
                    onChange={(dates) => {
                        handleFilterChange("startTime", dates ? dates[0]?.toISOString() : null);
                        handleFilterChange("endTime", dates ? dates[1]?.toISOString() : null);
                    }}
                    allowClear
                />
                <Button type="primary" onClick={fetchLogs}>
                    Lọc
                </Button>
                <Button type="primary" danger onClick={handleClear}>
                    Xoá
                </Button>
            </div>
            <Spin spinning={loading}>
                <Table
                    dataSource={formattedData}
                    columns={[
                        { title: "ID thay đổi", dataIndex: "eventId", key: "eventId" },
                        { title: "Nội dung thay đổi", dataIndex: "eventType", key: "eventType" },
                        {
                            title: "Trạng thái",
                            dataIndex: "status",
                            key: "status",
                            render: (status) => (
                                <Tag color={status.color}>{status.text}</Tag>
                            ),
                        },
                        { title: "Thời gian thay đổi", dataIndex: "timestamp", key: "timestamp" },
                    ]}
                />
            </Spin>
        </div>
    );
};

export default LogsPage;
