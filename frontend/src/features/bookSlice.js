import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
    books: [],
    book: null,
    loading: false,
    error: null,
    page: 1,
    pages: 1,
    total: 0,
};

// Get all books
export const getBooks = createAsyncThunk(
    'books/getBooks',
    async ({ keyword = '', category = '', page = 1, minPrice = '', maxPrice = '' }, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/books?keyword=${keyword}&category=${category}&page=${page}&minPrice=${minPrice}&maxPrice=${maxPrice}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải sách');
        }
    }
);

// Get book by ID
export const getBookById = createAsyncThunk(
    'books/getBookById',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/books/${id}`);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không tìm thấy sách');
        }
    }
);

// Delete book (Admin)
export const deleteBook = createAsyncThunk(
    'books/deleteBook',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/books/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa sách');
        }
    }
);

// Create book (Admin)
export const createBook = createAsyncThunk(
    'books/createBook',
    async (bookData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/books', bookData);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tạo sách');
        }
    }
);

// Update book (Admin)
export const updateBook = createAsyncThunk(
    'books/updateBook',
    async ({ id, bookData }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/books/${id}`, bookData);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật sách');
        }
    }
);

// Upload book images (Admin)
export const uploadBookImages = createAsyncThunk(
    'books/uploadBookImages',
    async (formData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/books/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải ảnh lên');
        }
    }
);

const bookSlice = createSlice({
    name: 'books',
    initialState,
    reducers: {
        clearBook: (state) => {
            state.book = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getBooks.pending, (state) => {
                state.loading = true;
            })
            .addCase(getBooks.fulfilled, (state, action) => {
                state.loading = false;
                state.books = action.payload.data;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
                state.total = action.payload.total;
            })
            .addCase(getBooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getBookById.pending, (state) => {
                state.loading = true;
            })
            .addCase(getBookById.fulfilled, (state, action) => {
                state.loading = false;
                state.book = action.payload;
            })
            .addCase(getBookById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteBook.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteBook.fulfilled, (state, action) => {
                state.loading = false;
                state.books = state.books.filter((book) => book._id !== action.payload);
                state.total -= 1;
            })
            .addCase(deleteBook.rejected, (state, action) => {
                state.loading = false;
            })
            .addCase(createBook.pending, (state) => {
                state.loading = true;
            })
            .addCase(createBook.fulfilled, (state, action) => {
                state.loading = false;
                state.books.push(action.payload);
            })
            .addCase(createBook.rejected, (state, action) => {
                state.loading = false;
            })
            .addCase(updateBook.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateBook.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.books.findIndex((book) => book._id === action.payload._id);
                if (index !== -1) {
                    state.books[index] = action.payload;
                }
                state.book = action.payload;
            })
            .addCase(updateBook.rejected, (state, action) => {
                state.loading = false;
            });
    },
});

export const { clearBook } = bookSlice.actions;
export default bookSlice.reducer;
