import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const getUserInfo = createAsyncThunk(
  "user/getUserInfo",
  async (token) => {
    const res = await BASE_URL.get("api/v1/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res;
  }
);

export const updateUserInfo = createAsyncThunk(
  "user/updateUserInfo",
  async (updateValue) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };
    
    try {
      const res = await BASE_URL.put("api/v1/users", updateValue, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async () => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };
    try {
      const res = await BASE_URL.get(`api/v1/super-admin/users/role/ROLE_USER`, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getAllManagers = createAsyncThunk(
  "user/getAllManagers",
  async () => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };
    try {
      const res = await BASE_URL.get(`api/v1/super-admin/users/role/ROLE_MANAGER`, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (email) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
        // Thêm token vào header Authorization
      },
    };
    try {
      const res = await BASE_URL.delete(`api/v1/super-admin/users/${email}`, config);
      return res;
    } catch (error) {
      throw error;
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (values) => {
    const token = Cookies.get("token");
    const initState = {
      email: values.email || "",
      password: values.password || "",
      firstName: values.firstName || "",
      lastName: values.lastName || "",
      googleLoginFlag: values.googleLoginFlag || 0,
      phoneNumber: values.phoneNumber || "",
      birthday: values.birthday || "",
      avatar: values.avatar || null,
      role: values.role || ""
    };

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };
    try {
      const res = await BASE_URL.post(`api/v1/super-admin/users`,initState, config);
      return res;
    } catch (error) {
      throw error;
    }
  }
);

export const searchUsers = createAsyncThunk(
  "product/searchUsers",
  async (params) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      params: {
        name: params.name || "",
        role: params.role || "",
        status: params.status || "",
        page: params.page || 0,
        limit: params.limit || 10,
      },
    };

    try {
      const res = await BASE_URL.get("api/v1/super-admin/users/find-all-by-status-and-role", config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const changeUserStatus = createAsyncThunk(
  "product/changeUserStatus",
  async (email) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.put(`api/v1/super-admin/users/${email}`, {}, config);
      return res;
    } catch (error) {
      throw error;
    }
  }
);

export const updateUsers = createAsyncThunk(
  "product/updateUsers",
  async (params) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      params: {
        role: params.role || "",
        status: params.status || "",
        userEmails: params.userEmails || ""
      },
    };

    try {
      const res = await BASE_URL.put("api/v1/super-admin/users", {}, config);
      return res;
    } catch (error) {
      throw error;
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  "product/changeUserPassword",
  async (params) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      params: {
        password: params.password,
      },
    };

    try {
      const res = await BASE_URL.put(`api/v1/super-admin/users/change-password/${params.email}`, {}, config);
      return res;
    } catch (error) {
      throw error;
    }
  }
);

export const GetUser = createAsyncThunk(
  "product/getUser",
  async (email) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.get(`api/v1/super-admin/users/user/${email}`, config);
      return res;
    } catch (error) {
      throw error;
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ email, updateValue }) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const res = await BASE_URL.put(`api/v1/super-admin/users/user/${email}`, updateValue, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteUserAddress = createAsyncThunk(
  "user/deleteUserAddress",
  async ({ email, addressId }) => {
    const token = Cookies.get("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await BASE_URL.delete(`api/v1/super-admin/users/user/${email}/address/${addressId}`, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);
