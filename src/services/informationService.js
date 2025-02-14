import Cookies from "js-cookie";
import BASE_URL from "../api";
import { createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = "/api/v1/super-admin/information";

export const getAllInformation = createAsyncThunk(
  "information/getAllInformation",
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

export const getInformationById = createAsyncThunk(
  "information/getInformationById",
  async (informationId) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await BASE_URL.get(`${API_BASE_URL}/${informationId}`, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const createInformation = createAsyncThunk(
  "information/createInformation",
  async (informationData) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await BASE_URL.post(API_BASE_URL, informationData, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const updateInformation = createAsyncThunk(
  "information/updateInformation",
  async ({ informationId, ...informationData }) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await BASE_URL.put(
        `${API_BASE_URL}/${informationId}`,
        informationData.newInformation,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteInformation = createAsyncThunk(
  "information/deleteInformation",
  async (informationId) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      await BASE_URL.delete(`${API_BASE_URL}/${informationId}`, config);
      return informationId; 
    } catch (error) {
      throw error;
    }
  }
);

export const setDefaultInformation = createAsyncThunk(
  "information/setDefaultInformation",
  async (informationId) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await BASE_URL.put(
        `${API_BASE_URL}/${informationId}/default`,
        {},
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);