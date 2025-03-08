import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const getAdminProducts = createAsyncThunk(
  "product/getAdminProducts",
  async ({ page, limit }) => {
    const res = await BASE_URL.get(`api/v1/products`, {
      params: {
        page: page || 0,
        limit: limit || 10,
      },
    });

    return res.data;
  }
);

export const getHotProducts = createAsyncThunk(
  "product/getHotProducts",
  async ({ page, limit }) => {
    const res = await BASE_URL.get(`api/v1/products/hot`, {
      params: {
        page: page || 0,
        limit: limit || 10,
      },
    });

    return res.data;
  }
);

export const getProductDetail = createAsyncThunk(
  "product/getProductDetail",
  async (productId) => {
    const res = await BASE_URL.get(`api/v1/products/${productId}`);
    return res;
  }
);

export const getRecommendProducts = createAsyncThunk(
  "product/getRecommendProducts",
  async (productId) => {
    const res = await BASE_URL.get(`api/v1/products/suggest/${productId}`);
    console.log(res)
    return res;
  }
);

export const getProductsByCategoryItem = createAsyncThunk(
  "product/getProductsByCategoryItem",
  async (categoryItemId) => {
    const res = await BASE_URL.get(
      `api/v1/products/get-all-by-categoryItem/${categoryItemId}`
    );
    return res;
  }
);

export const getProductsByBrandCategory = createAsyncThunk(
  "product/getProductsByBrandCategory",
  async (brandCategoryId) => {
    const res = await BASE_URL.get(
      `api/v1/products/get-all-by-brandCategory/${brandCategoryId}`
    );
    return res;
  }
);

export const addNewProduct = createAsyncThunk(
  "product/addNewProduct",
  async (updateValues) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.post(
        "api/v1/admin/products",
        updateValues,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ updateValues, productId }) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.put(
        `api/v1/admin/products/${productId}`,
        updateValues,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (productId) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.delete(
        `api/v1/admin/products/${productId}`,
        config
      );
      return res;
    } catch (error) {
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
        Authorization: `Bearer ${token}`,
      },
      params: {
        productName: params.productName || "",
        status: params.status || "",
        state: params.state || "",
        brandCategoryId: params.brandCategoryId || "",
        categoryItemIds: params.categoryItemIds || "",
        page: params.page || 0,
        limit: params.limit || 10,
      },
    };

    try {
      const res = await BASE_URL.get(
        "api/v1/admin/products/search-product",
        config
      );
      return res.data;
    } catch (error) {
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
        Authorization: `Bearer ${token}`,
      },
      params: {
        object: params.object || "",
        value: params.value || "",
        productIds: params.productIds || "",
      },
    };

    try {
      const res = await BASE_URL.put(
        "api/v1/admin/products/single-update",
        {},
        config
      );
      return res;
    } catch (error) {
      throw error;
    }
  }
);
