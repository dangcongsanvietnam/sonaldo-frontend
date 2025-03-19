import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, InputNumber, Button, Popconfirm, Modal, Checkbox } from "antd";
import {
  getUserCart,
  updateQuantityCartItem,
  removeCartItem,
  removeAllCartItem,
} from "../../../services/cartService";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import { useNavigate, useOutletContext } from "react-router-dom";

const UserOrder = () => {
  const dispatch = useDispatch();
  const [cartQuantity, setCartQuantity] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const { vnMode } = useOutletContext();

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

  const handleQuantityChange = debounce((item, newQuantity) => {
    if (newQuantity > item.productQuantity) {
      toast.warn(vnMode ? "Số lượng mới không thể nhiều hơn số lượng sản phẩm" : "New quantity cannot larger than product's quantity");
      return;
    }
    setIsProcessing(true);
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
        .then(() => {
          setIsProcessing(false);
          dispatch(getUserCart());
        })
        .catch(() => {
          setIsProcessing(false);
          toast.error(vnMode ? "Đã xảy ra lỗi khi cập nhật số lượng!" : "Failed while updating quantity");
        });
    } else {
      setCurrentItem(item);
      setIsModalVisible(true);
    }
  }, 1000);

  const handleRemoveAll = () => {
    dispatch(removeAllCartItem())
      .unwrap()
      .then(() => {
        dispatch(getUserCart()).then(() => {
        });
      })
      .catch(() => {
        toast.error(vnMode ? "Đã xảy ra lỗi khi xóa sản phẩm!" : "Failed while deleting all products");
      });
  };

  const handleDeleteCartItem = (cartItemId) => {
    dispatch(removeCartItem(cartItemId))
      .unwrap()
      .then(() => {
        dispatch(getUserCart()).then(() => {
        });
      })
      .catch(() => {
        toast.error(vnMode ? "Đã xảy ra lỗi khi xóa sản phẩm!" : "Failed while deleting a product");
      });
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
      render: (_, record) =>
        `${(record.totalPrice / record.quantity).toLocaleString()}₫`,
    },
    {
      title: vnMode ? "Số lượng" : "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <InputNumber
          disabled={isProcessing}
          min={0}
          max={record.productQuantity}
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
      title: vnMode ? "Tổng số tiền" : "Total Price",
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
      title: vnMode ? "Thao tác" : "Actions",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title={vnMode ? "Bạn có chắc muốn xóa sản phẩm này?" : "Are you sure want to delete this product"}
          onConfirm={() => handleDeleteCartItem(record.cartItemId)}
          okText={vnMode ? "Có" : "Yes"}
          cancelText={vnMode ? "Không" : "No"}
        >
          <Button danger>{vnMode ? "Xóa" : "Delete"}</Button>
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
      setWarningModalVisible(true);
    } else {
      navigate("/checkout", { state: { selectedRowKeys } });
    }
  };

  return (
    <div className="relative h-full">
      <div className="font-bold text-xl md:text-2xl mb-3 md:mb-5">{vnMode ? "Giỏ hàng" : "Cart"}</div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[700px] md:min-w-full">
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
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md flex flex-col md:flex-row items-center md:justify-between p-3 md:p-4 space-y-2 md:space-y-0"
        style={{ zIndex: "9000" }}
      >
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 w-full">
          <Checkbox
            onChange={(e) =>
              setSelectedRowKeys(
                e.target.checked ? userCart.map((item) => item.cartItemId) : []
              )
            }
            checked={selectedRowKeys.length === userCart?.length}
          >
            {vnMode ? "Chọn tất cả" : "Select All"}
          </Checkbox>
          <Button danger className="text-sm md:text-base w-full md:w-auto" onClick={handleRemoveAll}>
            {vnMode ? "Xóa toàn bộ" : "Delete All"}
          </Button>
        </div>

        <div className="text-sm md:text-lg font-semibold text-center">
          {vnMode ? "Tổng thanh toán" : "Total Bill"} ({totalItems}) {vnMode ? "sản phẩm:" : "products:"}{" "}
          <span className="text-red-600">vn₫{totalSelectedPrice.toLocaleString()}</span>
        </div>

        <Button
          type="primary"
          size="large"
          className="w-full md:w-auto"
          onClick={handleCheckout}
        >
          {vnMode ? "Mua hàng" : "Checkout"}
        </Button>
      </div>

      <Modal
        title={vnMode ? "Xóa sản phẩm" : "Delete product"}
        open={isModalVisible}
        onOk={handleConfirmDelete}
        onCancel={async () => {
          setIsModalVisible(false);
          await dispatch(getUserCart());
          setIsProcessing(false);
        }}
        okText={vnMode ? "Xóa" : "Delete"}
        cancelText={vnMode ? "Hủy" : "Cancel"}
      >
        <p>{vnMode ? "Bạn có chắc muốn xóa sản phẩm này không?" : "Are you sure want to delete this product"}</p>
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
        <p className="pb-10">{vnMode ? "Bạn vẫn chưa chọn sản phẩm nào để mua!" : "You didn't choose any product yet!"}</p>
      </Modal>
    </div>

  );
};

export default UserOrder;
