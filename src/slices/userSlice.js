import { createSlice } from "@reduxjs/toolkit";
import { changeUserStatus, createUser, deleteUser, deleteUserAddress, getAllManagers, getAllUsers, GetUser, getUserInfo, searchUsers, updateUser, updateUserInfo, updateUsers } from "../services/userService";

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: "idle",
    data: null,
    error: null,
    users: [],
    managers: [],
    searchUsers: [],
    userInfo: {}
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
    builder.addCase(getAllUsers.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getAllUsers.fulfilled, (state, action) => {
      state.users = action.payload;
      state.loading = "success";
    });

    builder.addCase(getAllUsers.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
    builder.addCase(getAllManagers.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getAllManagers.fulfilled, (state, action) => {
      state.managers = action.payload;
      state.loading = "success";
    });

    builder.addCase(getAllManagers.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
    builder.addCase(deleteUser.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(deleteUser.fulfilled, (state, action) => {
      // state.managers = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(deleteUser.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
    builder.addCase(createUser.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(createUser.fulfilled, (state, action) => {
      // state.managers = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(createUser.rejected, (state, action) => {
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

    builder.addCase(searchUsers.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(searchUsers.fulfilled, (state, action) => {
      state.searchUsers = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(searchUsers.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(changeUserStatus.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(changeUserStatus.fulfilled, (state, action) => {
      // state.searchUsers = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(changeUserStatus.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(updateUsers.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(updateUsers.fulfilled, (state, action) => {
      // state.searchUsers = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(updateUsers.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
    builder.addCase(GetUser.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(GetUser.fulfilled, (state, action) => {
      state.userInfo = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(GetUser.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
    builder.addCase(updateUser.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(updateUser.fulfilled, (state, action) => {
      // Cập nhật state.userInfo nếu cần
      state.loading = "success";
    });

    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });

    builder.addCase(deleteUserAddress.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(deleteUserAddress.fulfilled, (state, action) => {
      // Cập nhật state.userInfo nếu cần
      state.loading = "success";
    });

    builder.addCase(deleteUserAddress.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default userSlice.reducer;
