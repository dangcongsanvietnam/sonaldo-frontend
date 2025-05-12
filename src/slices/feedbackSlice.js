// feedbackSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { createFeedback, getAllFeedbacks, replyFeedback, deleteFeedback, changeStatus, getBlogDetail, updateBlog, getRelatedBlogs, getHottestBlogs, getNewestBlogs } from "../services/feedbackService";

const feedbackSlice = createSlice({
  name: "feedback",
  initialState: {
    feedbacks: [],
    blog: {},
    loading: 'idle',
    relatedBlogs: [],
    newestBlogs: [],
    hottestBlog: []
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
        state.blog = action.payload.data;
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

      .addCase(getRelatedBlogs.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(getRelatedBlogs.fulfilled, (state, action) => {
        state.relatedBlogs = action.payload;
        state.loading = 'succeeded';
      })
      .addCase(getRelatedBlogs.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })

      .addCase(getHottestBlogs.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(getHottestBlogs.fulfilled, (state, action) => {
        state.hottestBlog = action.payload;
        state.loading = 'succeeded';
      })
      .addCase(getHottestBlogs.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })

      .addCase(getNewestBlogs.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(getNewestBlogs.fulfilled, (state, action) => {
        state.newestBlogs = action.payload;
        state.loading = 'succeeded';
      })
      .addCase(getNewestBlogs.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
  },
});

export default feedbackSlice.reducer;