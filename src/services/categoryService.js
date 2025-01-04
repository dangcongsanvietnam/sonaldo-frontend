import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const addNewCategory = createAsyncThunk(
  "category/addNewCategory",
  async (newCategory) => {
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
      const res = await BASE_URL.post(
        "api/v1/admin/categories",
        newCategory,
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
        `api/v1/admin/categories/${categoryId}`,
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
        `api/v1/admin/categories/${updateValues?.categoryId}`,
        initState,
        config
      );
      console.log("e", res);
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Sửa không thành công", error);
      console.log(updateValues);
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

    console.log(initState)

    try {
      const res = await BASE_URL.put(
        `api/v1/admin/categories/updateProductsAndCategoryItems`,
        initState,
        config
      );
      console.log("e", res);
      return res.data;
    } catch (error) {
      console.error("Sửa không thành công", error);
      console.log(updateValues);
    }
  }
);

export const getCategoryItemDetail = createAsyncThunk(
  "category/getCategoryItemDetail",

  async (ObjectId) => {
    const res = await BASE_URL.get(
      `api/v1/categories/${ObjectId.categoryId}/${ObjectId.categoryItemId}`
    );

    console.log(res);
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
      console.log("e", res);
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Sửa không thành công", error);
      console.log(updateValues);
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
      console.log(res);
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Failed to add brandCategory:", error);
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
      console.log(res);
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      console.error("Failed to add brandCategory:", error);
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
      console.log(res);
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Failed to add brandCategory:", error);
      throw error;
    }
  }
);

export const deleteCategoryItem = createAsyncThunk(
  "category/deleteCategoryItem",
  async ({ categoryId, categoryItemId }) => {
    // Lấy token từ cookie
    console.log("hehe", { categoryId, categoryItemId });
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token

    // Tạo cấu hình headers với token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    try {
      // Thực hiện request với cấu hình headers
      const res = await BASE_URL.delete(
        `api/v1/admin/categories/${categoryId}/${categoryItemId}`,
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
