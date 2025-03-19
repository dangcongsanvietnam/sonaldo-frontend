import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import { updateOrder } from "../../services/orderService";

const SuccessfulPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { vnMode } = useOutletContext();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const orderId = params.get("orderId");
        const secretToken = params.get("secretToken");

        if (orderId && secretToken) {
            dispatch(updateOrder({ orderId, secretToken }));
        }
    }, [dispatch, location.search]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md text-center p-6 shadow-lg rounded-2xl bg-white">
                <CheckCircleOutlined className="text-green-500 text-6xl animate-bounce mb-4" />
                <h1 className="text-2xl font-semibold text-gray-800">
                    {vnMode ? "Thanh toán thành công!" : "Payment Successful!"}
                </h1>
                <p className="text-gray-600 mt-2">
                    {vnMode
                        ? "Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất có thể."
                        : "Thank you for your purchase. We will process your order as soon as possible."}
                </p>

                <Button
                    type="primary"
                    className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => navigate("/")}
                >
                    {vnMode ? "Quay về trang chủ" : "Return to Home"}
                </Button>
            </Card>
        </div>
    );
};

export default SuccessfulPage;
