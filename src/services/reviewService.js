// src/services/reviewService.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const deleteReview = createAsyncThunk(
  "review/deleteReview",
  async ({ reviewId, productId }) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        productId: productId,
      },
    };

    try {
      const res = await BASE_URL.delete(`api/v1/super-admin/reviews/${reviewId}`, config);
      return res.data;
    } catch (error) {
      console.error("Lỗi khi xóa review:", error);
      throw error;
    }
  }
);