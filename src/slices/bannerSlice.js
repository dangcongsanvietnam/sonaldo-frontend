import { createSlice } from "@reduxjs/toolkit";
import { createBanner, deleteBanner, getActiveBanner, getAllBanners, setDefaultBanner } from "../services/bannerService";

const bannerSlice = createSlice({
  name: "banner",
  initialState: {
    loading: "idle",
    bannerList: [],
    error: null,
    activeBanner: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllBanners.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getAllBanners.fulfilled, (state, action) => {
        state.bannerList = action.payload;
        state.loading = "succeeded";
      })
      .addCase(getAllBanners.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(createBanner.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.bannerList.push(action.payload);
        state.loading = "succeeded";
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteBanner.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.bannerList = state.bannerList.filter(
          (info) => info.id !== deletedId
        );
        state.loading = "succeeded";
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(setDefaultBanner.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(setDefaultBanner.fulfilled, (state, action) => {
        // Xử lý logic cập nhật trạng thái khi set default thành công
        state.loading = "succeeded";
      })
      .addCase(setDefaultBanner.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(getActiveBanner.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getActiveBanner.fulfilled, (state, action) => {
        state.activeBanner = action.payload;
        state.loading = "succeeded";
      })
      .addCase(getActiveBanner.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      });
  },
});

export default bannerSlice.reducer;