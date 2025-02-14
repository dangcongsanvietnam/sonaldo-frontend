// src/slices/questionSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { deleteQuestion, updateQuestionState } from "../services/questionService";

const questionSlice = createSlice({
  name: "question",
  initialState: {
    // ... your initial state ...
  },
  reducers: {
    // ... your reducers ...
  },
  extraReducers: (builder) => {
    // ... your other extraReducers ...

    builder.addCase(deleteQuestion.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(deleteQuestion.fulfilled, (state, action) => {
      // Xử lý state sau khi xóa question thành công (nếu cần)
      state.loading = "success";
    });
    builder.addCase(deleteQuestion.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(updateQuestionState.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(updateQuestionState.fulfilled, (state, action) => {
      // Xử lý state sau khi cập nhật trạng thái question thành công (nếu cần)
      state.loading = "success";
    });
    builder.addCase(updateQuestionState.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default questionSlice.reducer;