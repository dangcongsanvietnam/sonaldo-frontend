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
      console.error("Lỗi khi tìm kiếm đơn hàng:", error);
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
      const res = await BASE_URL.put(`api/v1/admin/orders/${orderId}/status`, {}, config);
      return res.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
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
      const res = await BASE_URL.delete(`api/v1/admin/orders/${orderId}`, config);
      return res.data;
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", error);
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
      const res = await BASE_URL.get(`api/v1/orders/orderDetail/${orderId}`, config);
      return res.data;
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      throw error;
    }
  }
);