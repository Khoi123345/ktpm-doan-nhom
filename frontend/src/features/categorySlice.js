import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
    categories: [],
    loading: false,
    error: null,
};

// Get all categories
export const getCategories = createAsyncThunk(
    'categories/getCategories',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/categories');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải thể loại');
        }
    }
);

// Create category (Admin)
export const createCategory = createAsyncThunk(
    'categories/createCategory',
    async (categoryData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/categories', categoryData);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tạo thể loại');
        }
    }
);

// Update category (Admin)
export const updateCategory = createAsyncThunk(
    'categories/updateCategory',
    async ({ id, categoryData }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/categories/${id}`, categoryData);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật thể loại');
        }
    }
);

// Delete category (Admin)
export const deleteCategory = createAsyncThunk(
    'categories/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/categories/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa thể loại');
        }
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(getCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories.push(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                // state.error = action.payload; // Handled by toast
            })
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.categories.findIndex((cat) => cat._id === action.payload._id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                // state.error = action.payload; // Handled by toast
            })
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = state.categories.filter((cat) => cat._id !== action.payload);
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                // state.error = action.payload; // Handled by toast
            });
    },
});

export default categorySlice.reducer;
