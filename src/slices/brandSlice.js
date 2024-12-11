import { createSlice } from "@reduxjs/toolkit";

import {
  addNewBrand,
  addNewBrandCategory,
  deleteBrand,
  deleteBrandCategory,
  getAdminBrands,
  getBrandCategory,
  getBrandCategoryDetail,
  getBrandDetail,
  updateBrand,
  updateBrandCategory,
} from "../services/brandService";

const brandSlice = createSlice({
  name: "auth",
  initialState: {
    loading: "idle",
    brands: [],
    brand: null,
    error: null,
    brandCategory: null,
    brandCategories: [],
    brandCategoryDetailItem: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addNewBrand.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(addNewBrand.fulfilled, (state, action) => {
      state.brand = action.payload;
      state.loading = "success";
    });

    builder.addCase(addNewBrand.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(getAdminBrands.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getAdminBrands.fulfilled, (state, action) => {
      state.brands = action.payload;
      state.loading = "success";
    });

    builder.addCase(getAdminBrands.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(deleteBrand.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(deleteBrand.fulfilled, (state) => {
      state.loading = "success";
    });

    builder.addCase(deleteBrand.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(getBrandDetail.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getBrandDetail.fulfilled, (state, action) => {
      state.loading = "success";
      state.brand = action.payload;
    });

    builder.addCase(getBrandDetail.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(getBrandCategory.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getBrandCategory.fulfilled, (state, action) => {
      state.loading = "success";
      state.brandCategories = action.payload;
    });

    builder.addCase(getBrandCategory.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(updateBrand.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(updateBrand.fulfilled, (state, action) => {
      state.loading = "success";
      state.brand = action.payload;
    });

    builder.addCase(updateBrand.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(getBrandCategoryDetail.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getBrandCategoryDetail.fulfilled, (state, action) => {
      state.loading = "success";
      state.brandCategoryDetailItem = action.payload;
    });

    builder.addCase(getBrandCategoryDetail.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(updateBrandCategory.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(updateBrandCategory.fulfilled, (state, action) => {
      state.loading = "success";
      state.brandCategoryDetailItem = action.payload;
    });

    builder.addCase(updateBrandCategory.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(addNewBrandCategory.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(addNewBrandCategory.fulfilled, (state, action) => {
      state.brandCategoryDetailItem = action.payload;
      state.loading = "success";
    });

    builder.addCase(addNewBrandCategory.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(deleteBrandCategory.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(deleteBrandCategory.fulfilled, (state) => {
      state.loading = "success";
    });

    builder.addCase(deleteBrandCategory.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default brandSlice.reducer;
