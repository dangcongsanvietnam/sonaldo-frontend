// // import React, { useEffect, useState } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { Table, InputNumber, Button, Popconfirm } from "antd";
// // import {
// //   getUserCart,
// //   updateQuantityCartItem,
// //   // removeCartItem,
// //   removeCartItem,
// //   removeAllCartItem,
// // } from "../../../services/cartService";
// // import { ToastContainer, toast } from "react-toastify";

// // const UserOrder = () => {
// //   const dispatch = useDispatch();
// //   const [cartQuantity, setCartQuantity] = useState([]); // Khởi tạo state cho số lượng sản phẩm
// //   // Lấy dữ liệu giỏ hàng khi component được render
// //   useEffect(() => {
// //     dispatch(getUserCart());
// //   }, [dispatch]);

// //   const userCart = useSelector((state) => state?.cart?.userCart?.cartItems);
// //   const userCart2 = useSelector((state) => state?.cart?.userCart);
// //   console.log("uc", userCart2);

// //   // Cập nhật cartQuantity khi userCart thay đổi
// //   useEffect(() => {
// //     if (userCart) {
// //       setCartQuantity(
// //         userCart.map((item) => ({
// //           cartItemId: item.cartItemId,
// //           quantity: item.quantity,
// //           totalPrice: item.totalPrice,
// //         }))
// //       );
// //     }
// //   }, [userCart]);

// //   // Hàm xử lý khi thay đổi số lượng
// //   const handleQuantityChange = (item, newQuantity) => {
// //     // Cập nhật state cục bộ
// //     setCartQuantity((prevCart) =>
// //       prevCart?.map((cartItem) =>
// //         cartItem?.cartItemId === item.cartItemId
// //           ? {
// //               ...cartItem,
// //               quantity: newQuantity,
// //               totalPrice: newQuantity * (item.totalPrice / item.quantity),
// //             }
// //           : cartItem
// //       )
// //     );

// //     // Gửi yêu cầu cập nhật số lượng lên backend
// //     if (newQuantity > 0) {
// //       dispatch(
// //         updateQuantityCartItem({
// //           cartItemId: item?.cartItemId,
// //           quantity: newQuantity,
// //         })
// //       );
// //     } else {
// //       // Xử lý nếu số lượng bằng 0 (tùy chọn)
// //       dispatch(
// //         updateQuantityCartItem({
// //           cartItemId: item?.cartItemId,
// //           quantity: 0,
// //         })
// //       );
// //     }
// //   };

// //   // Hàm xử lý khi xóa sản phẩm
// //   const handleRemoveAll = (cartItemId) => {
// //     dispatch(removeAllCartItem())
// //       .unwrap()
// //       .then((res) => {
// //         dispatch(getUserCart()).then(() => {
// //           toast.success("Sản phẩm đã được xóa toàn bộ!");
// //         });
// //       })
// //       .catch((err) => {
// //         toast.error("Đã xảy ra lỗi khi xóa sản phẩm!");
// //       });
// //   };

// //   const handleDeleteCartItem = (cartItemId) => {
// //     dispatch(removeCartItem(cartItemId))
// //       .unwrap()
// //       .then((res) => {
// //         dispatch(getUserCart()).then(() => {
// //           toast.success("Sản phẩm đã được xóa thành công!");
// //         });
// //       })
// //       .catch((err) => {
// //         toast.error("Đã xảy ra lỗi khi xóa sản phẩm!");
// //       });
// //   };

// //   // Cấu hình các cột trong bảng
// //   const columns = [
// //     {
// //       title: "Tên sản phẩm",
// //       dataIndex: "productName",
// //       key: "productName",
// //     },
// //     {
// //       title: "Đơn giá",
// //       dataIndex: "price",
// //       key: "price",
// //       render: (_, record) =>
// //         `${(record.totalPrice / record.quantity).toLocaleString()}₫`,
// //     },

// //     {
// //       title: "Số lượng",
// //       dataIndex: "quantity",
// //       key: "quantity",
// //       render: (quantity, record) => (
// //         <InputNumber
// //           min={0}
// //           value={
// //             cartQuantity.find(
// //               (cartItem) => cartItem.cartItemId === record.cartItemId
// //             )?.quantity
// //           }
// //           onChange={(value) => handleQuantityChange(record, value)}
// //           className="w-20"
// //         />
// //       ),
// //     },
// //     {
// //       title: "Số tiền",
// //       key: "totalPrice",
// //       dataIndex: "totalPrice",
// //       render: (_, record) => {
// //         const cartItem = cartQuantity.find(
// //           (cartItem) => cartItem?.cartItemId === record.cartItemId
// //         );

// //         console.log("tt", cartItem);

// //         return cartItem ? `${cartItem.totalPrice.toLocaleString()}₫` : "0₫";
// //       },
// //     },
// //     {
// //       title: "Thao tác",
// //       key: "action",
// //       render: (_, record) => (
// //         <Popconfirm
// //           title="Bạn có chắc muốn xóa sản phẩm này?"
// //           onConfirm={() => handleDeleteCartItem(record.cartItemId)}
// //           okText="Có"
// //           cancelText="Không"
// //         >
// //           <Button danger>Xóa</Button>
// //         </Popconfirm>
// //       ),
// //     },
// //   ];

// //   return (
// //     <div className="p-4">
// //       <ToastContainer />
// //       <h1 className="text-xl font-bold mb-4">Đơn hàng của bạn</h1>
// //       <Table
// //         columns={columns}
// //         dataSource={userCart}
// //         rowKey="cartItemId"
// //         pagination={false}
// //         className="shadow-md border border-gray-200 rounded-lg"
// //       />
// //       <div className="pt-2">
// //         <Button onClick={() => handleRemoveAll()}>Xoá toàn bộ sản phẩm</Button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default UserOrder;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Table, InputNumber, Button, Popconfirm, Modal } from "antd";
// import {
//   getUserCart,
//   updateQuantityCartItem,
//   removeCartItem,
//   removeAllCartItem,
// } from "../../../services/cartService";
// import { ToastContainer, toast } from "react-toastify";

// const UserOrder = () => {
//   const dispatch = useDispatch();
//   const [cartQuantity, setCartQuantity] = useState([]); // Khởi tạo state cho số lượng sản phẩm
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [currentItem, setCurrentItem] = useState(null);
//   const notify = () => toast("Wow so easy!");

//   useEffect(() => {
//     dispatch(getUserCart());
//   }, [dispatch]);

//   const userCart = useSelector((state) => state?.cart?.userCart?.cartItems);

//   useEffect(() => {
//     if (userCart) {
//       setCartQuantity(
//         userCart.map((item) => ({
//           cartItemId: item.cartItemId,
//           quantity: item.quantity,
//           totalPrice: item.totalPrice,
//         }))
//       );
//     }
//   }, [userCart]);

//   const handleQuantityChange = (item, newQuantity) => {
//     setCartQuantity((prevCart) =>
//       prevCart?.map((cartItem) =>
//         cartItem?.cartItemId === item.cartItemId
//           ? {
//               ...cartItem,
//               quantity: newQuantity,
//               totalPrice: newQuantity * (item.totalPrice / item.quantity),
//             }
//           : cartItem
//       )
//     );

//     if (newQuantity > 0) {
//       dispatch(
//         updateQuantityCartItem({
//           cartItemId: item?.cartItemId,
//           quantity: newQuantity,
//         })
//       );
//     } else {
//       setCurrentItem(item);
//       setIsModalVisible(true);
//       return;
//     }
//   };

//   const handleRemoveAll = () => {
//     dispatch(removeAllCartItem())
//       .unwrap()
//       .then((res) => {
//         dispatch(getUserCart()).then(() => {
//           toast.success("Sản phẩm đã được xóa toàn bộ!");
//         });
//       })
//       .catch((err) => {
//         toast.error("Đã xảy ra lỗi khi xóa sản phẩm!");
//       });
//   };

//   const handleDeleteCartItem = (cartItemId) => {
//     dispatch(removeCartItem(cartItemId))
//       .unwrap()
//       .then((res) => {
//         dispatch(getUserCart()).then(() => {
//           toast.success("Sản phẩm đã được xóa thành công!");
//         });
//       })
//       .catch((err) => {
//         toast.error("Đã xảy ra lỗi khi xóa sản phẩm!");
//       });
//   };

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
//       render: (quantity, record) => (
//         <InputNumber
//           min={0}
//           value={
//             cartQuantity.find(
//               (cartItem) => cartItem.cartItemId === record.cartItemId
//             )?.quantity
//           }
//           onChange={(value) => handleQuantityChange(record, value)}
//           className="w-20"
//         />
//       ),
//     },
//     {
//       title: "Số tiền",
//       key: "totalPrice",
//       dataIndex: "totalPrice",
//       render: (_, record) => {
//         const cartItem = cartQuantity.find(
//           (cartItem) => cartItem?.cartItemId === record.cartItemId
//         );

//         return cartItem ? `${cartItem.totalPrice.toLocaleString()}₫` : "0₫";
//       },
//     },
//     {
//       title: "Thao tác",
//       key: "action",
//       render: (_, record) => (
//         <Popconfirm
//           title="Bạn có chắc muốn xóa sản phẩm này?"
//           onConfirm={() => handleDeleteCartItem(record.cartItemId)}
//           okText="Có"
//           cancelText="Không"
//         >
//           <Button danger>Xóa</Button>
//         </Popconfirm>
//       ),
//     },
//   ];

//   const rowSelection = {
//     onChange: (selectedRowKeys, selectedRows) => {
//       console.log("Hàng được chọn: ", selectedRows);
//       toast.info(
//         `Bạn đã chọn ${selectedRows.length} sản phẩm: ${selectedRows
//           .map((row) => row.productName)
//           .join(", ")}`
//       );
//     },
//   };

//   const handleConfirmDelete = () => {
//     if (currentItem) {
//       handleDeleteCartItem(currentItem.cartItemId);
//       setIsModalVisible(false);
//       setCurrentItem(null);
//     }
//   };

//   return (
//     <div className="p-4">
//       <ToastContainer />
//       <h1 className="text-xl font-bold mb-4">Đơn hàng của bạn</h1>
//       <Table
//         rowSelection={rowSelection} // Thêm rowSelection
//         columns={columns}
//         dataSource={userCart}
//         rowKey="cartItemId"
//         pagination={false}
//         className="shadow-md border border-gray-200 rounded-lg"
//       />
//       <div className="pt-2">
//         <Button onClick={() => handleRemoveAll()}>Xoá toàn bộ sản phẩm</Button>
//       </div>
//       <Modal
//         title="Xóa sản phẩm"
//         open={isModalVisible}
//         onOk={handleConfirmDelete}
//         onCancel={() => {
//           setIsModalVisible(false);
//           dispatch(getUserCart());
//         }}
//         okText="Xóa"
//         cancelText="Hủy"
//       >
//         <p>Bạn có chắc muốn xóa sản phẩm này không?</p>
//       </Modal>
//     </div>
//   );
// };

// export default UserOrder;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, InputNumber, Button, Popconfirm, Modal, Checkbox } from "antd";
import {
  getUserCart,
  updateQuantityCartItem,
  removeCartItem,
  removeAllCartItem,
} from "../../../services/cartService";
import { ToastContainer, toast } from "react-toastify";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";

const UserOrder = () => {
  const dispatch = useDispatch();
  const [cartQuantity, setCartQuantity] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false); // State cho modal cảnh báo

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUserCart());
  }, [dispatch]);

  const userCart = useSelector((state) => state?.cart?.userCart?.cartItems);

  useEffect(() => {
    if (userCart) {
      setCartQuantity(
        userCart.map((item) => ({
          cartItemId: item.cartItemId,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        }))
      );
    }
  }, [userCart]);

  // const handleQuantityChange = (item, newQuantity) => {
  //   setCartQuantity((prevCart) =>
  //     prevCart?.map((cartItem) =>
  //       cartItem?.cartItemId === item.cartItemId
  //         ? {
  //             ...cartItem,
  //             quantity: newQuantity,
  //             totalPrice: newQuantity * (item.totalPrice / item.quantity),
  //           }
  //         : cartItem
  //     )
  //   );

  //   if (newQuantity > 0) {
  //     dispatch(
  //       updateQuantityCartItem({
  //         cartItemId: item?.cartItemId,
  //         quantity: newQuantity,
  //       })
  //     )
  //       .unwrap()
  //       .then((res) => dispatch(getUserCart()));
  //   } else {
  //     setCurrentItem(item);
  //     setIsModalVisible(true);
  //     return;
  //   }
  // };

  const handleQuantityChange = debounce((item, newQuantity) => {
    setIsProcessing(true); // Disable interaction while processing
    setCartQuantity((prevCart) =>
      prevCart?.map((cartItem) =>
        cartItem?.cartItemId === item.cartItemId
          ? {
              ...cartItem,
              quantity: newQuantity,
              totalPrice: newQuantity * (item.totalPrice / item.quantity),
            }
          : cartItem
      )
    );

    if (newQuantity > 0) {
      dispatch(
        updateQuantityCartItem({
          cartItemId: item?.cartItemId,
          quantity: newQuantity,
        })
      )
        .unwrap()
        .then((res) => {
          setIsProcessing(false); // Re-enable interaction after request finishes
          dispatch(getUserCart()); // Refresh cart data
        })
        .catch(() => {
          setIsProcessing(false);
          toast.error("Đã xảy ra lỗi khi cập nhật số lượng!");
        });
    } else {
      setCurrentItem(item);
      setIsModalVisible(true);
    }
  }, 800); // Debounce time in milliseconds (500ms)

  const handleRemoveAll = () => {
    dispatch(removeAllCartItem())
      .unwrap()
      .then(() => {
        dispatch(getUserCart()).then(() => {
          toast.success("Sản phẩm đã được xóa toàn bộ!");
        });
      })
      .catch(() => {
        toast.error("Đã xảy ra lỗi khi xóa sản phẩm!");
      });
  };

  const handleDeleteCartItem = (cartItemId) => {
    dispatch(removeCartItem(cartItemId))
      .unwrap()
      .then(() => {
        dispatch(getUserCart()).then(() => {
          toast.success("Sản phẩm đã được xóa thành công!");
        });
      })
      .catch(() => {
        toast.error("Đã xảy ra lỗi khi xóa sản phẩm!");
      });
  };

  console.log("srk", selectedRowKeys);

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
      render: (quantity, record) => (
        <InputNumber
          disabled={isProcessing}
          min={0}
          value={
            cartQuantity.find(
              (cartItem) => cartItem.cartItemId === record.cartItemId
            )?.quantity
          }
          onChange={(value) => handleQuantityChange(record, value)}
          className="w-20"
        />
      ),
    },
    {
      title: "Số tiền",
      key: "totalPrice",
      dataIndex: "totalPrice",
      render: (_, record) => {
        const cartItem = cartQuantity.find(
          (cartItem) => cartItem?.cartItemId === record.cartItemId
        );

        return cartItem ? `${cartItem.totalPrice.toLocaleString()}₫` : "0₫";
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc muốn xóa sản phẩm này?"
          onConfirm={() => handleDeleteCartItem(record.cartItemId)}
          okText="Có"
          cancelText="Không"
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  const handleConfirmDelete = () => {
    if (currentItem) {
      handleDeleteCartItem(currentItem.cartItemId);
      setIsModalVisible(false);
      setCurrentItem(null);
    }
  };

  const totalSelectedPrice =
    userCart
      ?.filter((item) => selectedRowKeys.includes(item.cartItemId))
      .reduce((total, item) => total + (item.totalPrice || 0), 0) || 0;

  const totalItems = selectedRowKeys.length;

  const handleCheckout = () => {
    if (selectedRowKeys.length === 0) {
      setWarningModalVisible(true); // Hiển thị modal nếu chưa chọn sản phẩm
    } else {
      navigate("/checkout", { state: { selectedRowKeys } });
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold mb-4">Giỏ hàng của bạn</h1>
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        columns={columns}
        dataSource={userCart}
        rowKey="cartItemId"
        pagination={false}
        className="shadow-md border border-gray-200 rounded-lg"
      />
      {/* Thanh cố định */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Checkbox
            onChange={(e) =>
              setSelectedRowKeys(
                e.target.checked ? userCart.map((item) => item.cartItemId) : []
              )
            }
            checked={selectedRowKeys.length === userCart?.length}
          >
            Chọn tất cả
          </Checkbox>
          <Button danger onClick={handleRemoveAll}>
            Xóa toàn bộ sản phẩm
          </Button>
        </div>
        <div className="text-lg font-semibold">
          Tổng thanh toán ({totalItems}) sản phẩm:{" "}
          <span className="text-red-600">
            ₫{totalSelectedPrice.toLocaleString()}
          </span>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={
            // () => navigate("/checkout", { state: { selectedRowKeys } })
            handleCheckout
          }
        >
          Mua hàng
        </Button>
      </div>

      <Modal
        title="Xóa sản phẩm"
        open={isModalVisible}
        onOk={handleConfirmDelete}
        onCancel={async () => {
          setIsModalVisible(false);
          await dispatch(getUserCart());
          setIsProcessing(false);
        }}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc muốn xóa sản phẩm này không?</p>
      </Modal>

      <Modal
        title={null}
        open={warningModalVisible}
        footer={[
          <Button
            type="primary"
            key="ok"
            onClick={() => setWarningModalVisible(false)}
            className="w-full"
          >
            OK
          </Button>,
        ]}
      >
        <p className="pb-10">Bạn vẫn chưa chọn sản phẩm nào để mua!</p>
      </Modal>
    </div>
  );
};

export default UserOrder;
