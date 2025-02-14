import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const addNewBrand = createAsyncThunk(
  "brand/addNewBrand",
  async (newBrand) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.post("api/v1/admin/brands", newBrand, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getAdminBrands = createAsyncThunk(
  "brand/getAdminBrands",
  async () => {
    const res = await BASE_URL.get("api/v1/brands");

    return res;
  }
);

export const deleteBrand = createAsyncThunk(
  "brand/deleteBrand",
  async (brandId) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.delete(
        `api/v1/admin/brands/${brandId}`,
        config
      );
      return res;
    } catch (error) {
      throw error;
    }
  }
);

export const getBrandDetail = createAsyncThunk(
  "brand/getBrandDetail",

  async (brandId) => {
    const res = await BASE_URL.get(`api/v1/brands/${brandId}`);
    return res;
  }
);

export const getBrandCategory = createAsyncThunk(
  "brand/getBrandCategory",

  async (brandId) => {
    const res = await BASE_URL.get(`api/v1/brands/${brandId}/brandCategory`);
    return res;
  }
);

export const updateBrand = createAsyncThunk(
  "brand/updateBrand",
  async (updateValues) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const initState = {
      name: updateValues?.name,
      description: updateValues?.description,
      files: updateValues?.files,
    };

    try {
      const res = await BASE_URL.put(
        `api/v1/admin/brands/${updateValues?.brandId}`,
        initState,
        config
      );
      return res.data;
    } catch (error) {
    }
  }
);

export const getBrandCategoryDetail = createAsyncThunk(
  "brand/getBrandCategoryDetail",

  async (ObjectId) => {
    const res = await BASE_URL.get(
      `api/v1/brands/${ObjectId.brandId}/${ObjectId.brandCategoryId}`
    );

    return res;
  }
);

export const updateBrandCategory = createAsyncThunk(
  "brand/updateBrandCategory",
  async (updateValues) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const initState = {
      name: updateValues?.name,
      description: updateValues?.description,
      files: updateValues?.files,
    };

    try {
      const res = await BASE_URL.put(
        `api/v1/admin/brands/${updateValues?.brandId}/${updateValues?.brandCategoryId}`,
        initState,
        config
      );
      return res.data;
    } catch (error) {
    }
  }
);

export const addProductsToBrand = createAsyncThunk(
  "brand/addProductsToBrand",
  async (updateValues) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const initState = {
      productIds: updateValues?.productIds,
    };

    try {
      const res = await BASE_URL.put(
        `api/v1/admin/brands/${updateValues.brandCategoryId}/addProductToBrandCategory`,
        initState,
        config
      );
      return res.data;
    } catch (error) {
    }
  }
);

export const addNewBrandCategory = createAsyncThunk(
  "brand/addNewBrandCategory",
  async (newBrandCategory) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    const updateValues = {
      name: newBrandCategory.name,
      description: newBrandCategory.description,
      files: newBrandCategory.files,
    };

    try {
      const res = await BASE_URL.post(
        `api/v1/admin/brands/${newBrandCategory.brandId}`,
        updateValues,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteBrandCategory = createAsyncThunk(
  "brand/deleteBrandCategory",
  async ({ brandId, brandCategoryId }) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.delete(
        `api/v1/admin/brands/${brandId}/${brandCategoryId}`,
        config
      );
      return res;
    } catch (error) {
      throw error;
    }
  }
);

export const removeProductsFromBrandCategory = createAsyncThunk(
  "category/removeProductsFromBrandCategory",
  async (updatedProducts) => {
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const updateValues = {
      productIds: updatedProducts.productIds
    };
    try {
      const res = await BASE_URL.put(
        `api/v1/admin/brands/${updatedProducts.brandCategoryId}/removeProductsFromBrandCategory`,
        updateValues,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);
