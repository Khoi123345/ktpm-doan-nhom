import dotenv from 'dotenv';

dotenv.config();

export default {
    // Base URLs
    baseUrl: process.env.BASE_URL || 'http://frontend:3000',
    adminUrl: process.env.ADMIN_URL || 'http://frontend:3001',
    apiUrl: process.env.API_URL || 'http://backend:5000/api',

    // Timeouts
    defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT) || 10000,
    pageLoadTimeout: parseInt(process.env.PAGE_LOAD_TIMEOUT) || 30000,

    // Browser Configuration
    headless: process.env.HEADLESS !== 'false',
    windowSize: {
        width: 1920,
        height: 1080
    },

    // Test User Credentials
    testUser: {
        email: process.env.TEST_USER_EMAIL || 'customer@test.com',
        password: process.env.TEST_USER_PASSWORD || 'Test123!',
        name: process.env.TEST_USER_NAME || 'Test Customer'
    },

    // Admin Credentials
    admin: {
        email: process.env.ADMIN_EMAIL || 'admin@bookstore.com',
        password: process.env.ADMIN_PASSWORD || 'Test123!'
    },

    // Screenshot Configuration
    screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false',
    screenshotDir: 'reports/screenshots'
};
