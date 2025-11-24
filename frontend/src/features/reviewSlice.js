import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsAPI } from '../services/api';

// Create review
export const createReview = createAsyncThunk(
    'reviews/create',
    async ({ bookId, reviewData }, { rejectWithValue }) => {
        try {
            const { data } = await reviewsAPI.createReview(bookId, reviewData);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tạo đánh giá');
        }
    }
);

// Get book reviews
export const getBookReviews = createAsyncThunk(
    'reviews/getBookReviews',
    async (bookId, { rejectWithValue }) => {
        try {
            const { data } = await reviewsAPI.getBookReviews(bookId);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải đánh giá');
        }
    }
);

// Delete review (Admin)
export const deleteReview = createAsyncThunk(
    'reviews/delete',
    async (reviewId, { rejectWithValue }) => {
        try {
            await reviewsAPI.deleteReview(reviewId);
            return reviewId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa đánh giá');
        }
    }
);

// Get all reviews (Admin)
// Note: reviewsAPI doesn't have getAllReviews yet, need to add it or use api.get directly if needed.
// Checking api.js, reviewsAPI only has createReview, getBookReviews, deleteReview.
// But the slice has getAllReviews. Let's check api.js again.
// api.js has:
// export const reviewsAPI = {
//     createReview: (bookId, reviewData) => api.post(`/reviews/books/${bookId}/reviews`, reviewData),
//     getBookReviews: (bookId) => api.get(`/reviews/books/${bookId}/reviews`),
//     deleteReview: (id) => api.delete(`/reviews/${id}`),
// };
// It seems getAllReviews was missing in api.js but present in slice.
// I should update api.js first or use api.get here.
// For now, I'll use the imported api instance if I can, but I only imported reviewsAPI.
// Let's import api as well.
import api from '../services/api';

export const getAllReviews = createAsyncThunk(
    'reviews/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/reviews/admin/all');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải đánh giá');
        }
    }
);

const reviewSlice = createSlice({
    name: 'reviews',
    initialState: {
        reviews: [],
        loading: false,
        error: null,
        createSuccess: false,
    },
    reducers: {
        resetCreateSuccess: (state) => {
            state.createSuccess = false;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create review
            .addCase(createReview.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createSuccess = false;
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews.unshift(action.payload);
                state.createSuccess = true;
            })
            .addCase(createReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get book reviews
            .addCase(getBookReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBookReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(getBookReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete review
            .addCase(deleteReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = state.reviews.filter(review => review._id !== action.payload);
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get all reviews (Admin)
            .addCase(getAllReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(getAllReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetCreateSuccess, clearError } = reviewSlice.actions;
export default reviewSlice.reducer;
