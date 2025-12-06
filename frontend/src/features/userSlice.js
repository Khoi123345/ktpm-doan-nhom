import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
    users: [],
    user: null,
    loading: false,
    error: null,
    success: false,
};

// Get all users (Admin)
export const getUsers = createAsyncThunk(
    'users/getUsers',
    async ({ keyword = '', page = 1, limit = 10 } = {}, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/users?keyword=${keyword}&page=${page}&limit=${limit}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách người dùng');
        }
    }
);

// Delete user (Admin)
export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/users/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa người dùng');
        }
    }
);

// Get user by ID (Admin)
export const getUserById = createAsyncThunk(
    'users/getUserById',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/users/${id}`);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không tìm thấy người dùng');
        }
    }
);

// Update user (Admin)
export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, userData }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/users/${id}`, userData);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật người dùng');
        }
    }
);

// Toggle user lock (Admin)
export const toggleUserLock = createAsyncThunk(
    'users/toggleUserLock',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/users/${id}/lock`);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể thay đổi trạng thái khóa');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearUser: (state) => {
            state.user = null;
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
                state.total = action.payload.total;
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter((user) => user._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getUserById.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.user = action.payload;
                const index = state.users.findIndex((user) => user._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(toggleUserLock.fulfilled, (state, action) => {
                const index = state.users.findIndex((user) => user._id === action.payload._id);
                if (index !== -1) {
                    state.users[index].isLocked = action.payload.isLocked;
                }
            });
    },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
