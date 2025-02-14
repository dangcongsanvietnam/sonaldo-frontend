// src/services/questionService.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const deleteQuestion = createAsyncThunk(
  "question/deleteQuestion",
  async ({ questionId, productId }) => {
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
      const res = await BASE_URL.delete(`api/v1/super-admin/questions/${questionId}`, config);
      return res.data;
    } catch (error) {
      console.error("Lỗi khi xóa question:", error);
      throw error;
    }
  }
);

export const updateQuestionState = createAsyncThunk(
  "question/updateQuestionState",
  async ({ questionId, productId, state }) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        productId: productId,
        state: state,
      },
    };

    try {
      const res = await BASE_URL.put(`api/v1/super-admin/questions/${questionId}/state`, {}, config);
      return res.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái question:", error);
      throw error;
    }
  }
);