import { createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import BASE_URL from "../api";

const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const getTotalProductsSold = createAsyncThunk(
  "statistics/getTotalProductsSold",
  async ({ startDate, endDate }) => {
    const res = await BASE_URL.get("api/super-admin/statistics/total-products-sold", {
      params: { startDate, endDate },
      ...getAuthHeaders(),
    });
    return res.data;
  }
);

export const getTotalRevenue = createAsyncThunk(
  "statistics/getTotalRevenue",
  async ({ startDate, endDate }) => {
    const res = await BASE_URL.get("api/super-admin/statistics/total-revenue", {
      params: { startDate, endDate },
      ...getAuthHeaders(),
    });
    return res.data;
  }
);

export const getTotalCustomers = createAsyncThunk(
  "statistics/getTotalCustomers",
  async () => {
    const res = await BASE_URL.get("api/super-admin/statistics/total-customers", getAuthHeaders());
    return res.data;
  }
);

export const getNewCustomersThisMonth = createAsyncThunk(
  "statistics/getNewCustomersThisMonth",
  async () => {
    const res = await BASE_URL.get("api/super-admin/statistics/new-customers-this-month", getAuthHeaders());
    return res.data;
  }
);

export const getTotalOrdersPlaced = createAsyncThunk(
  "statistics/getTotalOrdersPlaced",
  async ({ startDate, endDate }) => {
    const res = await BASE_URL.get("api/super-admin/statistics/total-orders-placed", {
      params: { startDate, endDate },
      ...getAuthHeaders(),
    });
    return res.data;
  }
);

export const getAverageOrderValue = createAsyncThunk(
  "statistics/getAverageOrderValue",
  async ({ startDate, endDate }) => {
    const res = await BASE_URL.get("api/super-admin/statistics/average-order-value", {
      params: { startDate, endDate },
      ...getAuthHeaders(),
    });
    return res.data;
  }
);

export const getOrderStatusCounts = createAsyncThunk(
  "statistics/getOrderStatusCounts",
  async () => {
    const res = await BASE_URL.get("api/super-admin/statistics/order-status-counts", getAuthHeaders());
    return res.data;
  }
);

export const getStatistics = createAsyncThunk(
    "statistics/getStatistics",
    async ({ startDate, endDate }) => {
      const res = await BASE_URL.get("api/super-admin/statistics/statistics", {
        params: { startDate, endDate },
        ...getAuthHeaders(),
      });
      return res.data;
    }
  );
