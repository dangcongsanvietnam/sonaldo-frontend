import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const getAdminProducts = createAsyncThunk(
  "product/getAdminProducts",
  async ({ page, limit }) => {
    const res = await BASE_URL.get(`api/v1/products`, {
      params: {
        page: page,
        limit: limit,
      },
    });

    return res; // Thông thường bạn trả về `data` thay vì toàn bộ `res`.
  }
);

export const getProductDetail = createAsyncThunk(
  "product/getProductDetail",
  async (productId) => {
    const res = await BASE_URL.get(`api/v1/products/${productId}`);
    return res;
  }
);

export const getProductsByCategoryItem = createAsyncThunk(
  "product/getProductsByCategoryItem",
  async (categoryItemId) => {
    const res = await BASE_URL.get(`api/v1/products/get-all-by-categoryItem/${categoryItemId}`);
    return res;
  }
);

export const getProductsByBrandCategory = createAsyncThunk(
  "product/getProductsByBrandCategory",
  async (brandCategoryId) => {
    const res = await BASE_URL.get(`api/v1/products/get-all-by-brandCategory/${brandCategoryId}`);
    return res;
  }
);

export const addNewProduct = createAsyncThunk(
  "product/addNewProduct",
  async (updateValues) => {
    // Lấy token từ cookie
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token

    console.log(123, updateValues);
    console.log(456, token);
    // Tạo cấu hình headers với token
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    try {
      // Thực hiện request với cấu hình headers
      const res = await BASE_URL.post(
        "api/v1/admin/products",
        updateValues,
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

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ updateValues, productId }) => {
    // Lấy token từ cookie
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token
    console.log(123, updateValues);
    console.log(456, token);
    console.log(789, productId);
    // Tạo cấu hình headers với token
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    try {
      // Thực hiện request với cấu hình headers
      const res = await BASE_URL.put(
        `api/v1/admin/products/${productId}`,
        updateValues,
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

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (productId) => {
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
      const res = await BASE_URL.delete(
        `api/v1/admin/products/${productId}`,
        config
      );
      return res; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Xoá ko thành công", error);
      throw error;
    }
  }
);

export const searchProducts = createAsyncThunk(
  "product/searchProducts",
  async (keyword) => {
    const res = await BASE_URL.get(`api/v1/products/search`, {
      params: { keyword },
    });
    return res;
  }
);

export const getAllProduct = createAsyncThunk(
  "product/getAllProduct",
  async ({ page, limit }) => {
    const res = await BASE_URL.get(`api/v1/products`, {
      params: {
        page: page,
        limit: limit,
      },
    });

    return res;
  }
);

export const searchAdminProducts = createAsyncThunk(
  "product/searchAdminProducts",
  async (params) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        "Authorization": `Bearer ${token}`, // Thêm token vào header Authorization
      },
      params: {
        productName: params.productName || "",
        status: params.status || "",
        brandCategoryId: params.brandCategoryId || "",
        categoryItemIds: params.categoryItemIds || "",
        page: params.page || 0,
        limit: params.limit || 10,
      },
    };

    try {
      const res = await BASE_URL.get("api/v1/admin/products/search-product", config);
      return res;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      throw error;
    }
  }
);

export const updateProducts = createAsyncThunk(
  "product/updateProducts",
  async (params) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      params: {
        object: params.object || "",
        value: params.value || "",
        productIds: params.productIds || ""
      },
    };

    try {
      const res = await BASE_URL.put("api/v1/admin/products/single-update", {},  config);
      console.log(res)
      return res;
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      throw error;
    }
  }
);
