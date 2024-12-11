import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const getUserInfo = createAsyncThunk(
  "user/getUserInfo",
  async (token) => {
    const res = await BASE_URL.get("api/v1/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res;
  }
);

export const updateUserInfo = createAsyncThunk(
  "user/updateUserInfo",
  async (updateValue) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
        // Thêm token vào header Authorization
      },
    };
    try {
      const res = await BASE_URL.put("api/v1/users", updateValue, config);
      return res.data;
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error(error);
      throw error;
    }
  }
);
