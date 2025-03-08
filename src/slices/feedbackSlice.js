// feedbackSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { createFeedback, getAllFeedbacks, replyFeedback, deleteFeedback, changeStatus, getBlogDetail, updateBlog } from "../services/feedbackService";

const feedbackSlice = createSlice({
  name: "feedback",
  initialState: {
    feedbacks: [],
    blog: {},
    loading: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createFeedback.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        // Xử lý phản hồi thành công nếu cần
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      .addCase(getAllFeedbacks.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(getAllFeedbacks.fulfilled, (state, action) => {
        state.feedbacks = action.payload;
        state.loading = 'succeeded';
      })
      .addCase(getAllFeedbacks.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      .addCase(replyFeedback.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(replyFeedback.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        // Xử lý phản hồi thành công nếu cần
      })
      .addCase(replyFeedback.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteFeedback.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        // Xử lý phản hồi thành công nếu cần
      })
      .addCase(deleteFeedback.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      .addCase(changeStatus.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(changeStatus.fulfilled, (state, action) => {
        state.loading = 'succeeded';
      })
      .addCase(changeStatus.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })

      .addCase(getBlogDetail.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(getBlogDetail.fulfilled, (state, action) => {
        state.blog = action.payload
        state.loading = 'succeeded';
      })
      .addCase(getBlogDetail.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })

      .addCase(updateBlog.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = 'succeeded';
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
  },
});

export default feedbackSlice.reducer;