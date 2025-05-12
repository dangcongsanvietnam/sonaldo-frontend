import { createSlice } from "@reduxjs/toolkit";
import {
  getTotalProductsSold,
  getTotalRevenue,
  getTotalCustomers,
  getNewCustomersThisMonth,
  getTotalOrdersPlaced,
  getAverageOrderValue,
  getOrderStatusCounts,
  getStatistics,
} from "../services/statisticService";

const statisticSlice = createSlice({
  name: "statistics",
  initialState: {
    loading: "idle",
    totalProductsSold: null,
    totalRevenue: null,
    totalCustomers: null,
    newCustomersThisMonth: null,
    totalOrdersPlaced: null,
    averageOrderValue: null,
    orderStatusCounts: null,
    statistics: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTotalProductsSold.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getTotalProductsSold.fulfilled, (state, action) => {
        state.totalProductsSold = action.payload;
        state.loading = "succeeded";
      })
      .addCase(getTotalProductsSold.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(getTotalRevenue.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getTotalRevenue.fulfilled, (state, action) => {
        state.totalRevenue = action.payload;
        state.loading = "succeeded";
      })
      .addCase(getTotalRevenue.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(getTotalCustomers.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getTotalCustomers.fulfilled, (state, action) => {
        state.totalCustomers = action.payload;
        state.loading = "succeeded";
      })
      .addCase(getTotalCustomers.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(getNewCustomersThisMonth.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getNewCustomersThisMonth.fulfilled, (state, action) => {
        state.newCustomersThisMonth = action.payload;
        state.loading = "succeeded";
      })
      .addCase(getNewCustomersThisMonth.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(getTotalOrdersPlaced.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getTotalOrdersPlaced.fulfilled, (state, action) => {
        state.totalOrdersPlaced = action.payload;
        state.loading = "succeeded";
      })
      .addCase(getTotalOrdersPlaced.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(getAverageOrderValue.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getAverageOrderValue.fulfilled, (state, action) => {
        state.averageOrderValue = action.payload;
        state.loading = "succeeded";
      })
      .addCase(getAverageOrderValue.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(getOrderStatusCounts.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getOrderStatusCounts.fulfilled, (state, action) => {
        state.orderStatusCounts = action.payload;
        state.loading = "succeeded";
      })
      .addCase(getOrderStatusCounts.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(getStatistics.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
        state.loading = "succeeded";
      })
      .addCase(getStatistics.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      });
  },
});

export default statisticSlice.reducer;