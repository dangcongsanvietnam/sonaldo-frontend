import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Spin, Alert, Tag, Table } from "antd";
import { getOrder } from "../../services/orderService";

const Payment = () => {
  const { orderId } = useParams(); // Lấy orderId từ URL
  const dispatch = useDispatch();

  // Gọi API lấy thông tin thanh toán
  useEffect(() => {
    if (orderId) {
      dispatch(getOrder(orderId));
    }
  }, [dispatch, orderId]);

  const payment = useSelector((state) => state?.order?.data);

  console.log("pm", payment);

  // Hiển thị thông tin thanh toán nếu có

  const dataSource = payment?.cartItems || [];

  const columns = [
    {
      title: "ID Sản phẩm",
      dataIndex: "productId",
      key: "productId",
      render: (productId) => <span className="text-gray-600">{productId}</span>,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (productName) => (
        <span className="font-medium">{productName}</span>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => <span className="text-gray-600">{quantity}</span>,
    },
    {
      title: "Giá tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (totalPrice) => `₫${totalPrice.toLocaleString()}`,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Chi tiết Thanh toán
        </h1>

        {payment && (
          <>
            {/* Thông tin đơn hàng */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700">
                Thông tin Đơn hàng
              </h2>
              <div className="grid grid-cols-2 gap-4 mt-2 text-gray-600">
                <p>
                  <strong>Mã đơn hàng:</strong> {payment.orderId}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <Tag
                    color={
                      payment.orderStatus === "SUCCESS"
                        ? "green"
                        : payment.orderStatus === "PENDING"
                        ? "orange"
                        : "red"
                    }
                  >
                    {payment.status}
                  </Tag>
                </p>
                <p>
                  <strong>Tổng tiền:</strong> ₫
                  {payment.totalPrice?.toLocaleString()}
                </p>
                <p>
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {payment.orderMethod || "N/A"}
                </p>
              </div>
            </div>

            {/* Thông tin người nhận */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700">
                Thông tin Người nhận
              </h2>
              <div className="grid grid-cols-2 gap-4 mt-2 text-gray-600">
                <p>
                  <strong>Họ và tên:</strong> {payment.fullName}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {payment.phoneNumber}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {payment.shippingAddress}
                </p>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Danh sách sản phẩm
              </h2>
              <Table
                columns={columns}
                dataSource={dataSource}
                rowKey={(record) => record.productId}
                pagination={false}
                className="shadow rounded-lg"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Payment;
