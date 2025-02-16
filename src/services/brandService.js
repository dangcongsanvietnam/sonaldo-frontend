import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const addNewBrand = createAsyncThunk(
  "brand/addNewBrand",
  async (newBrand) => {
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
      const res = await BASE_URL.post("api/v1/admin/brands", newBrand, config);
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Failed to add address:", error);
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
        `api/v1/admin/brands/${brandId}`,
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
        `api/v1/admin/brands/${updateValues?.brandId}`,
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

export const getBrandCategoryDetail = createAsyncThunk(
  "brand/getBrandCategoryDetail",

  async (ObjectId) => {
    const res = await BASE_URL.get(
      `api/v1/brands/${ObjectId.brandId}/${ObjectId.brandCategoryId}`
    );

    console.log(res);
    return res;
  }
);

export const updateBrandCategory = createAsyncThunk(
  "brand/updateBrandCategory",
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
        `api/v1/admin/brands/${updateValues?.brandId}/${updateValues?.brandCategoryId}`,
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
      console.log("e", res);
      return res.data; // Trả về dữ liệu từ res
    } catch (error) {
      console.error("Sửa không thành công", error);
      console.log(updateValues);
    }
  }
);

export const addNewBrandCategory = createAsyncThunk(
  "brand/addNewBrandCategory",
  async (newBrandCategory) => {
    // Lấy token từ cookie
    const token = Cookies.get("token"); // Hoặc tên khác tùy thuộc vào cách bạn lưu trữ token
    // Tạo cấu hình headers với token
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
      },
    };

    const updateValues = {
      name: newBrandCategory.name,
      description: newBrandCategory.description,
      files: newBrandCategory.files,
    };

    try {
      // Thực hiện request với cấu hình headers
      const res = await BASE_URL.post(
        `api/v1/admin/brands/${newBrandCategory.brandId}`,
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

export const deleteBrandCategory = createAsyncThunk(
  "brand/deleteBrandCategory",
  async ({ brandId, brandCategoryId }) => {
    // Lấy token từ cookie
    console.log("hehe", { brandId, brandCategoryId });
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
        `api/v1/admin/brands/${brandId}/${brandCategoryId}`,
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

export const removeProductsFromBrandCategory = createAsyncThunk(
  "category/removeProductsFromBrandCategory",
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
        `api/v1/admin/brands/${updatedProducts.brandCategoryId}/removeProductsFromBrandCategory`,
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
