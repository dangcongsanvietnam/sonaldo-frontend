import { createSlice } from "@reduxjs/toolkit";
import {
  createInformation,
  deleteInformation,
  findDefault,
  getAllInformation,
  setDefaultInformation,
  updateInformation,
} from "../services/informationService";

const informationSlice = createSlice({
  name: "information",
  initialState: {
    loading: "idle",
    informationList: [],
    error: null,
    defaultData: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllInformation.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getAllInformation.fulfilled, (state, action) => {
        state.informationList = action.payload;
        state.loading = "succeeded";
      })
      .addCase(getAllInformation.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(createInformation.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(createInformation.fulfilled, (state, action) => {
        state.informationList.push(action.payload); // Thêm template mới vào danh sách
        state.loading = "succeeded";
      })
      .addCase(createInformation.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(updateInformation.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(updateInformation.fulfilled, (state, action) => {
        const updatedInformation = action.payload;
        const index = state.informationList.findIndex(
          (info) => info.id === updatedInformation.id
        );
        if (index !== -1) {
          state.informationList[index] = updatedInformation; // Cập nhật template trong danh sách
        }
        state.loading = "succeeded";
      })
      .addCase(updateInformation.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteInformation.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(deleteInformation.fulfilled, (state, action) => {
        const deletedInformationId = action.payload;
        state.informationList = state.informationList.filter(
          (info) => info.id !== deletedInformationId
        ); // Xóa template khỏi danh sách
        state.loading = "succeeded";
      })
      .addCase(deleteInformation.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(setDefaultInformation.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(setDefaultInformation.fulfilled, (state, action) => {
        // Xử lý logic cập nhật trạng thái khi set default thành công
        state.loading = "succeeded";
      })
      .addCase(setDefaultInformation.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      })
      .addCase(findDefault.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(findDefault.fulfilled, (state, action) => {
        state.defaultData = action.payload;
        state.loading = "succeeded";
      })
      .addCase(findDefault.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
      });
  },
});

export default informationSlice.reducer;