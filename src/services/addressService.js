import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const addAddress = createAsyncThunk(
  "address/addAddress",
  async (address) => {
    // Lấy token từ cookie
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token

    // Tạo cấu hình headers với token
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    try {
      // Thực hiện request với cấu hình headers
      const res = await BASE_URL.post("api/v1/addresses", address, config);
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Failed to add address:", error);
      throw error;
    }
  }
);

export const getAddress = createAsyncThunk(
  "address/getAddress",
  async (token) => {
    const res = await BASE_URL.get("api/v1/addresses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  }
);

export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (addressId) => {
    // Lấy token từ cookie
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token

    // Tạo cấu hình headers với token
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    try {
      // Thực hiện request với cấu hình headers
      const res = await BASE_URL.delete(
        `api/v1/addresses/${addressId}`,
        config
      );
      return res; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Failed to add address:", error);
      throw error;
    }
  }
);

export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async (address) => {
    // Lấy token từ cookie
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token

    // Tạo cấu hình headers với token
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    const initState = {
      fullName: address.fullName ? address.fullName : "",
      phoneNumber: address.phoneNumber ? address.phoneNumber : "",
      address: address.address ? address.address : "",
      province: address.province ? address.province : "",
      district: address.district ? address.district : "",
      commune: address.commune ? address.commune : "",
      defaultAddress: address.defaultAddress ? address.defaultAddress : false,
    };

    try {
      // Thực hiện request với cấu hình headers
      const res = await BASE_URL.put(
        `api/v1/addresses/${address.id}`,
        initState,
        config
      );
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Failed to add address:", error);
      throw error;
    }
  }
);
