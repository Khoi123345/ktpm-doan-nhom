import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
    coupons: [],
    validatedCoupon: null,
    loading: false,
    error: null,
};

// Validate coupon
export const validateCoupon = createAsyncThunk(
    'coupons/validateCoupon',
    async ({ code, orderValue }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/coupons/validate', { code, orderValue });
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
        }
    }
);

// Get all coupons (Admin)
export const getAdminCoupons = createAsyncThunk(
    'coupons/getAdminCoupons',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/coupons/admin/all');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách mã giảm giá');
        }
    }
);

// Get active coupons (Public)
export const getCoupons = createAsyncThunk(
    'coupons/getCoupons',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/coupons');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách mã giảm giá');
        }
    }
);

// Create coupon (Admin)
export const createCoupon = createAsyncThunk(
    'coupons/createCoupon',
    async (couponData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/coupons', couponData);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tạo mã giảm giá');
        }
    }
);

// Delete coupon (Admin)
export const deleteCoupon = createAsyncThunk(
    'coupons/deleteCoupon',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/coupons/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa mã giảm giá');
        }
    }
);

// Update coupon (Admin)
export const updateCoupon = createAsyncThunk(
    'coupons/updateCoupon',
    async ({ id, couponData }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/coupons/${id}`, couponData);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật mã giảm giá');
        }
    }
);

const couponSlice = createSlice({
    name: 'coupons',
    initialState,
    reducers: {
        clearCoupon: (state) => {
            state.validatedCoupon = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(validateCoupon.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(validateCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.validatedCoupon = action.payload;
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getCoupons.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = action.payload;
            })
            .addCase(getCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getAdminCoupons.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAdminCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = action.payload;
            })
            .addCase(getAdminCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createCoupon.pending, (state) => {
                state.loading = true;
            })
            .addCase(createCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons.push(action.payload);
            })
            .addCase(createCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteCoupon.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = state.coupons.filter((coupon) => coupon._id !== action.payload);
            })
            .addCase(deleteCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateCoupon.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateCoupon.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.coupons.findIndex((c) => c._id === action.payload._id);
                if (index !== -1) {
                    state.coupons[index] = action.payload;
                }
            })
            .addCase(updateCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCoupon } = couponSlice.actions;
export default couponSlice.reducer;
