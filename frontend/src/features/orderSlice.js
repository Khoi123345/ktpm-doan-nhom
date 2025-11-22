import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
    orders: [],
    order: null,
    loading: false,
    error: null,
    success: false,
};

// Create order
export const createOrder = createAsyncThunk(
    'orders/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/orders', orderData);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Tạo đơn hàng thất bại');
        }
    }
);

// Get my orders
export const getMyOrders = createAsyncThunk(
    'orders/getMyOrders',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/orders/myorders');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải đơn hàng');
        }
    }
);

// Get order by ID
export const getOrderById = createAsyncThunk(
    'orders/getOrderById',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/orders/${id}`);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không tìm thấy đơn hàng');
        }
    }
);

// Get all orders (Admin)
export const getOrders = createAsyncThunk(
    'orders/getOrders',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/orders');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng');
        }
    }
);

// Update order to delivered (Admin)
export const updateOrderToDelivered = createAsyncThunk(
    'orders/updateOrderToDelivered',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/orders/${id}/deliver`);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
        }
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearOrder: (state) => {
            state.order = null;
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
                state.success = true;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getMyOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(getMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getOrderById.pending, (state) => {
                state.loading = true;
            })
            .addCase(getOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(getOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(getOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(getOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateOrderToDelivered.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateOrderToDelivered.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
                // Update in list as well
                const index = state.orders.findIndex((o) => o._id === action.payload._id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(updateOrderToDelivered.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
