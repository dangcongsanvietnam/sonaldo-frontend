import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";

export const getAllHotSearch = createAsyncThunk(
  "search/getAllHotSearch",
  async ({ page, limit }) => {
    const res = await BASE_URL.get(`api/v1/tags/hot-tags`, {
      params: {
        page: page,
        limit: limit,
      },
    });

    return res;
  }
);
