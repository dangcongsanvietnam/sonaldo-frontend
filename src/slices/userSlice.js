import { createSlice } from "@reduxjs/toolkit";
import { getUserInfo, updateUserInfo } from "../services/userService";

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: "idle",
    data: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUserInfo.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getUserInfo.fulfilled, (state, action) => {
      state.data = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(getUserInfo.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(updateUserInfo.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(updateUserInfo.fulfilled, (state, action) => {
      state.data = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(updateUserInfo.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default userSlice.reducer;
