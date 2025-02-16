import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const getUserCart = createAsyncThunk("cart/getUserCart", async () => {
  // Lấy token từ cookie
  const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token

  // Tạo cấu hình headers với token
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
    },
  };

  try {
    // Thực hiện request với cấu hình headers
    const res = await BASE_URL.get(`api/v1/carts`, config);
    return res; // Trả về dữ liệu từ res
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Get ko thành công", error);
    throw error;
  }
});

export const addProductToCart = createAsyncThunk(
  "cart/addProductToCart",
  async ({ productId, quantity }) => {
    console.log("productIdbe", productId);
    // Lấy token từ cookie
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token
    console.log(token);
    // Tạo cấu hình headers với token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    try {
      // Thực hiện request với cấu hình headers
      const res = await BASE_URL.post(
        `api/v1/carts/${productId}?quantity=${quantity}`,
        null,
        config
      );
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error(error);
      throw error;
    }
  }
);

export const updateQuantityCartItem = createAsyncThunk(
  "cart/updateQuantityCartItem",
  async ({ cartItemId, quantity }) => {
    console.log("cartItemId", cartItemId);
    // Lấy token từ cookie
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token
    console.log(token);
    // Tạo cấu hình headers với token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    try {
      // Thực hiện request với cấu hình headers
      const res = await BASE_URL.put(
        `api/v1/carts/${cartItemId}?quantity=${quantity}`,
        null,
        config
      );
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error(error);
      throw error;
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (cartItemId) => {
    console.log("cartItemId", cartItemId);
    // Lấy token từ cookie
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token
    console.log(token);
    // Tạo cấu hình headers với token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    try {
      // Thực hiện request với cấu hình headers
      const res = await BASE_URL.delete(`api/v1/carts/${cartItemId}`, config);
      return res; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error(error);
      throw error;
    }
  }
);

export const removeAllCartItem = createAsyncThunk(
  "cart/removeAllCartItem",
  async () => {
    // Lấy token từ cookie
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token
    console.log(token);
    // Tạo cấu hình headers với token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    try {
      // Thực hiện request với cấu hình headers
      const res = await BASE_URL.delete(`api/v1/carts`, config);
      return res; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error(error);
      throw error;
    }
  }
);
