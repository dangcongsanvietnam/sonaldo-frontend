import { createSlice } from "@reduxjs/toolkit";
import {
  addProductToCart,
  getUserCart,
  removeAllCartItem,
  removeCartItem,
  updateQuantityCartItem,
} from "../services/cartService";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    loading: "idle",
    data: null,
    error: null,
  },
  reducers: {
    userCart: {},
  },
  extraReducers: (builder) => {
    builder.addCase(getUserCart.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getUserCart.fulfilled, (state, action) => {
      state.userCart = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(getUserCart.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(addProductToCart.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(addProductToCart.fulfilled, (state, action) => {
      state.loading = "success";
    });

    builder.addCase(addProductToCart.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(updateQuantityCartItem.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(updateQuantityCartItem.fulfilled, (state, action) => {
      state.loading = "success";
    });

    builder.addCase(updateQuantityCartItem.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(removeCartItem.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(removeCartItem.fulfilled, (state, action) => {
      state.loading = "success";
    });

    builder.addCase(removeCartItem.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(removeAllCartItem.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(removeAllCartItem.fulfilled, (state, action) => {
      state.loading = "success";
    });

    builder.addCase(removeAllCartItem.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default cartSlice.reducer;
