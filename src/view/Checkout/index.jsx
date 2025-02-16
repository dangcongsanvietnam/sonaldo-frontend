// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Table, Checkbox, Button, Modal, Radio } from "antd";
// import { getUserCart } from "./../../services/cartService";
// import { useLocation, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify"; // Thêm toastify

// const UserOrder = () => {
//   const dispatch = useDispatch();
//   //   const [selectedRowKeys, setSelectedRowKeys] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedAddressId, setSelectedAddressId] = useState(null);
//   const location = useLocation();
//   let { selectedRowKeys = [] } = location.state;
//   console.log("selectedRowKeys", selectedRowKeys);
//   const navigate = useNavigate();

//   useEffect(() => {
//     dispatch(getUserCart());
//   }, [dispatch]);

//   const userCart = useSelector((state) => state?.cart?.userCart?.cartItems);
//   console.log("uc", userCart);

//   const defaultAddress = useSelector((state) => state?.address?.data);
//   const defaultAddressData = defaultAddress?.find(
//     (addr) => addr.defaultAddress
//   );
//   console.log("ua", defaultAddress);
//   console.log("uad", defaultAddressData);

//   const columns = [
//     {
//       title: "Tên sản phẩm",
//       dataIndex: "productName",
//       key: "productName",
//     },
//     {
//       title: "Đơn giá",
//       dataIndex: "price",
//       key: "price",
//       render: (_, record) =>
//         `${(record.totalPrice / record.quantity).toLocaleString()}₫`,
//     },
//     {
//       title: "Số lượng",
//       dataIndex: "quantity",
//       key: "quantity",
//       render: (quantity) => <span>{quantity}</span>,
//     },
//     {
//       title: "Số tiền",
//       key: "totalPrice",
//       dataIndex: "totalPrice",
//       render: (_, record) => `${record.totalPrice?.toLocaleString() || "0"}₫`,
//     },
//   ];

//   const selectedData = userCart?.filter((item) =>
//     selectedRowKeys.includes(item.cartItemId)
//   );

//   const totalSelectedPrice =
//     userCart
//       ?.filter((item) => selectedRowKeys.includes(item.cartItemId))
//       .reduce((total, item) => total + (item.totalPrice || 0), 0) || 0;

//   const handleAddressChange = () => {
//     setIsModalOpen(true); // Mở modal
//   };

//   const handleAddressSelect = () => {
//     const newDefaultAddress = defaultAddress?.find(
//       (addr) => addr.id === selectedAddressId
//     );
//     if (newDefaultAddress) {
//       toast.success("Chọn địa chỉ thành công!");
//     } else {
//       toast.error("Chọn địa chỉ thất bại!");
//     }
//     setIsModalOpen(false); // Đóng modal
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-bold mb-4">Thanh toán</h1>
//       <div className="mb-4">
//         <h2 className="font-semibold mb-2">Địa chỉ nhận hàng</h2>
//         {defaultAddressData ? (
//           <div className="p-4 border border-gray-200 rounded-md shadow-sm">
//             <p className="mb-2">
//               <strong>Họ và tên:</strong> {defaultAddressData.fullName}
//             </p>
//             <p className="mb-2">
//               <strong>Số điện thoại:</strong> {defaultAddressData.phoneNumber}
//             </p>
//             <p className="mb-2">
//               <strong>Địa chỉ:</strong> {defaultAddressData.address},{" "}
//               {defaultAddressData.commune}, {defaultAddressData.district},{" "}
//               {defaultAddressData.province}
//               {defaultAddressData.defaultAddress && (
//                 <p className="border mt-2 p-1 w-fit border-red-500 text-red-500 font-semibold">
//                   Mặc định
//                 </p>
//               )}
//             </p>
//             <div className="flex justify-end">
//               <Button onClick={handleAddressChange}>Thay đổi</Button>
//             </div>
//           </div>
//         ) : (
//           <p>Không có địa chỉ mặc định. Vui lòng cập nhật địa chỉ.</p>
//         )}
//       </div>

//       <div>
//         <h2 className="font-semibold mb-2">Sản phẩm</h2>
//         <Table
//           columns={columns}
//           dataSource={selectedData}
//           rowKey="cartItemId"
//           pagination={false}
//           className="shadow-md border border-gray-200 rounded-lg"
//         />
//         <div className="mt-4 flex justify-between items-center">
//           <div className="text-lg font-semibold">
//             Tổng tiền hàng:{" "}
//             <span className="text-red-600">
//               ₫{totalSelectedPrice.toLocaleString()}
//             </span>
//           </div>
//           <div>
//             <Button
//               type="primary"
//               size="large"
//               onClick={() => navigate("/checkout")}
//             >
//               Thanh toán
//             </Button>
//           </div>
//         </div>
//       </div>
//       {/* Modal để chọn địa chỉ */}
//       <Modal
//         title="Chọn địa chỉ giao hàng"
//         open={isModalOpen}
//         onOk={handleAddressSelect}
//         onCancel={() => setIsModalOpen(false)}
//         okText="Xác nhận"
//         cancelText="Hủy"
//       >
//         <Radio.Group
//           onChange={(e) => setSelectedAddressId(e.target.value)}
//           value={selectedAddressId}
//           style={{ width: "100%" }}
//         >
//           {defaultAddress?.map((addr) => (
//             <Radio
//               key={addr.id}
//               value={addr.id}
//               style={{ display: "block", marginBottom: "10px" }}
//             >
//               <div>
//                 <strong>{addr.fullName}</strong>
//                 <p>{addr.phoneNumber}</p>
//                 <p>
//                   {addr.address}, {addr.commune}, {addr.district},{" "}
//                   {addr.province}
//                 </p>
//               </div>
//             </Radio>
//           ))}
//         </Radio.Group>
//       </Modal>
//     </div>
//   );
// };

// export default UserOrder;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Checkbox, Button, Modal, Radio, Tag, Select } from "antd";
import { toast } from "react-toastify"; // Thêm toastify
import { getUserCart } from "./../../services/cartService";
import { useLocation, useNavigate } from "react-router-dom";
import { getAddress } from "../../services/addressService";
import Cookies from "js-cookie";
import { createOrder } from "../../services/orderService";

const UserOrder = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const userAddress = useSelector((state) => state?.address?.data);
  const defaultAddressData = userAddress?.find((addr) => addr.defaultAddress);
  const [address, setAddress] = useState(
    defaultAddressData ? defaultAddressData : null
  );

  const [paymentMethod, setPaymentMethod] = useState("COD");

  console.log(paymentMethod);

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

  useEffect(() => {}, [dispatch, address]);

  let { selectedRowKeys = [] } = location.state;
  const userCart = useSelector((state) => state?.cart?.userCart?.cartItems);

  console.log(1, userAddress);
  console.log(2, address);

  useEffect(() => {
    dispatch(getUserCart());
  }, [dispatch]);

  const handleAddressChange = () => {
    setSelectedAddressId(address?.addressId || null);
    setIsModalOpen(true); // Mở modal
  };

  const handleAddressSelect = () => {
    const newDefaultAddress = userAddress?.find(
      (addr) => addr.addressId === selectedAddressId
    );
    if (newDefaultAddress) {
      setAddress(newDefaultAddress);
      toast.success("Chọn địa chỉ thành công!");
    } else {
      toast.error("Chọn địa chỉ thất bại!");
    }
    setIsModalOpen(false); // Đóng modal
  };

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (_, record) =>
        `${(record.totalPrice / record.quantity).toLocaleString()}₫`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => <span>{quantity}</span>,
    },
    {
      title: "Số tiền",
      key: "totalPrice",
      dataIndex: "totalPrice",
      render: (_, record) => `${record.totalPrice?.toLocaleString() || "0"}₫`,
    },
  ];

  const selectedData = userCart?.filter((item) =>
    selectedRowKeys.includes(item.cartItemId)
  );

  console.log(555, selectedData);

  const totalSelectedPrice =
    userCart
      ?.filter((item) => selectedRowKeys.includes(item.cartItemId))
      .reduce((total, item) => total + (item.totalPrice || 0), 0) || 0;

  console.log(666, address?.addressId);
  console.log(777, selectedAddressId);

  const handleCheckout = async (address, selectedData, paymentMethod) => {
    console.log("ad", address, selectedData);
    try {
      const resultAction = await dispatch(
        createOrder({
          address: address, // Địa chỉ đã chọn
          selectedData: selectedData,
          paymentMethod: paymentMethod, // Danh sách sản phẩm đã chọn
        })
      ).unwrap();

      console.log("ra", resultAction);
      toast.success("Đặt hàng thành công!");

      if (paymentMethod === "COD") {
        navigate(`/orders/${resultAction.orderId}`);
      } else if (paymentMethod === "BANKING" && resultAction.url) {
        window.location.href = resultAction.url;
      } else {
        toast.error("Không thể xử lý phương thức thanh toán.");
      }
    } catch (error) {
      toast.error(error || "Có lỗi xảy ra khi đặt hàng.");
    }
  };

  // Lấy trạng thái từ Redux Store

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Thanh toán</h1>
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Địa chỉ nhận hàng</h2>
        {address ? (
          <div className="p-4 border border-gray-200 rounded-md shadow-sm">
            <p className="mb-2">
              <strong>Họ và tên:</strong> {address.fullName}
            </p>
            <p className="mb-2">
              <strong>Số điện thoại:</strong> {address.phoneNumber}
            </p>
            <p className="mb-2">
              <strong>Địa chỉ:</strong> {address.address}, {address.commune},{" "}
              {address.district}, {address.province}
              {address.defaultAddress && (
                <p className="border mt-2 p-1 w-fit border-red-500 text-red-500 font-semibold">
                  Mặc định
                </p>
              )}
            </p>
            <div className="flex justify-end">
              <Button onClick={handleAddressChange}>Thay đổi</Button>
            </div>
          </div>
        ) : (
          <p>Không có địa chỉ mặc định. Vui lòng cập nhật địa chỉ.</p>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Sản phẩm</h2>
        <Table
          columns={columns}
          dataSource={selectedData}
          rowKey="cartItemId"
          pagination={false}
          className="shadow-md border border-gray-200 rounded-lg"
        />
        <div className="mt-4">
          <h3 className="mb-2">Chọn phương thức thanh toán:</h3>
          <Select
            defaultValue="COD"
            className="w-1/3"
            onChange={(value) => setPaymentMethod(value)}
          >
            <Select.Option value="COD">
              Thanh toán khi nhận hàng (COD)
            </Select.Option>
            <Select.Option value="BANKING">
              Chuyển khoản ngân hàng
            </Select.Option>
          </Select>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-lg font-semibold">
            Tổng tiền hàng:{" "}
            <span className="text-red-600">
              ₫{totalSelectedPrice.toLocaleString()}
            </span>
          </div>
          <div>
            <Button
              type="primary"
              size="large"
              onClick={() =>
                handleCheckout(address, selectedData, paymentMethod)
              }
            >
              Thanh toán
            </Button>
          </div>
        </div>
      </div>

      {/* Modal để chọn địa chỉ */}
      <Modal
        title="Chọn địa chỉ giao hàng"
        open={isModalOpen}
        onOk={handleAddressSelect}
        onCancel={() => setIsModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Radio.Group
          onChange={(e) => setSelectedAddressId(e.target.value)}
          value={selectedAddressId} // Đồng bộ giá trị được chọn với state
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
                    <Tag className="ml-2">Mặc định</Tag>
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
