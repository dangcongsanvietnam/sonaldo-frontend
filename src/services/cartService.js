import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const getUserCart = createAsyncThunk("cart/getUserCart", async () => {
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
    const res = await BASE_URL.get(`api/v1/carts`, config);
    return res;
  } catch (error) {
    throw error;
  }
});

export const addProductToCart = createAsyncThunk(
  "cart/addProductToCart",
  async ({ productId, quantity }) => {
    const userId = localStorage.getItem("userId");
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userId: userId,
      },
    };

    try {
      const res = await BASE_URL.post(
        `api/v1/carts/${productId}?quantity=${quantity}`,
        null,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const updateQuantityCartItem = createAsyncThunk(
  "cart/updateQuantityCartItem",
  async ({ cartItemId, quantity }) => {
    const token = Cookies.get("token");
    const userId = localStorage.getItem("userId");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userId: userId,
      },
    };

    try {
      const res = await BASE_URL.put(
        `api/v1/carts/${cartItemId}?quantity=${quantity}`,
        null,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (cartItemId) => {
    const token = Cookies.get("token");
    const userId = localStorage.getItem("userId");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userId: userId,
      },
    };

    try {
      const res = await BASE_URL.delete(`api/v1/carts/${cartItemId}`, config);
      return res;
    } catch (error) {
      throw error;
    }
  }
);

export const removeAllCartItem = createAsyncThunk(
  "cart/removeAllCartItem",
  async () => {
    const token = Cookies.get("token");
    const userId = localStorage.getItem("userId");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userId: userId,
      },
    };

    try {
      const res = await BASE_URL.delete(`api/v1/carts`, config);
      return res;
    } catch (error) {
      throw error;
    }
  }
);
