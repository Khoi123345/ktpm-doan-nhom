import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import bookReducer from '../features/bookSlice';
import cartReducer from '../features/cartSlice';
import orderReducer from '../features/orderSlice';
import categoryReducer from '../features/categorySlice';
import couponReducer from '../features/couponSlice';
import userReducer from '../features/userSlice';
import reviewReducer from '../features/reviewSlice';
import statsReducer from '../features/statsSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        books: bookReducer,
        cart: cartReducer,
        orders: orderReducer,
        categories: categoryReducer,
        coupons: couponReducer,
        users: userReducer,
        reviews: reviewReducer,
        stats: statsReducer,
    },
});

export default store;
