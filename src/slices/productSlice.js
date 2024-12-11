import { createSlice } from "@reduxjs/toolkit";
import { getDataFromCookie, login } from "../services/authService";
import Cookies from "js-cookie";
import {
  addNewProduct,
  deleteProduct,
  getAdminProducts,
  getAllProduct,
  getProductDetail,
  searchProducts,
  updateProduct,
} from "../services/productService";

const productSlice = createSlice({
  name: "auth",
  initialState: {
    loading: "idle",
    products: [],
    product: null,
    error: null,
    suggestProducts: [],
    tags: [],
    customerProduct: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAdminProducts.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getAdminProducts.fulfilled, (state, action) => {
      state.products = action.payload;
      state.loading = "success";
    });

    builder.addCase(getAdminProducts.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(getAllProduct.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getAllProduct.fulfilled, (state, action) => {
      state.customerProduct = action.payload;
      state.loading = "success";
    });

    builder.addCase(getAllProduct.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(getProductDetail.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getProductDetail.fulfilled, (state, action) => {
      state.product = action.payload;
      state.loading = "success";
    });

    builder.addCase(getProductDetail.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(addNewProduct.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(addNewProduct.fulfilled, (state, action) => {
      state.product = action.payload;
      state.loading = "success";
    });

    builder.addCase(addNewProduct.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(updateProduct.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(updateProduct.fulfilled, (state, action) => {
      state.product = action.payload;
      state.loading = "success";
    });

    builder.addCase(updateProduct.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(deleteProduct.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.loading = "success";
    });

    builder.addCase(deleteProduct.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(searchProducts.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(searchProducts.fulfilled, (state, action) => {
      state.suggestProducts = action.payload?.data?.products;
      state.tags = action.payload?.data?.tags;
      state.loading = "success";
    });

    builder.addCase(searchProducts.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default productSlice.reducer;
