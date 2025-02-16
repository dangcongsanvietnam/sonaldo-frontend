import { createSlice } from "@reduxjs/toolkit";
import { getAllHotSearch } from "../services/searchService";

const searchSlice = createSlice({
  name: "search",
  initialState: {
    loading: "idle",
    data: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllHotSearch.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getAllHotSearch.fulfilled, (state, action) => {
      state.data = action.payload.data;
      state.loading = "success";
    });

    builder.addCase(getAllHotSearch.rejected, (state, action) => {
      state.loading = "Failed";
      state.error = action.error;
    });
  },
});

export default searchSlice.reducer;
