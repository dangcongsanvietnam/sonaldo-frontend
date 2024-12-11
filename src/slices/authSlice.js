import { createSlice } from "@reduxjs/toolkit";
import { getDataFromCookie, login } from "../services/authService";
import Cookies from "js-cookie";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: "idle",
    data: null,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.data = null;
      Cookies.remove("token");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(login.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = "success";
    });

    builder.addCase(login.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default authSlice.reducer;
export const { logout } = authSlice.actions;
