import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { getLogs } from "../services/changelogService";

const changelogSlice = createSlice({
  name: "auth",
  initialState: {
    loading: "idle",
    data: [],
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.data = null;
      Cookies.remove("token");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getLogs.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getLogs.fulfilled, (state, action) => {
      state.data = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(getLogs.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default changelogSlice.reducer;
