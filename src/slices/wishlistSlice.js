import { createSlice } from "@reduxjs/toolkit";
import { addToFavorite, createWishlist, deleteWishlist, getAllWishlist, removeFromFavorite, updateWishlist } from "../services/wishlistService";

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: {
        loading: "idle",
        data: null,
        error: null,
        wishlists: []
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAllWishlist.pending, (state) => {
            state.loading = "pending";
        });

        builder.addCase(getAllWishlist.fulfilled, (state, action) => {
            state.wishlists = action.payload.data;
            state.loading = "success";
        });

        builder.addCase(getAllWishlist.rejected, (state, action) => {
            state.loading = "Failed";
            state.error = action.error;
        });

        builder.addCase(addToFavorite.pending, (state) => {
            state.loading = "pending";
        });

        builder.addCase(addToFavorite.fulfilled, (state, action) => {
            //   state.data = action.payload.data;
            state.loading = "success";
        });

        builder.addCase(addToFavorite.rejected, (state, action) => {
            state.loading = "Failed";
            state.error = action.error;
        });

        builder.addCase(createWishlist.pending, (state) => {
            state.loading = "pending";
        });

        builder.addCase(createWishlist.fulfilled, (state, action) => {
            //   state.data = action.payload.data;
            state.loading = "success";
        });

        builder.addCase(createWishlist.rejected, (state, action) => {
            state.loading = "Failed";
            state.error = action.error;
        });

        builder.addCase(updateWishlist.pending, (state) => {
            state.loading = "pending";
        });

        builder.addCase(updateWishlist.fulfilled, (state, action) => {
            //   state.data = action.payload.data;
            state.loading = "success";
        });

        builder.addCase(updateWishlist.rejected, (state, action) => {
            state.loading = "Failed";
            state.error = action.error;
        });

        builder.addCase(removeFromFavorite.pending, (state) => {
            state.loading = "pending";
        });

        builder.addCase(removeFromFavorite.fulfilled, (state, action) => {
            //   state.data = action.payload.data;
            state.loading = "success";
        });

        builder.addCase(removeFromFavorite.rejected, (state, action) => {
            state.loading = "Failed";
            state.error = action.error;
        });

        builder.addCase(deleteWishlist.pending, (state) => {
            state.loading = "pending";
        });

        builder.addCase(deleteWishlist.fulfilled, (state, action) => {
            //   state.data = action.payload.data;
            state.loading = "success";
        });

        builder.addCase(deleteWishlist.rejected, (state, action) => {
            state.loading = "Failed";
            state.error = action.error;
        });
    },
});

export default wishlistSlice.reducer;
