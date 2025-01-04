import { createSlice } from "@reduxjs/toolkit";
import { addProductToCart, getUserCart } from "../services/cartService";

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
  },
});

export default cartSlice.reducer;
