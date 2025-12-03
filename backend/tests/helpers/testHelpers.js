import { jest } from '@jest/globals';

/**
 * Test Helper Functions
 * Reusable mock factories for unit testing
 */

/**
 * Create a mock Express request object
 */
export const mockRequest = (options = {}) => {
    return {
        body: options.body || {},
        params: options.params || {},
        query: options.query || {},
        headers: options.headers || {},
        user: options.user || null,
        files: options.files || null,
        file: options.file || null,
        ...options
    };
};

/**
 * Create a mock Express response object
 */
export const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.sendStatus = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    return res;
};

/**
 * Create a mock Express next function
 */
export const mockNext = () => jest.fn();

/**
 * Create a mock user object
 */
export const mockUser = (overrides = {}) => {
    return {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        avatar: 'https://example.com/avatar.jpg',
        phone: '0123456789',
        addresses: [],
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides
    };
};

/**
 * Create a mock book object
 */
export const mockBook = (overrides = {}) => {
    const book = {
        _id: '507f1f77bcf86cd799439012',
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test description',
        price: 100000,
        discountPrice: 80000,
        category: '507f1f77bcf86cd799439013',
        images: ['https://example.com/book.jpg'],
        stock: 10,
        ISBN: '1234567890',
        publisher: 'Test Publisher',
        publishedDate: new Date('2024-01-01'),
        pages: 300,
        language: 'Tiếng Việt',
        rating: 4.5,
        numReviews: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides
    };
    book.save = jest.fn().mockResolvedValue(book);
    book.deleteOne = jest.fn().mockResolvedValue(true);
    return book;
};

/**
 * Create a mock cart object
 */
export const mockCart = (overrides = {}) => {
    return {
        _id: '507f1f77bcf86cd799439014',
        user: '507f1f77bcf86cd799439011',
        items: [],
        totalItems: 0,
        totalPrice: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(this),
        populate: jest.fn().mockResolvedValue(this),
        ...overrides
    };
};

/**
 * Create a mock order object
 */
export const mockOrder = (overrides = {}) => {
    const order = {
        _id: '507f1f77bcf86cd799439015',
        user: '507f1f77bcf86cd799439011',
        orderItems: [],
        shippingAddress: {
            fullName: 'Test User',
            phone: '0123456789',
            address: '123 Test St',
            city: 'Test City',
            district: 'Test District',
            ward: 'Test Ward'
        },
        paymentMethod: 'COD',
        itemsPrice: 0,
        shippingPrice: 30000,
        discountAmount: 0,
        totalPrice: 30000,
        isPaid: false,
        isDelivered: false,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides
    };
    order.save = jest.fn().mockResolvedValue(order);
    order.populate = jest.fn().mockResolvedValue(order);
    return order;
};

/**
 * Create a mock category object
 */
export const mockCategory = (overrides = {}) => {
    return {
        _id: '507f1f77bcf86cd799439013',
        name: 'Test Category',
        description: 'Test category description',
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(this),
        deleteOne: jest.fn().mockResolvedValue(true),
        ...overrides
    };
};

/**
 * Create a mock coupon object
 */
export const mockCoupon = (overrides = {}) => {
    return {
        _id: '507f1f77bcf86cd799439016',
        code: 'TESTCODE',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 100000,
        maxDiscount: 50000,
        usageLimit: 100,
        usedCount: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(this),
        deleteOne: jest.fn().mockResolvedValue(true),
        ...overrides
    };
};

/**
 * Create a mock review object
 */
export const mockReview = (overrides = {}) => {
    return {
        _id: '507f1f77bcf86cd799439017',
        user: '507f1f77bcf86cd799439011',
        book: '507f1f77bcf86cd799439012',
        rating: 5,
        comment: 'Great book!',
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(this),
        deleteOne: jest.fn().mockResolvedValue(true),
        ...overrides
    };
};
