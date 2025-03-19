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
      throw error;
    }
  }
);

export const getAllReview = createAsyncThunk(
  "review/getAllReview",
  async (productId) => {

    try {
      const res = await BASE_URL.get(`api/v1/reviews/${productId}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const addReview = createAsyncThunk(
  "product/addReview",
  async ({ updateValues, productId }) => {
    const token = Cookies.get("token");
    const userId = localStorage.getItem("userId");
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      params: {
        userId: userId,
      },
    };

    try {
      const res = await BASE_URL.post(
        `api/v1/reviews/${productId}`,
        updateValues,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);