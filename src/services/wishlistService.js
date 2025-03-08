import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const getAllWishlist = createAsyncThunk(
    "wishlist/getAllWishlist",
    async () => {
        const token = Cookies.get("token");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            const res = await BASE_URL.get(
                `api/v1/wishlists`,
                config
            );
            return res;
        } catch (error) {
            throw error;
        }
    }
);

export const addToFavorite = createAsyncThunk(
    "wishlist/addToFavorite",
    async (data, { rejectWithValue }) => {
        const token = Cookies.get("token");
        const userId = localStorage.getItem("userId");
        if (!token) {
            return rejectWithValue("User is not authenticated");
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                productId: data.productId,
                userId: userId,
                wishlistId: data.wishlistId
            },
        };

        try {
            const res = await BASE_URL.post(`/api/v1/wishlists/addToFavorite`, null, config);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "An error occurred");
        }
    }
);

export const createWishlist = createAsyncThunk(
    "wishlist/createWishlist",
    async (name, { rejectWithValue }) => {
        const token = Cookies.get("token");
        const userId = localStorage.getItem("userId");
        if (!token) {
            return rejectWithValue("User is not authenticated");
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                name: name,
                userId: userId
            },
        };

        try {
            const res = await BASE_URL.post(`/api/v1/wishlists`, null, config);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "An error occurred");
        }
    }
);

export const updateWishlist = createAsyncThunk(
    "wishlist/updateWishlist",
    async (data, { rejectWithValue }) => {
        const token = Cookies.get("token");
        if (!token) {
            return rejectWithValue("User is not authenticated");
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            const res = await BASE_URL.put(`/api/v1/wishlists/${data.wishlistId}?name=${data.name}`, {}, config);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "An error occurred");
        }
    }
);

export const removeFromFavorite = createAsyncThunk(
    "wishlist/removeFromFavorite",
    async (data, { rejectWithValue }) => {
        const token = Cookies.get("token");
        const userId = localStorage.getItem("userId");
        if (!token) {
            return rejectWithValue("User is not authenticated");
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            const res = await BASE_URL.delete(`/api/v1/wishlists/${data.wishlistId}/${data.wishlistItemId}?productId=${data.productId}&userId=${userId}`, config);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "An error occurred");
        }
    }
);

export const deleteWishlist = createAsyncThunk(
    "wishlist/deleteWishlist",
    async (wishlistId, { rejectWithValue }) => {
        const token = Cookies.get("token");
        if (!token) {
            return rejectWithValue("User is not authenticated");
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            const res = await BASE_URL.delete(`/api/v1/wishlists/${wishlistId}`, config);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "An error occurred");
        }
    }
);
