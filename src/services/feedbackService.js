// feedbackService.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const createFeedback = createAsyncThunk(
  "feedback/createFeedback",
  async (feedbackData) => {
    try {
      const response = await BASE_URL.post('/api/v1/feedbacks', feedbackData);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gửi feedback:", error);
      throw error;
    }
  }
);

export const getAllFeedbacks = createAsyncThunk(
  "feedback/getAllFeedbacks",
  async (params) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        state: params.state || null,
        page: params.page || 0,
        size: params.size || 10,
      },
    };

    try {
      const res = await BASE_URL.get("api/v1/super-admin/feedbacks", config);
      return res.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách feedback:", error);
      throw error;
    }
  }
);

export const replyFeedback = createAsyncThunk(
  "feedback/replyFeedback",
  async ({ feedbackId, content }) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.post(`api/v1/super-admin/feedbacks/${feedbackId}/reply`, { content }, config);
      return res.data;
    } catch (error) {
      console.error("Lỗi khi phản hồi feedback:", error);
      throw error;
    }
  }
);

export const deleteFeedback = createAsyncThunk(
  "feedback/deleteFeedback",
  async (feedbackId) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.delete(`api/v1/super-admin/feedbacks/${feedbackId}`, config);
      return res.data;
    } catch (error) {
      console.error("Lỗi khi xóa feedback:", error);
      throw error;
    }
  }
);