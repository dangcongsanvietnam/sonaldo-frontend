import { createSlice } from "@reduxjs/toolkit";
import { createOrder, getOrder } from "../services/orderService";

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    loading: "idle", // Trạng thái API (idle, pending, success, failed)
    data: null, // Dữ liệu chi tiết đơn hàng sau khi tạo
    error: null, // Lưu thông tin lỗi nếu có
  },
  reducers: {},
  extraReducers: (builder) => {
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
