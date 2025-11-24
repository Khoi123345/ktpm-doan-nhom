import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../services/api';

// Get cart from localStorage for initial state
const cartItems = localStorage.getItem('cartItems')
    ? (() => {
        try {
            return JSON.parse(localStorage.getItem('cartItems'));
        } catch (e) {
            return [];
        }
    })()
    : [];

const shippingAddress = localStorage.getItem('shippingAddress')
    ? (() => {
        try {
            return JSON.parse(localStorage.getItem('shippingAddress'));
        } catch (e) {
            return {};
        }
    })()
    : {};

const initialState = {
    cartItems,
    shippingAddress,
    paymentMethod: 'COD',
    appliedCoupon: null,
    itemsPrice: 0,
    shippingPrice: 0,
    discountAmount: 0,
    totalPrice: 0,
    loading: false,
    error: null,
    syncedWithBackend: false,
};

// Async thunks for Cart API
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await cartAPI.getCart();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải giỏ hàng');
        }
    }
);

export const addToCartAsync = createAsyncThunk(
    'cart/addToCartAsync',
    async ({ bookId, quantity }, { rejectWithValue }) => {
        try {
            const { data } = await cartAPI.addToCart(bookId, quantity);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
        }
    }
);

export const updateCartItemAsync = createAsyncThunk(
    'cart/updateCartItemAsync',
    async ({ itemId, quantity }, { rejectWithValue }) => {
        try {
            const { data } = await cartAPI.updateCartItem(itemId, quantity);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật giỏ hàng');
        }
    }
);

export const removeFromCartAsync = createAsyncThunk(
    'cart/removeFromCartAsync',
    async (itemId, { rejectWithValue }) => {
        try {
            const { data } = await cartAPI.removeFromCart(itemId);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa khỏi giỏ hàng');
        }
    }
);

export const clearCartAsync = createAsyncThunk(
    'cart/clearCartAsync',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await cartAPI.clearCart();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa giỏ hàng');
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Local cart actions (for non-logged-in users)
        addToCart: (state, action) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x._id === item._id);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x._id === existItem._id ? item : x
                );
            } else {
                state.cartItems.push(item);
            }

            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            cartSlice.caseReducers.calculatePrices(state);
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            cartSlice.caseReducers.calculatePrices(state);
        },
        updateCartQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.cartItems.find((x) => x._id === id);
            if (item) {
                item.quantity = quantity;
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
                cartSlice.caseReducers.calculatePrices(state);
            }
        },
        saveShippingAddress: (state, action) => {
            state.shippingAddress = action.payload;
            localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
        },
        savePaymentMethod: (state, action) => {
            state.paymentMethod = action.payload;
        },
        applyCoupon: (state, action) => {
            state.appliedCoupon = action.payload;
            cartSlice.caseReducers.calculatePrices(state);
        },
        removeCoupon: (state) => {
            state.appliedCoupon = null;
            cartSlice.caseReducers.calculatePrices(state);
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.appliedCoupon = null;
            localStorage.removeItem('cartItems');
            cartSlice.caseReducers.calculatePrices(state);
        },
        calculatePrices: (state) => {
            // Calculate items price
            state.itemsPrice = state.cartItems.reduce(
                (acc, item) => acc + (item.discountPrice || item.price) * item.quantity,
                0
            );

            // Calculate shipping price (free if > 200000 VND)
            state.shippingPrice = state.itemsPrice > 200000 ? 0 : 30000;

            // Calculate discount from coupon
            state.discountAmount = 0;
            if (state.appliedCoupon) {
                if (state.appliedCoupon.discountType === 'percentage') {
                    state.discountAmount = (state.itemsPrice * state.appliedCoupon.discountValue) / 100;
                    if (state.appliedCoupon.maxDiscountAmount > 0) {
                        state.discountAmount = Math.min(state.discountAmount, state.appliedCoupon.maxDiscountAmount);
                    }
                } else {
                    state.discountAmount = state.appliedCoupon.discountValue;
                }
            }

            // Calculate total price
            state.totalPrice = state.itemsPrice + state.shippingPrice - state.discountAmount;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload.items || [];
                state.syncedWithBackend = true;
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
                cartSlice.caseReducers.calculatePrices(state);
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add to cart
            .addCase(addToCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload.items || [];
                state.syncedWithBackend = true;
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
                cartSlice.caseReducers.calculatePrices(state);
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update cart item
            .addCase(updateCartItemAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItemAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload.items || [];
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
                cartSlice.caseReducers.calculatePrices(state);
            })
            .addCase(updateCartItemAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Remove from cart
            .addCase(removeFromCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload.items || [];
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
                cartSlice.caseReducers.calculatePrices(state);
            })
            .addCase(removeFromCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Clear cart
            .addCase(clearCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearCartAsync.fulfilled, (state) => {
                state.loading = false;
                state.cartItems = [];
                state.appliedCoupon = null;
                localStorage.removeItem('cartItems');
                cartSlice.caseReducers.calculatePrices(state);
            })
            .addCase(clearCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    saveShippingAddress,
    savePaymentMethod,
    applyCoupon,
    removeCoupon,
    clearCart,
    calculatePrices,
} = cartSlice.actions;

export default cartSlice.reducer;
