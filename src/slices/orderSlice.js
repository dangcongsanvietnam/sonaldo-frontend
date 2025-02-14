import { createSlice } from "@reduxjs/toolkit";
import { deleteOrder, getOrderDetail, searchOrders, updateOrderStatus } from "../services/orderService";

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: "idle",
    data: null,
    error: null,
    orders: [],
    orderDetail: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(searchOrders.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchOrders.fulfilled, (state, action) => {
      state.orders = action.payload; // Cập nhật danh sách order
      state.loading = "success";
    });
    builder.addCase(searchOrders.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    // Thêm extraReducers cho updateOrderStatus
    builder.addCase(updateOrderStatus.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      // Cập nhật trạng thái của order trong state.orders
      // const updatedOrder = action.payload;
      state.loading = "success";
    });
    builder.addCase(updateOrderStatus.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    // Thêm extraReducers cho deleteOrder
    builder.addCase(deleteOrder.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(deleteOrder.fulfilled, (state, action) => {
      // Xóa order khỏi state.orders
      // const deletedOrderId = action.meta.arg; // Lấy orderId từ action.meta.arg
      // state.orders.content = state.orders.content.filter((order) => order.orderId !== deletedOrderId);
      state.loading = "success";
    });
    builder.addCase(deleteOrder.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(getOrderDetail.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getOrderDetail.fulfilled, (state, action) => {
      state.orderDetail = action.payload; // Cập nhật orderDetail
      state.loading = "success";
    });
    builder.addCase(getOrderDetail.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default userSlice.reducer;
