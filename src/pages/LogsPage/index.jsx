import React, { useState, useEffect } from "react";
import { Input, Select, DatePicker, Button, Table, Spin, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getLogs } from "../../services/changelogService";
import { useOutletContext } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { RangePicker } = DatePicker;

const LogsPage = () => {
    const userTimezone = dayjs.tz.guess();
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
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
    const { vnMode } = useOutletContext();

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const data = useSelector((state) => state.changelog.data);

    const formattedData = data.map((log) => {
        const formattedTimestamp = dayjs(log.timestamp).format("HH:mm DD/MM/YYYY");

        const statusMapping = {
            SUCCESS: { text: vnMode ? "Thành công" : "Success", color: "green" },
            FAILURE: { text: vnMode ? "Thất bại" : "Failure", color: "red" },
        };
        const formattedStatus = statusMapping[log.status]
            ? statusMapping[log.status]
            : { text: log.status, color: "default" };
        let formattedEventType = "";
        let formattedDetail = "";

        switch (log.eventType) {
            case "LOGIN":
                formattedEventType = vnMode ? "đã đăng nhập" : "logged in";
                break;
            case "DELETE":
                formattedEventType = vnMode ? "đã bị xoá" : "has been deleted";
                break;
            case "CREATE":
                formattedEventType = vnMode ? "đã được thêm" : "has been added";
                break;
            case "UPDATE":
                formattedEventType = vnMode ? "đã được cập nhật" : "has been updated";
                break;
            case "REMOVE":
                formattedEventType = vnMode ? "đã xoá khỏi danh sách" : "removed from the list";
            case "ADD":
                formattedEventType = vnMode ? "đã thêm vào danh sách" : "added to the list";
                break;
            case "ADD_TO_BRAND_CATEGORY":
                formattedEventType = vnMode ? "đã được thêm sản phẩm vào nhãn hàng" : "product has been added to brand";
                break;
            case "REMOVE_FROM_BRAND_CATEGORY":
                formattedEventType = vnMode ? "đã bị xoá sản phẩm khỏi nhãn hàng" : "product has been removed from brand";
                break;
            case "ADD_TO_CATEGORY_ITEM":
                formattedEventType = vnMode ? "đã được thêm sản phẩm vào danh mục" : "product has been added to category";
                break;
            case "REMOVE_FROM_CATEGORY_ITEM":
                formattedEventType = vnMode ? "đã bị xoá sản phẩm khỏi danh mục" : "product has been removed from category";
                break;
            default:
                formattedEventType = log.eventType;
        }

        let productId = "";
        if (log.details?.startsWith("PRODUCT ") && (log.eventType == "ADD_TO_BRAND_CATEGORY" || log.eventType == "REMOVE_FROM_BRAND_CATEGORY")) {
            productId = log.details.split(" ")[1];
            formattedDetail = vnMode ? `thương hiệu` : "brand";
          } else if (log.details.startsWith("PRODUCT ") && (log.eventType == "ADD_TO_CATEGORY_ITEM" || log.eventType == "REMOVE_FROM_CATEGORY_ITEM")) {
            productId = log.details.split(" ")[1];
            formattedDetail = vnMode ? `khách hàng` : "customer";
          } else if (log.details === "USER") {
            formattedDetail = vnMode ? "người dùng" : "user";
          } else if (log.details === "BRAND") {
            formattedDetail = vnMode ? "thương hiệu" : "brand";
          } else if (log.details === "CATEGORY") {
            formattedDetail = vnMode ? "danh mục" : "category";
          } else if (log.details === "PRODUCT") {
            formattedDetail = vnMode ? "sản phẩm" : "product";
          } else if (log.details === "INFORMATION") {
            formattedDetail = vnMode ? "thông tin" : "information";
          } else {
            formattedDetail = log.details;
          }

        const displayEventType = productId === ""
            ? `${formattedDetail} ${formattedEventType}`
            : `${formattedDetail} ${formattedEventType} ${productId}`;


        return {
            ...log,
            _uniqueId: uuidv4(),
            detail: formattedDetail,
            eventType: displayEventType,
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
            userId: userId,
            role: role
        };

        await dispatch(getLogs(newClearData)).finally(() => setLoading(false));
    };


    useEffect(() => {
        setLoading(true);
        const fetchChangelogs = async () => {
            try {
                const initialData = { userId: userId, role: role };
                dispatch(getLogs(initialData));
            } catch (error) {
                console.error("Failed to fetch changelogs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChangelogs();
    }, [dispatch, userId, role]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const newData = {
                ...filters,
                startTime: filters.startTime ? dayjs(filters.startTime).toISOString() : null,
                endTime: filters.endTime ? dayjs(filters.endTime).toISOString() : null,
                userId: userId,
                role: role
            };

            await dispatch(getLogs(newData));
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
                    placeholder={vnMode ? "ID" : "ID"}
                    style={{ width: 200 }}
                    onChange={(e) => handleFilterChange("eventId", e.target.value)}
                    value={filters.eventId}
                    allowClear
                />
                <Select
                    placeholder={vnMode ? "Loại thay đổi" : "Type Change"}
                    style={{ width: 200 }}
                    onChange={(value) => handleFilterChange("eventType", value)}
                    allowClear
                    defaultValue={undefined}
                    value={filters.eventType || undefined}
                >
                    <Select.Option value="CREATE">{vnMode ? "Thêm" : "Create"}</Select.Option>
                    <Select.Option value="UPDATE">{vnMode ? "Sửa" : "Update"}</Select.Option>
                    <Select.Option value="DELETE">{vnMode ? "Xoá" : "Delete"}</Select.Option>
                    <Select.Option value="ADD_TO_BRAND_CATEGORY">{vnMode ? "Thêm vào nhãn hàng" : "Add to Brand Category"}</Select.Option>
                    <Select.Option value="REMOVE_FROM_BRAND_CATEGORY">{vnMode ? "Xoá khỏi nhãn hàng" : "Remove from Brand Category"}</Select.Option>
                    <Select.Option value="ADD_TO_CATEGORY_ITEM">{vnMode ? "Thêm vào danh mục" : "Add to Category Item"}</Select.Option>
                    <Select.Option value="REMOVE_FROM_CATEGORY_ITEM">{vnMode ? "Xoá khỏi danh mục" : "Remove from Category Item"}</Select.Option>
                </Select>
                <Select
                    placeholder={vnMode ? "Trạng thái" : "Status"}
                    defaultValue={undefined}
                    style={{ width: 200 }}
                    onChange={(value) => handleFilterChange("status", value)}
                    allowClear
                    value={filters.status || undefined}
                >
                    <Select.Option value="SUCCESS">{vnMode ? "Thành công" : "Success"}</Select.Option>
                    <Select.Option value="FAILURE">{vnMode ? "Thất bại" : "Failure"}</Select.Option>
                </Select>
                <RangePicker
                    value={
                        (filters.startTime && filters.endTime)
                        ? [dayjs(filters.startTime, "YYYY-MM-DDTHH:mm:ss.SSS").tz(userTimezone), dayjs(filters.endTime, "YYYY-MM-DDTHH:mm:ss.SSS").tz(userTimezone)]
                        : null
                    }
                    onChange={(dates) => {
                        if (dates && dates.length === 2) {
                            const startTimeLocal = dates[0].tz(userTimezone).format("YYYY-MM-DDTHH:mm:ss.SSS");
                            const endTimeLocal = dates[1].tz(userTimezone).format("YYYY-MM-DDTHH:mm:ss.SSS");
                            handleFilterChange("startTime", startTimeLocal + "Z");
                            handleFilterChange("endTime", endTimeLocal + "Z");
                        } else {
                            handleFilterChange("startTime", null);
                            handleFilterChange("endTime", null);
                        }
                    }}
                    allowClear
                    showTime={{ format: 'HH:mm' }}
                    format="DD/MM/YYYY HH:mm"
                />
                <Button type="primary" onClick={fetchLogs}>
                    {vnMode ? "Lọc" : "Filter"}
                </Button>
                <Button type="primary" danger onClick={handleClear}>
                    {vnMode ? "Xoá" : "Clear"}
                </Button>
            </div>
            <Spin spinning={loading}>
                <Table
                    dataSource={formattedData}
                    columns={[
                        { title: vnMode ? "ID thay đổi" : "Change ID", dataIndex: "eventId", key: "eventId" },
                        { title: vnMode ? "Nội dung thay đổi" : "Change Content", dataIndex: "eventType", key: "eventType" },
                        {
                            title: vnMode ? "Trạng thái" : "Status",
                            dataIndex: "status",
                            key: "status",
                            render: (status) => (
                                <Tag color={status.color}>{status.text}</Tag>
                            ),
                        },
                        { title: vnMode ? "Thời gian thay đổi" : "Change Time", dataIndex: "timestamp", key: "timestamp" },
                    ]}
                    rowKey="_uniqueId"
                />
            </Spin>
        </div>

    );
};

export default LogsPage;