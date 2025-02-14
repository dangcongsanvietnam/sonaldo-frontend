import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const addNewCategory = createAsyncThunk(
  "category/addNewCategory",
  async (newCategory) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.post(
        "api/v1/admin/categories",
        newCategory,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getAdminCategories = createAsyncThunk(
  "category/getAdminCategories",
  async () => {
    const res = await BASE_URL.get("api/v1/categories");

    return res;
  }
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (categoryId) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.delete(
        `api/v1/admin/categories/${categoryId}`,
        config
      );
      return res;
    } catch (error) {
      throw error;
    }
  }
);

export const getCategoryDetail = createAsyncThunk(
  "category/getCategoryDetail",

  async (categoryId) => {
    const res = await BASE_URL.get(`api/v1/categories/${categoryId}`);
    return res;
  }
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
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
        `api/v1/admin/categories/${updateValues?.categoryId}`,
        initState,
        config
      );
      return res.data;
    } catch (error) {
    }
  }
);

export const addProductsToCategory = createAsyncThunk(
  "category/addProductsToCategory",
  async (updateValues) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const initState = {
      productIds: updateValues.productIds || "",
      categoryItemIds: updateValues.categoryItemIds[0] || ""
    };

    try {
      const res = await BASE_URL.put(
        `api/v1/admin/categories/updateProductsAndCategoryItems`,
        initState,
        config
      );
      return res.data;
    } catch (error) {
    }
  }
);

export const getCategoryItemDetail = createAsyncThunk(
  "category/getCategoryItemDetail",

  async (ObjectId) => {
    const res = await BASE_URL.get(
      `api/v1/categories/${ObjectId.categoryId}/${ObjectId.categoryItemId}`
    );

    return res;
  }
);

export const updateCategoryItem = createAsyncThunk(
  "category/updateCategoryItem",
  async (updateValues) => {
    // Lấy token từ cookie
    const token = Cookies.get("token");

    // Tạo cấu hình headers với token
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
      // Thực hiện request với cấu hình headers
      const res = await BASE_URL.put(
        `api/v1/admin/categories/${updateValues?.categoryId}/${updateValues?.categoryItemId}`,
        initState,
        config
      );
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {

    }
  }
);

export const addNewCategoryItem = createAsyncThunk(
  "category/addNewCategoryItem",
  async (newCategoryItem) => {
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    const updateValues = {
      name: newCategoryItem.name,
      description: newCategoryItem.description,
      files: newCategoryItem.files,
    };
    try {
      const res = await BASE_URL.post(
        `api/v1/admin/categories/${newCategoryItem.categoryId}`,
        updateValues,
        config
      );
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      throw error;
    }
  }
);

export const addProductsToCategoryItem = createAsyncThunk(
  "category/addProductsToCategoryItem",
  async (updatedProducts) => {
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    const updateValues = {
      productIds: updatedProducts.productIds
    };
    try {
      const res = await BASE_URL.put(
        `api/v1/admin/categories/${updatedProducts.categoryItemId}/addProductToCategoryItem`,
        updateValues,
        config
      );
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      throw error;
    }
  }
);

export const removeProductsFromCategoryItem = createAsyncThunk(
  "category/removeProductsFromCategoryItem",
  async (updatedProducts) => {
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    const updateValues = {
      productIds: updatedProducts.productIds
    };
    try {
      const res = await BASE_URL.put(
        `api/v1/admin/categories/${updatedProducts.categoryItemId}/removeProductsFromCategoryItem`,
        updateValues,
        config
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteCategoryItem = createAsyncThunk(
  "category/deleteCategoryItem",
  async ({ categoryId, categoryItemId }) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.delete(
        `api/v1/admin/categories/${categoryId}/${categoryItemId}`,
        config
      );
      return res;
    } catch (error) {
      throw error;
    }
  }
);
