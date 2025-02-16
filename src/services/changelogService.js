import { createAsyncThunk } from "@reduxjs/toolkit";
import BASE_URL from "../api";
import Cookies from "js-cookie";

export const getLogs = createAsyncThunk(
    "changelog/getLogs",
    async (params) => {
        const token = Cookies.get("token");

        const config = {
            headers: {
                "Authorization": `Bearer ${token}`, // Thêm token vào header Authorization
            },
            params: {
                eventId: params.eventId || "",
                eventType: params.eventType || "",
                status: params.status || "",
                detail: params.detail || "",
                startTime: params.startTime || "",
                endTime: params.endTime || "",
                page: params.page || 0,
                limit: params.limit || 10,
            },
        };

        try {
            const res = await BASE_URL.get("api/v1/changelog", config);
            return res;
        } catch (error) {
            throw error;
        }
    }
);
