import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Select, Input, DatePicker, Empty, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";
import dayjs from "dayjs";
import { getOrderDetail, userOrder } from "../../services/orderService";

const { Option } = Select;
const { Search, TextArea } = Input;
const { RangePicker } = DatePicker;

const OrderList = () => {
    const orders = useSelector((state) => state?.orders?.userOrder);
    const [cancelModal, setCancelModal] = useState({ visible: false, orderId: null });
    const [cancelReason, setCancelReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [searchText, setSearchText] = useState("");
    const [priceFilter, setPriceFilter] = useState("");
    const [dateFilter, setDateFilter] = useState([]);
    const { vnMode } = useOutletContext();
    const dispatch = useDispatch();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 636);
    const selectedOrder = useSelector((state) => state.orders.orderDetail);
    const [modalVisible, setModalVisible] = useState(false);

    const statusLabels = {
        PENDING: { text: vnMode ? "Đang chờ" : "Pending", color: "orange" },
        DELIVERING: { text: vnMode ? "Đang giao" : "Delivering", color: "blue" },
        COMPLETED: { text: vnMode ? "Hoàn thành" : "Completed", color: "green" },
        FAILED: { text: vnMode ? "Thất bại" : "Failed", color: "red" },
    };

    useEffect(() => {
        dispatch(userOrder());
    }, [dispatch]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleCancelOrder = () => {
        if (!cancelReason) {
            toast.error(vnMode ? "Vui lòng chọn lý do" : "Please select a reason");
            return;
        }

        const finalReason = cancelReason === "Other" ? otherReason : cancelReason;
        toast.success(vnMode ? "Đã hủy đơn hàng" : "Order canceled");

        // Mock API call (Replace with actual API call)
        console.log(`Order ${cancelModal.orderId} canceled for reason: ${finalReason}`);

        setCancelModal({ visible: false, orderId: null });
        setCancelReason("");
        setOtherReason("");
    };

    const canCancel = (status) => ["PENDING", "DELIVERING"].includes(status);

    const filteredOrders = orders.filter((order) => {
        const matchId = order.orderId.toLowerCase().includes(searchText.toLowerCase());
        const matchPrice = priceFilter ? order.totalPrice.toString().includes(priceFilter) : true;
        const matchDate =
            dateFilter.length === 2
                ? dayjs(order.createdAt).isAfter(dayjs(dateFilter[0])) &&
                dayjs(order.createdAt).isBefore(dayjs(dateFilter[1]))
                : true;

        return matchId && matchPrice && matchDate;
    });

    const showOrderDetail = async (orderId) => {
        await dispatch(getOrderDetail(orderId));
        setModalVisible(true);
    };

    const columns = [
        {
            title: vnMode ? "Mã đơn hàng" : "Order ID",
            dataIndex: "orderId",
            key: "orderId",
            sorter: (a, b) => a.orderId.localeCompare(b.orderId),
        },
        {
            title: vnMode ? "Tổng giá" : "Total Price",
            dataIndex: "totalPrice",
            key: "totalPrice",
            sorter: (a, b) => a.totalPrice - b.totalPrice,
            render: (price) => `$${price.toFixed(2)}`,
        },
        {
            title: vnMode ? "Trạng thái" : "Status",
            dataIndex: "orderStatus",
            key: "orderStatus",
            filters: Object.keys(statusLabels).map((key) => ({
                text: statusLabels[key].text,
                value: key,
            })),
            onFilter: (value, record) => record.orderStatus === value,
            render: (status) => <Tag color={statusLabels[status]?.color}>{statusLabels[status]?.text}</Tag>,
        },
        // {
        //     title: vnMode ? "Địa chỉ" : "Address",
        //     dataIndex: "address",
        //     key: "address",
        // },
        {
            title: vnMode ? "Ngày tạo" : "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: vnMode ? "Hành động" : "Actions",
            key: "actions",
            fixed: "right",
            render: (_, order) => (
                <div className="flex gap-2">
                    <Button type="primary" size="small" onClick={() => showOrderDetail(order.orderId)}>
                        {vnMode ? "Xem" : "View"}
                    </Button>
                    <Button disabled={!canCancel(order.orderStatus)} type="default" danger size="small" onClick={() => setCancelModal({ visible: true, orderId: order.orderId })}>
                        {vnMode ? "Hủy" : "Cancel"}
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 relative overflow-hidden">
            <h1 className="text-2xl font-bold mb-4">{vnMode ? "Danh sách đơn hàng" : "Order List"}</h1>

            <div className="flex gap-4 mb-4">
                <Search
                    placeholder={vnMode ? "Tìm theo mã đơn hàng..." : "Search by Order ID..."}
                    className="w-1/4"
                    onSearch={setSearchText}
                    enterButton
                />
                <Search
                    placeholder={vnMode ? "Tìm theo giá..." : "Search by Price..."}
                    className="w-1/4"
                    onSearch={setPriceFilter}
                    enterButton
                />
                <RangePicker
                    className="w-1/3"
                    format="DD/MM/YYYY"
                    onChange={(dates) => setDateFilter(dates)}
                    placeholder={[vnMode ? "Từ ngày" : "From", vnMode ? "Đến ngày" : "To"]}
                />
            </div>

            {filteredOrders.length > 0 ? (
                <div className="relative overflow-hidden">
                    <Table
                        dataSource={orders}
                        columns={columns}
                        rowKey="orderId"
                        pagination={{ pageSize: 5 }}
                        scroll={isMobile ? { x: "max-content" } : undefined}
                    />
                </div>
            ) : (
                <Empty description={vnMode ? "Không có đơn hàng nào" : "No orders found"} className="mt-10" />
            )}

            <Modal
                title={vnMode ? "Chi tiết đơn hàng" : "Order Details"}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        {vnMode ? "Đóng" : "Close"}
                    </Button>,
                ]}
            >
                {selectedOrder && (
                    <div className="space-y-3">
                        <p>
                            <strong>{vnMode ? "Mã đơn hàng:" : "Order ID:"}</strong> {selectedOrder.orderId}
                        </p>
                        <p>
                            <strong>{vnMode ? "Tên khách hàng:" : "Full Name:"}</strong> {selectedOrder.fullName}
                        </p>
                        <p>
                            <strong>{vnMode ? "Số điện thoại:" : "Phone Number:"}</strong> {selectedOrder.phoneNumber}
                        </p>
                        <p>
                            <strong>{vnMode ? "Địa chỉ giao hàng:" : "Shipping Address:"}</strong> {selectedOrder.shippingAddress}
                        </p>
                        <p>
                            <strong>{vnMode ? "Tổng giá:" : "Total Price:"}</strong> ${selectedOrder.totalPrice.toFixed(2)}
                        </p>
                        <p>
                            <strong>{vnMode ? "Trạng thái:" : "Order Status:"}</strong>{" "}
                            <Tag color={statusLabels[selectedOrder.orderStatus]?.color}>
                                {statusLabels[selectedOrder.orderStatus]?.text}
                            </Tag>
                        </p>
                        <p>
                            <strong>{vnMode ? "Phương thức đặt hàng:" : "Order Method:"}</strong> {selectedOrder.orderMethod}
                        </p>

                        <h3 className="text-lg font-bold">{vnMode ? "Sản phẩm" : "Cart Items"}</h3>
                        <div className="max-h-60 overflow-auto border p-2 rounded">
                            {selectedOrder.cartItems.map((item) => (
                                <div key={item.cartItemId} className="flex items-center space-x-3 border-b pb-2 mb-2">
                                    <img
                                        src={`data:image/png;base64,${item.productImage.file.data}`}
                                        alt={item.productName}
                                        className="w-14 h-14 object-cover rounded"
                                    />
                                    <div>
                                        <p className="font-semibold">{item.productName}</p>
                                        <p>{vnMode ? "Số lượng:" : "Quantity:"} {item.quantity}</p>
                                        <p>{vnMode ? "Giá:" : "Price:"} ${item.totalPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
            <Modal
                title={vnMode ? "Hủy đơn hàng" : "Cancel Order"}
                open={cancelModal.visible}
                onOk={handleCancelOrder}
                onCancel={() => setCancelModal({ visible: false, orderId: null })}
                okText={vnMode ? "Xác nhận" : "Confirm"}
                cancelText={vnMode ? "Hủy" : "Cancel"}
            >
                <p>{vnMode ? "Chọn lý do hủy đơn" : "Select a reason for cancellation"}</p>
                <Select className="w-full mt-2" value={cancelReason} onChange={setCancelReason}>
                    <Option value="Changed Mind">{vnMode ? "Thay đổi ý định" : "Changed mind"}</Option>
                    <Option value="Found Cheaper">{vnMode ? "Tìm thấy giá rẻ hơn" : "Found a cheaper option"}</Option>
                    <Option value="Delayed Delivery">{vnMode ? "Giao hàng chậm" : "Delayed delivery"}</Option>
                    <Option value="Other">{vnMode ? "Khác" : "Other"}</Option>
                </Select>
                {cancelReason === "Other" && (
                    <TextArea
                        className="mt-2"
                        rows={3}
                        placeholder={vnMode ? "Nhập lý do..." : "Enter reason..."}
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default OrderList;
