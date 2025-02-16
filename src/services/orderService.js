import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async ({ address, selectedData, paymentMethod }, { rejectWithValue }) => {
    const token = Cookies.get("token");

    console.log("service", address, selectedData, paymentMethod);

    if (!token) {
      return rejectWithValue("Bạn cần đăng nhập để thanh toán.");
    }

    if (!address || !selectedData || selectedData.length === 0) {
      return rejectWithValue("Vui lòng chọn địa chỉ và sản phẩm.");
    }

    const orderData = {
      addressId: address.addressId,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      address: address.address,
      province: address.province,
      district: address.district,
      commune: address.commune,
      addressState: address.defaultAddress,
      cartItems: selectedData.map((item) => item.cartItemId),
      orderMethod: paymentMethod, // Giá trị mặc định
      bankCode: "VCB", // Giá trị mặc định
      language: "vi", // Ngôn ngữ mặc định
    };

    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Token xác thực
        "Content-Type": "application/json", // Định dạng JSON
      },
    };

    try {
      const res = await BASE_URL.post("api/v1/orders", orderData, config);
      return res.data; // Trả về dữ liệu sau khi đặt hàng thành công
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message); // Trả lỗi
    }
  }
);

export const getOrder = createAsyncThunk("orders/getOrder", async (orderId) => {
  const token = Cookies.get("token");
  console.log("orderId", orderId);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`, // Token xác thực
      "Content-Type": "application/json", // Định dạng JSON
    },
  };

  try {
    const res = await BASE_URL.get(`api/v1/orders/${orderId}`, config);
    return res.data; // Trả về dữ liệu sau khi đặt hàng thành công
  } catch (error) {
    console.log(error);
  }
});
