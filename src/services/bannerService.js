import Cookies from "js-cookie";
import BASE_URL from "../api";
import { createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = "/api/v1/super-admin/banners";

export const getAllBanners = createAsyncThunk(
  "banner/getAllBanners",
  async () => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await BASE_URL.get(API_BASE_URL, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getBannerById = createAsyncThunk(
  "banner/getBannerById",
  async (bannerId) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await BASE_URL.get(`${API_BASE_URL}/${bannerId}`, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getActiveBanner = createAsyncThunk(
    "banner/getActiveBanner",
    async () => {
      try {
        const res = await BASE_URL.get(`/api/v1/banners`);
        return res.data;
      } catch (error) {
        throw error;
      }
    }
  );

export const createBanner = createAsyncThunk(
  "banner/createBanner",
  async (bannerData) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await BASE_URL.post(API_BASE_URL, bannerData, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteBanner = createAsyncThunk(
  "banner/deleteBanner",
  async (bannerId) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      await BASE_URL.delete(`${API_BASE_URL}/${bannerId}`, config);
      return bannerId; 
    } catch (error) {
      throw error;
    }
  }
);

export const setDefaultBanner = createAsyncThunk(
  "banner/setDefaultBanner",
  async (bannerId) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await BASE_URL.put(
        `${API_BASE_URL}/${bannerId}/status`,
        {},
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);