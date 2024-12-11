import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const getDataFromCookie = createAsyncThunk(
  "auth/getDataFromCookie",
  (userData) => {
    return userData;
  }
);

export const login = createAsyncThunk("auth/login", async (user) => {
  const res = await BASE_URL.post("api/v1/auth/login", user);

  Cookies.set("token", res.data.jwt);

  return res;
});
