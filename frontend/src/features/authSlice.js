import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Get user from localStorage
const userInfo = localStorage.getItem('userInfo')
    ? (() => {
        try {
            return JSON.parse(localStorage.getItem('userInfo'));
        } catch (e) {
            return null;
        }
    })()
    : null;

const initialState = {
    userInfo,
    loading: false,
    error: null,
    success: false,
};

// Register user
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            localStorage.setItem('userInfo', JSON.stringify(data.data));
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
        }
    }
);

// Login user
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/auth/login', credentials);
            localStorage.setItem('userInfo', JSON.stringify(data.data));
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
        }
    }
);

// Get user profile
export const getProfile = createAsyncThunk(
    'auth/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/auth/profile');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lấy thông tin thất bại');
        }
    }
);

// Update profile
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (userData, { rejectWithValue }) => {
        try {
            const { data } = await api.put('/auth/profile', userData);
            localStorage.setItem('userInfo', JSON.stringify(data.data));
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Cập nhật thất bại');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('userInfo');
            state.userInfo = null;
            state.error = null;
            state.success = false;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
                state.success = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
                state.success = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Profile
            .addCase(getProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = { ...state.userInfo, ...action.payload };
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Profile
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
                state.success = true;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
