// src/slices/reviewSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { deleteReview } from "../services/reviewService";

const reviewSlice = createSlice({
  name: "review",
  initialState: {
    // ... your initial state ...
  },
  reducers: {
    // ... your reducers ...
  },
  extraReducers: (builder) => {
    // ... your other extraReducers ...

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
  },
});

export default reviewSlice.reducer;