import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const sendBirthdayEmail = createAsyncThunk(
  "email/sendBirthdayEmail",
  async (emailData) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.post(`api/v1/super-admin/emails/birthday`, emailData, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const sendPromotionEmail = createAsyncThunk(
  "email/sendPromotionEmail",
  async (emailData) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.post(`api/v1/super-admin/emails/promotion`, emailData, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getBirthdayEmailTemplates = createAsyncThunk(
    "email/getBirthdayEmailTemplates",
    async () => {
      const token = Cookies.get("token");
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
  
      try {
        const res = await BASE_URL.get(`api/v1/super-admin/emails/birthday/templates`, config);
        return res.data;
      } catch (error) {
        throw error;
      }
    }
  );
  
  export const createBirthdayEmailTemplate = createAsyncThunk(
    "email/createBirthdayEmailTemplate",
    async (templateData) => {
      const token = Cookies.get("token");
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
  
      try {
        const res = await BASE_URL.post(`api/v1/super-admin/emails/birthday/templates`, templateData, config);
        return res.data;
      } catch (error) {
        throw error;
      }
    }
  );
  
  export const updateBirthdayEmailTemplate = createAsyncThunk(
    "email/updateBirthdayEmailTemplate",
    async ({ templateId, ...templateData }) => {
      const token = Cookies.get("token");
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
  
      try {
        const res = await BASE_URL.put(`api/v1/super-admin/emails/birthday/templates/${templateId}`, templateData, config);
        return res.data;
      } catch (error) {
        throw error;
      }
    }
  );
  
  export const deleteBirthdayEmailTemplate = createAsyncThunk(
    "email/deleteBirthdayEmailTemplate",
    async (templateId) => {
      const token = Cookies.get("token");
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
  
      try {
        const res = await BASE_URL.delete(`api/v1/super-admin/emails/birthday/templates/${templateId}`, config);
        return res.data;
      } catch (error) {
        throw error;
      }
    }
  );