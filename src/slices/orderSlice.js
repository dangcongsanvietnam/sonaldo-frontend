import { createSlice } from "@reduxjs/toolkit";
import {
  deleteOrder,
  getOrderDetail,
  searchOrders,
  updateOrderStatus,
} from "../services/orderService";
import { createOrder, getOrder } from "../services/orderService";

const orderSlice = createSlice({
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

    builder.addCase(createOrder.pending, (state) => {
      state.loading = "pending"; // API đang xử lý
    });

    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.loading = "success"; // Cập nhật trạng thái thành công
    });

    builder.addCase(createOrder.rejected, (state, action) => {
      state.loading = "failed"; // Cập nhật trạng thái thất bại
      state.error = action.payload || action.error.message; // Lưu lỗi
    });

    builder.addCase(getOrder.pending, (state) => {
      state.loading = "pending"; // API đang xử lý
    });

    builder.addCase(getOrder.fulfilled, (state, action) => {
      state.data = action.payload; // Lưu dữ liệu trả về khi thành công
      state.loading = "success"; // Cập nhật trạng thái thành công
    });

    builder.addCase(getOrder.rejected, (state, action) => {
      state.loading = "failed"; // Cập nhật trạng thái thất bại
      state.error = action.payload || action.error.message; // Lưu lỗi
    });
  },
});

// Export reducer để tích hợp vào store
export default orderSlice.reducer;
