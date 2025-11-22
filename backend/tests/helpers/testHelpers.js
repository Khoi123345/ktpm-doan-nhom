import User from '../src/models/User.js';
import Book from '../src/models/Book.js';
import Category from '../src/models/Category.js';
import generateToken from '../src/utils/generateToken.js';

/**
 * Create a test user
 */
export const createTestUser = async (userData = {}) => {
    const defaultUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',
        role: 'user',
    };

    const user = await User.create({ ...defaultUser, ...userData });
    return user;
};

/**
 * Create a test admin
 */
export const createTestAdmin = async () => {
    const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
    });
    return admin;
};

/**
 * Generate auth token for user
 */
export const getAuthToken = (userId) => {
    return generateToken(userId);
};

/**
 * Create a test category
 */
export const createTestCategory = async (categoryData = {}) => {
    const defaultCategory = {
        name: 'Test Category',
        description: 'Test category description',
    };

    const category = await Category.create({ ...defaultCategory, ...categoryData });
    return category;
};

/**
 * Create a test book
 */
export const createTestBook = async (bookData = {}) => {
    let category = bookData.category;

    if (!category) {
        category = await createTestCategory();
    }

    const defaultBook = {
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test book description',
        price: 100000,
        discountPrice: 80000,
        category: category._id,
        images: ['https://via.placeholder.com/150'],
        stock: 10,
        ISBN: '1234567890',
        publisher: 'Test Publisher',
        pages: 200,
        language: 'Tiếng Việt',
    };

    const book = await Book.create({ ...defaultBook, ...bookData });
    return book;
};

/**
 * Create multiple test books
 */
export const createTestBooks = async (count = 5) => {
    const category = await createTestCategory();
    const books = [];

    for (let i = 0; i < count; i++) {
        const book = await createTestBook({
            title: `Test Book ${i + 1}`,
            category: category._id,
        });
        books.push(book);
    }

    return books;
};
