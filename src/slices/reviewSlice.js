// src/slices/reviewSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { addReview, deleteReview, getAllReview } from "../services/reviewService";

const reviewSlice = createSlice({
  name: "review",
  initialState: {
  reviews: []
  },
  reducers: {
  },
  extraReducers: (builder) => {

    builder.addCase(deleteReview.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(deleteReview.fulfilled, (state, action) => {
      // Xử lý state sau khi xóa review thành công (nếu cần)
      state.loading = "success";
    });
    builder.addCase(deleteReview.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(getAllReview.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllReview.fulfilled, (state, action) => {
      state.reviews = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllReview.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(addReview.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(addReview.fulfilled, (state, action) => {
      state.loading = "success";
    });
    builder.addCase(addReview.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default reviewSlice.reducer;