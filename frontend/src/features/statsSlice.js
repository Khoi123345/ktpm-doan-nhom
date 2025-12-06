import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { statsAPI } from '../services/api';

// Async thunks
export const fetchOverviewStats = createAsyncThunk(
    'stats/fetchOverview',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await statsAPI.getOverviewStats();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải thống kê tổng quan');
        }
    }
);

export const fetchRevenueStats = createAsyncThunk(
    'stats/fetchRevenue',
    async (period, { rejectWithValue }) => {
        try {
            const { data } = await statsAPI.getRevenueStats(period);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải thống kê doanh thu');
        }
    }
);

export const fetchOrderStats = createAsyncThunk(
    'stats/fetchOrders',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await statsAPI.getOrderStats();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải thống kê đơn hàng');
        }
    }
);

export const fetchTopProducts = createAsyncThunk(
    'stats/fetchTopProducts',
    async (limit = 5, { rejectWithValue }) => {
        try {
            const { data } = await statsAPI.getTopProducts(limit);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải sản phẩm bán chạy');
        }
    }
);

export const fetchCategoryStats = createAsyncThunk(
    'stats/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await statsAPI.getCategoryStats();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải thống kê danh mục');
        }
    }
);

const statsSlice = createSlice({
    name: 'stats',
    initialState: {
        overview: null,
        revenue: null,
        orders: null,
        topProducts: [],
        categories: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearStatsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Overview stats
            .addCase(fetchOverviewStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOverviewStats.fulfilled, (state, action) => {
                state.loading = false;
                state.overview = action.payload;
            })
            .addCase(fetchOverviewStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Revenue stats
            .addCase(fetchRevenueStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRevenueStats.fulfilled, (state, action) => {
                state.loading = false;
                state.revenue = action.payload;
            })
            .addCase(fetchRevenueStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Order stats
            .addCase(fetchOrderStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderStats.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchOrderStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Top products
            .addCase(fetchTopProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.topProducts = action.payload;
            })
            .addCase(fetchTopProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Category stats
            .addCase(fetchCategoryStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoryStats.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategoryStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearStatsError } = statsSlice.actions;
export default statsSlice.reducer;
