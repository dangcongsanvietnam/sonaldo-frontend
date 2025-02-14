// feedbackSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { createFeedback, getAllFeedbacks, replyFeedback, deleteFeedback } from "../services/feedbackService";

const feedbackSlice = createSlice({
  name: "feedback",
  initialState: {
    feedbacks: {
      content: [],
      pageable: {
        sort: {
          empty: true,
          sorted: false,
          unsorted: true
        },
        offset: 0,
        pageNumber: 0,
        pageSize: 10,
        paged: true,
        unpaged: false
      },
      totalElements: 0,
      totalPages: 0,
      last: true,
      number: 0,
      sort: {
        empty: true,
        sorted: false,
        unsorted: true
      },
      size: 10,
      numberOfElements: 0,
      first: true,
      empty: true
    },
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
      });
  },
});

export default feedbackSlice.reducer;