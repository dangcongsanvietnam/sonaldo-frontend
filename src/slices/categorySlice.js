import { createSlice } from "@reduxjs/toolkit";
import {
  addNewCategory,
  addNewCategoryItem,
  addProductsToCategory,
  addProductsToCategoryItem,
  deleteCategory,
  deleteCategoryItem,
  getAdminCategories,
  getCategoryDetail,
  getCategoryItemDetail,
  removeProductsFromCategoryItem,
  updateCategory,
  updateCategoryItem,
} from "../services/categoryService";

const categorySlice = createSlice({
  name: "auth",
  initialState: {
    loading: "idle",
    categories: [],
    category: null,
    error: null,
    categoryItem: null,
    categoryItems: [],
    categoryItemItem: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAdminCategories.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getAdminCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
      state.loading = "success";
    });

    builder.addCase(getAdminCategories.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
    builder.addCase(addProductsToCategory.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(addProductsToCategory.fulfilled, (state, action) => {
      state.loading = "success";
    });

    builder.addCase(addProductsToCategory.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(addNewCategory.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(addNewCategory.fulfilled, (state, action) => {
      state.category = action.payload;
      state.loading = "success";
    });

    builder.addCase(addNewCategory.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(getCategoryDetail.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getCategoryDetail.fulfilled, (state, action) => {
      state.loading = "success";
      state.category = action.payload;
    });

    builder.addCase(getCategoryDetail.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(removeProductsFromCategoryItem.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(removeProductsFromCategoryItem.fulfilled, (state, action) => {
      state.loading = "success";
      // state.category = action.payload;
    });

    builder.addCase(removeProductsFromCategoryItem.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(addProductsToCategoryItem.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(addProductsToCategoryItem.fulfilled, (state, action) => {
      state.loading = "success";
      // state.category = action.payload;
    });

    builder.addCase(addProductsToCategoryItem.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(updateCategory.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(updateCategory.fulfilled, (state, action) => {
      state.loading = "success";
      state.brand = action.payload;
    });

    builder.addCase(updateCategory.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(deleteCategory.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.loading = "success";
      state.category = action.payload;
    });

    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(addNewCategoryItem.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(addNewCategoryItem.fulfilled, (state, action) => {
      state.categoryItemItem = action.payload;
      state.loading = "success";
    });

    builder.addCase(addNewCategoryItem.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(deleteCategoryItem.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(deleteCategoryItem.fulfilled, (state) => {
      state.loading = "success";
    });

    builder.addCase(deleteCategoryItem.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(getCategoryItemDetail.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getCategoryItemDetail.fulfilled, (state, action) => {
      state.loading = "success";
      state.categoryItemItem = action.payload;
    });

    builder.addCase(getCategoryItemDetail.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(updateCategoryItem.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(updateCategoryItem.fulfilled, (state, action) => {
      state.loading = "success";
      state.categoryItemItem = action.payload;
    });

    builder.addCase(updateCategoryItem.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default categorySlice.reducer;
