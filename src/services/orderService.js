import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const searchOrders = createAsyncThunk(
  "order/searchOrders",
  async (params) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        status: params.status || null,
        minPrice: params.minPrice || null,
        maxPrice: params.maxPrice || null,
        keyword: params.keyword || null,
        createdAfter: params.createdAfter || null,
        createdBefore: params.createdBefore || null,
        page: params.page || 0,
        size: params.size || 10,
      },
    };

    try {
      const res = await BASE_URL.get("api/v1/admin/orders/search", config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async (data) => {
    const token = Cookies.get("token");
    const userId = localStorage.getItem("userId");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        orderId: data.orderId,
        userId: userId,
        secretToken: data.secretToken
      },
    };

    try {
      const res = await BASE_URL.get(
        `api/v1/orders/update-status`,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const userOrder = createAsyncThunk(
  "order/userOrder",
  async () => {
    const token = Cookies.get("token");
    const userId = localStorage.getItem("userId");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userId: userId,
      },
    };

    try {
      const res = await BASE_URL.get(
        `api/v1/orders/user-orders`,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, status }) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        status: status,
      },
    };

    try {
      const res = await BASE_URL.put(
        `api/v1/admin/orders/${orderId}/status`,
        {},
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "order/deleteOrder",
  async (orderId) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.delete(
        `api/v1/admin/orders/${orderId}`,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getOrderDetail = createAsyncThunk(
  "order/getOrderDetail",
  async (orderId) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.get(
        `api/v1/orders/orderDetail/${orderId}`,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);


export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async ({ address, selectedData, paymentMethod }, { rejectWithValue }) => {
    const token = Cookies.get("token");
    const userId = localStorage.getItem("userId");

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
      orderMethod: paymentMethod,
      bankCode: "VCB",
      language: "vi",
      userId: userId
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
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await BASE_URL.get(`api/v1/orders/${orderId}`, config);
    return res.data;
  } catch (error) {
  }
});
