import { createSlice } from "@reduxjs/toolkit";
import {
  addAddress,
  deleteAddress,
  getAddress,
  updateAddress,
} from "../services/addressService";

const addressSlice = createSlice({
  name: "address",
  initialState: {
    loading: "idle",
    data: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addAddress.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(addAddress.fulfilled, (state, action) => {
      // state.data = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(addAddress.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(getAddress.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getAddress.fulfilled, (state, action) => {
      state.data = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(getAddress.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(deleteAddress.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(deleteAddress.fulfilled, (state) => {
      state.loading = "success";
    });

    builder.addCase(deleteAddress.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(updateAddress.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(updateAddress.fulfilled, (state) => {
      state.loading = "success";
    });

    builder.addCase(updateAddress.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default addressSlice.reducer;
