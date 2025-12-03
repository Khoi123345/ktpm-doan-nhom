import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const { token } = JSON.parse(userInfo);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                // Invalid user info in local storage
                localStorage.removeItem('userInfo');
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Cart API
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addToCart: (bookId, quantity) => api.post('/cart', { bookId, quantity }),
    updateCartItem: (bookId, quantity) => api.put(`/cart/${bookId}`, { quantity }),
    removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
    removeMultipleFromCart: (itemIds) => api.delete('/cart/remove-multiple', { data: { itemIds } }),
    clearCart: () => api.delete('/cart'),
};

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Books API
export const booksAPI = {
    getBooks: (params) => api.get('/books', { params }),
    getBookById: (id) => api.get(`/books/${id}`),
    getTopBooks: () => api.get('/books/top'),
    getNewArrivals: () => api.get('/books/new'),
    createBook: (bookData) => api.post('/books', bookData),
    updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
    deleteBook: (id) => api.delete(`/books/${id}`),
    uploadImages: (formData) => api.post('/books/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Categories API
export const categoriesAPI = {
    getCategories: () => api.get('/categories'),
    getCategoryById: (id) => api.get(`/categories/${id}`),
    createCategory: (categoryData) => api.post('/categories', categoryData),
    updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Orders API
export const ordersAPI = {
    createOrder: (orderData) => api.post('/orders', orderData),
    getOrderById: (id) => api.get(`/orders/${id}`),
    getMyOrders: () => api.get('/orders/myorders'),
    getAllOrders: () => api.get('/orders'),
    updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    updateOrderToPaid: (id, paymentResult) => api.put(`/orders/${id}/pay`, paymentResult),
};

// Coupons API
export const couponsAPI = {
    getCoupons: () => api.get('/coupons'),
    getCouponByCode: (code) => api.get(`/coupons/${code}`),
    validateCoupon: (code, orderValue) => api.post('/coupons/validate', { code, orderValue }),
    createCoupon: (couponData) => api.post('/coupons', couponData),
    updateCoupon: (id, couponData) => api.put(`/coupons/${id}`, couponData),
    deleteCoupon: (id) => api.delete(`/coupons/${id}`),
    getAllCoupons: () => api.get('/coupons/admin/all'),
};

// Payment API
export const paymentAPI = {

    createMoMoPayment: (orderId, amount, orderDescription) =>
        api.post('/payment/momo/create', { orderId, amount, orderDescription }),
};

// Users API (Admin)
export const usersAPI = {
    getAllUsers: () => api.get('/users'),
    getUserById: (id) => api.get(`/users/${id}`),
    updateUser: (id, userData) => api.put(`/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

// Reviews API
export const reviewsAPI = {
    createReview: (bookId, reviewData) => api.post(`/reviews/books/${bookId}/reviews`, reviewData),
    getBookReviews: (bookId) => api.get(`/reviews/books/${bookId}/reviews`),
    updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
    deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export default api;
