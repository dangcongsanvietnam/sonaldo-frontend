import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Modal, Radio, Tag, Select } from "antd";
import { toast } from "react-toastify"; // Thêm toastify
import { getUserCart } from "./../../services/cartService";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { getAddress } from "../../services/addressService";
import Cookies from "js-cookie";
import { createOrder } from "../../services/orderService";

const UserOrder = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const {vnMode} = useOutletContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const userAddress = useSelector((state) => state?.address?.data);
  const defaultAddressData = userAddress?.find((addr) => addr.defaultAddress);
  const [address, setAddress] = useState(
    defaultAddressData ? defaultAddressData : null
  );
  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    if (!address) {
      if (token) {
        dispatch(getAddress(token))
          .unwrap()
          .then((res) => {
            setAddress(res.data.find((item) => item.defaultAddress === true));
          });
      }
    }
  }, [dispatch]);

  useEffect(() => { }, [dispatch, address]);

  let { selectedRowKeys = [] } = location.state;
  const userCart = useSelector((state) => state?.cart?.userCart?.cartItems);

  useEffect(() => {
    dispatch(getUserCart());
  }, [dispatch]);

  const handleAddressChange = () => {
    setSelectedAddressId(address?.addressId || null);
    setIsModalOpen(true);
  };

  const handleAddressSelect = () => {
    const newDefaultAddress = userAddress?.find(
      (addr) => addr.addressId === selectedAddressId
    );
    if (newDefaultAddress) {
      setAddress(newDefaultAddress);
    } else {
      toast.error(vnMode ? "Chọn địa chỉ thất bại!" : "Failed");
    }
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: vnMode ? "Tên sản phẩm" : "Product Name",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: vnMode ? "Đơn giá" : "Price",
      dataIndex: "price",
      key: "price",
      render: (_, record) => {
        const pricePerUnit = record.totalPrice / record.quantity;
  
        const discountCategoryItem = record.categoryItems?.find(
          (catItem) => catItem.categoryName === "Discounts || Khuyến mãi"
        );
  
        if (discountCategoryItem) {
          const match = discountCategoryItem.name?.match(/(\d+)%/);
          if (match) {
            const discountPercent = parseInt(match[1], 10);
            const discountedUnitPrice =
              pricePerUnit - (pricePerUnit * discountPercent) / 100;
  
            return (
              <span>
                <span className="text-gray-400 line-through mr-1">
                  {pricePerUnit.toLocaleString()}₫
                </span>
                <span className="text-red-500 font-medium">
                  {discountedUnitPrice.toLocaleString()}₫
                </span>
              </span>
            );
          }
        }
  
        return `${pricePerUnit.toLocaleString()}₫`;
      },
    },
    {
      title: vnMode ? "Số lượng" : "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => <span>{quantity}</span>,
    },
    {
      title: vnMode ? "Tổng số tiền" : "Total Price",
      key: "totalPrice",
      dataIndex: "totalPrice",
      render: (_, record) => {
        let totalPrice = record.totalPrice;
  
        const discountCategoryItem = record.categoryItems?.find(
          (catItem) => catItem.categoryName === "Discounts || Khuyến mãi"
        );
  
        if (discountCategoryItem) {
          const match = discountCategoryItem.name?.match(/(\d+)%/);
          if (match) {
            const discountPercent = parseInt(match[1], 10);
            const discountedTotal =
              totalPrice - (totalPrice * discountPercent) / 100;
  
            return (
              <div>
                <div className="line-through text-gray-400">
                  {totalPrice.toLocaleString()}₫
                </div>
                <div className="text-red-500 font-medium">
                  {discountedTotal.toLocaleString()}₫
                </div>
              </div>
            );
          }
        }
  
        return `${totalPrice?.toLocaleString() || "0"}₫`;
      },
    },
  ];  

  const selectedData = userCart?.filter((item) =>
    selectedRowKeys.includes(item.cartItemId)
  );
  
  const totalSelectedPrice =
    selectedData?.reduce((total, item) => {
      let itemTotal = item.totalPrice;
  
      const discountCategoryItem = item.categoryItems?.find(
        (catItem) => catItem.categoryName === "Discounts || Khuyến mãi"
      );
  
      if (discountCategoryItem) {
        const match = discountCategoryItem.name?.match(/(\d+)%/);
        if (match) {
          const discountPercent = parseInt(match[1], 10);
          itemTotal = itemTotal - (itemTotal * discountPercent) / 100;
        }
      }
  
      return total + itemTotal;
    }, 0) || 0;  

  const handleCheckout = async (address, selectedData, paymentMethod) => {
    setLoading(true);
    try {
      const resultAction = await dispatch(
        createOrder({
          address: address,
          selectedData: selectedData,
          paymentMethod: paymentMethod,
          totalPrice: totalSelectedPrice
        })
      ).unwrap();

      toast.success(vnMode ? "Đặt hàng thành công!" : "Checkout succesfully!");

      if (paymentMethod === "COD") {
        navigate(`/orders/${resultAction.orderId}`);
      } else if (paymentMethod === "BANKING" && resultAction.url) {
        window.location.href = resultAction.url;
      } else {
        toast.error(vnMode ? "Không thể xử lý phương thức thanh toán." : "Cannot handle payment method.");
      }
    } catch (error) {
      setLoading(false);
      toast.error(vnMode ? "Có lỗi xảy ra khi đặt hàng." : "Failed while ordering.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">{vnMode ? "Thanh toán" : "Checkout"}</h1>
      <div className="mb-4">
        <h2 className="font-semibold mb-2">{vnMode ? "Địa chỉ nhận hàng" : "Shipping Address"}</h2>
        {address ? (
          <div className="p-4 border border-gray-200 rounded-md shadow-sm">
            <p className="mb-2">
              <strong>{vnMode ? "Họ và tên:" : "Full Name:"}</strong> {address.fullName}
            </p>
            <p className="mb-2">
              <strong>{vnMode ? "Số điện thoại:" : "Phone Number."}</strong> {address.phoneNumber}
            </p>
            <p className="mb-2">
              <strong>{vnMode ? "Địa chỉ:" : "Address:"}</strong> {address.address}, {address.commune},{" "}
              {address.district}, {address.province}
              {address.defaultAddress && (
                <p className="border mt-2 p-1 w-fit border-red-500 text-red-500 font-semibold">
                  {vnMode ? "Mặc định" : "Default"}
                </p>
              )}
            </p>
            <div className="flex justify-end">
              <Button onClick={handleAddressChange}>{vnMode ? "Thay đổi" : "Change"}</Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between">
            <p>{vnMode ? "Không có địa chỉ mặc định. Vui lòng cập nhật địa chỉ." : "You don't have any address yet. Please update a address."}</p>
            <Button
              type="primary"
              onClick={() =>
                navigate("/address")
              }
            >
              {vnMode ? "Thêm địa chỉ" : "Add new address"}
            </Button>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2">{vnMode ? "Sản phẩm" : "Product"}</h2>
        <Table
          columns={columns}
          dataSource={selectedData}
          rowKey="cartItemId"
          pagination={false}
          className="shadow-md border border-gray-200 rounded-lg"
        />
        <div className="mt-4">
          <h3 className="mb-2">{vnMode ? "Chọn phương thức thanh toán:" : "Choose Payment Methods:"}</h3>
          <Select
            defaultValue="COD"
            className="w-1/3"
            onChange={(value) => setPaymentMethod(value)}
          >
            <Select.Option value="COD">
              {vnMode ? "Thanh toán khi nhận hàng " : "Cash on Delivery "} (COD)
            </Select.Option>
            <Select.Option value="BANKING">
              {vnMode ? "Chuyển khoản ngân hàng" : "Banking"}
            </Select.Option>
          </Select>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-lg font-semibold">
            {vnMode ? "Tổng tiền hàng:" : "Total Price:"}{" "}
            <span className="text-red-600">
              vn₫{totalSelectedPrice.toLocaleString()}
            </span>
          </div>
          <div>
            <Button
              type="primary"
              size="large"
              onClick={() =>
                handleCheckout(address, selectedData, paymentMethod)
              }
              loading={loading}
            >
              {vnMode ? "Thanh toán" : "Order"}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        title={vnMode ? "Chọn địa chỉ giao hàng" : "Choose Shipping Address"}
        open={isModalOpen}
        onOk={handleAddressSelect}
        onCancel={() => setIsModalOpen(false)}
        okText={vnMode ? "Xác nhận" : "Confirm"}
        cancelText={vnMode ? "Hủy" : "Cancel"}
      >
        <Radio.Group
          onChange={(e) => setSelectedAddressId(e.target.value)}
          value={selectedAddressId}
          style={{ width: "100%" }}
        >
          {userAddress?.map((addr) => (
            <Radio
              key={addr.addressId}
              value={addr.addressId}
              style={{ display: "block", marginBottom: "10px" }}
            >
              <div>
                <strong>
                  {addr.fullName}
                  {addr.defaultAddress ? (
                    <Tag className="ml-2">{vnMode ? "Mặc định" : "Default"}</Tag>
                  ) : (
                    <></>
                  )}
                </strong>
                <p>{addr.phoneNumber}</p>
                <p>
                  {addr.address}, {addr.commune}, {addr.district},{" "}
                  {addr.province}
                </p>
              </div>
            </Radio>
          ))}
        </Radio.Group>
      </Modal>
    </div>
  );
};

export default UserOrder;
