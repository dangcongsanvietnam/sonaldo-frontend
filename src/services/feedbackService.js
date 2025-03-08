import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const createFeedback = createAsyncThunk(
  "feedback/createFeedback",
  async (data) => {
    const token = Cookies.get("token");
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await BASE_URL.post('/api/v1/blogs/add', data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const updateBlog = createAsyncThunk(
  "feedback/updateBlog",
  async ({ blogId, data }) => {
    const token = Cookies.get("token");
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await BASE_URL.put(`/api/v1/blogs/update/${blogId}`, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getAllFeedbacks = createAsyncThunk(
  "feedback/getAllFeedbacks",
  async () => {
    try {
      const response = await BASE_URL.get('/api/v1/blogs/all');
      return response.data;
    } catch (error) {
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
  async (blogId) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.delete(`api/v1/blogs/delete/${blogId}`, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const changeStatus = createAsyncThunk(
  "feedback/changeStatus",
  async (data) => {
    const token = Cookies.get("token");
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await BASE_URL.put(`/api/v1/blogs/state/${data.blogId}?state=${data.state}`, {}, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getBlogDetail = createAsyncThunk(
  "feedback/getBlogDetail",
  async (blogId) => {
    try {
      const response = await BASE_URL.get(`/api/v1/blogs/${blogId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);
