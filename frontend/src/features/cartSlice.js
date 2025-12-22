import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../services/api';

// Get cart from localStorage
const getCartFromStorage = () => {
    try {
        const cartItems = localStorage.getItem('cartItems');
        return cartItems ? JSON.parse(cartItems) : [];
    } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        return [];
    }
};

const initialState = {
    cartItems: getCartFromStorage(),
    loading: false,
    error: null,
    appliedCoupon: null,
    shippingAddress: {},
    paymentMethod: 'COD',
    syncedWithBackend: false,
};

// Fetch cart from backend
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await cartAPI.getCart();
            return data.data.items;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải giỏ hàng');
        }
    }
);

// Add to cart async (for logged-in users)
export const addToCartAsync = createAsyncThunk(
    'cart/addToCartAsync',
    async ({ bookId, quantity }, { rejectWithValue }) => {
        try {
            const { data } = await cartAPI.addToCart(bookId, quantity);
            return data.data.items;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
        }
    }
);

// Update cart item async
export const updateCartItemAsync = createAsyncThunk(
    'cart/updateCartItemAsync',
    async ({ bookId, quantity }, { rejectWithValue }) => {
        try {
            const { data } = await cartAPI.updateCartItem(bookId, quantity);
            return data.data.items;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật giỏ hàng');
        }
    }
);

// Remove from cart async
export const removeFromCartAsync = createAsyncThunk(
    'cart/removeFromCartAsync',
    async (bookId, { rejectWithValue }) => {
        try {
            const { data } = await cartAPI.removeFromCart(bookId);
            return data.data.items;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa khỏi giỏ hàng');
        }
    }
);

// Remove multiple items from cart async
export const removeMultipleFromCartAsync = createAsyncThunk(
    'cart/removeMultipleFromCartAsync',
    async (itemIds, { rejectWithValue }) => {
        try {
            const { data } = await cartAPI.removeMultipleFromCart(itemIds);
            return data.data.items;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa sản phẩm');
        }
    }
);

// Clear cart async
export const clearCartAsync = createAsyncThunk(
    'cart/clearCartAsync',
    async (_, { rejectWithValue }) => {
        try {
            await cartAPI.clearCart();
            return [];
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa giỏ hàng');
        }
    }
);

// Sync local cart with backend after login
export const syncCartAfterLogin = createAsyncThunk(
    'cart/syncCartAfterLogin',
    async (_, { getState, rejectWithValue }) => {
        try {
            const localCartItems = getCartFromStorage();
            
            // If no local cart, just fetch from backend
            if (localCartItems.length === 0) {
                const { data } = await cartAPI.getCart();
                return data.data.items;
            }

            // Sync each local cart item to backend
            for (const item of localCartItems) {
                await cartAPI.addToCart(item._id, item.quantity);
            }

            // Fetch updated cart from backend
            const { data } = await cartAPI.getCart();
            
            // Clear local storage after successful sync
            localStorage.removeItem('cartItems');
            
            return data.data.items;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể đồng bộ giỏ hàng');
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Clear cart on logout
        clearCartOnLogout: (state) => {
            state.cartItems = [];
            state.appliedCoupon = null;
            state.shippingAddress = {};
            state.paymentMethod = 'COD';
            state.syncedWithBackend = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('cartItems');
            localStorage.removeItem('shippingAddress');
            localStorage.removeItem('paymentMethod');
        },
        
        // Add to cart (local)
        addToCart: (state, action) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x._id === item._id);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x._id === existItem._id ? { ...x, quantity: x.quantity + (item.quantity || 1) } : x
                );
            } else {
                state.cartItems.push({ ...item, quantity: item.quantity || 1 });
            }

            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            state.syncedWithBackend = false;
        },

        // Update cart item quantity (local)
        updateCartItem: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.cartItems.find((x) => x._id === id);

            if (item) {
                item.quantity = quantity;
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
                state.syncedWithBackend = false;
            }
        },

        // Remove from cart (local)
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            state.syncedWithBackend = false;
        },

        // Remove multiple items from cart (local)
        removeItemsFromCart: (state, action) => {
            const itemIds = action.payload;
            state.cartItems = state.cartItems.filter((x) => !itemIds.includes(x._id));
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            state.syncedWithBackend = false;
        },

        // Clear cart (local)
        clearCart: (state) => {
            state.cartItems = [];
            state.appliedCoupon = null;
            state.syncedWithBackend = false;
            localStorage.removeItem('cartItems');
        },

        // Apply coupon
        applyCoupon: (state, action) => {
            state.appliedCoupon = action.payload;
        },

        // Remove coupon
        removeCoupon: (state) => {
            state.appliedCoupon = null;
        },

        // Save shipping address
        saveShippingAddress: (state, action) => {
            state.shippingAddress = action.payload;
            localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
        },

        // Save payment method
        savePaymentMethod: (state, action) => {
            state.paymentMethod = action.payload;
            localStorage.setItem('paymentMethod', action.payload);
        },

        // Reset cart error
        resetCartError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch cart
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload || [];
                state.syncedWithBackend = true;
                localStorage.setItem('cartItems', JSON.stringify(action.payload || []));
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Add to cart async
        builder
            .addCase(addToCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload || [];
                state.syncedWithBackend = true;
                localStorage.setItem('cartItems', JSON.stringify(action.payload || []));
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update cart item async
        builder
            .addCase(updateCartItemAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItemAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload || [];
                state.syncedWithBackend = true;
                localStorage.setItem('cartItems', JSON.stringify(action.payload || []));
            })
            .addCase(updateCartItemAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Remove from cart async
        builder
            .addCase(removeFromCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload || [];
                state.syncedWithBackend = true;
                localStorage.setItem('cartItems', JSON.stringify(action.payload || []));
            })
            .addCase(removeFromCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Remove multiple from cart async
        builder
            .addCase(removeMultipleFromCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeMultipleFromCartAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload || [];
                state.syncedWithBackend = true;
                localStorage.setItem('cartItems', JSON.stringify(action.payload || []));
            })
            .addCase(removeMultipleFromCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Clear cart async
        builder
            .addCase(clearCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearCartAsync.fulfilled, (state) => {
                state.loading = false;
                state.cartItems = [];
                state.appliedCoupon = null;
                state.syncedWithBackend = true;
                localStorage.removeItem('cartItems');
            })
            .addCase(clearCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // Still clear cart even if API fails
                state.cartItems = [];
                state.appliedCoupon = null;
                localStorage.removeItem('cartItems');
            });

        // Sync cart after login
        builder
            .addCase(syncCartAfterLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(syncCartAfterLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload || [];
                state.syncedWithBackend = true;
                localStorage.setItem('cartItems', JSON.stringify(action.payload || []));
            })
            .addCase(syncCartAfterLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearCartOnLogout,
    addToCart,
    updateCartItem,
    removeFromCart,
    removeItemsFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    saveShippingAddress,
    savePaymentMethod,
    resetCartError,
} = cartSlice.actions;

export default cartSlice.reducer;