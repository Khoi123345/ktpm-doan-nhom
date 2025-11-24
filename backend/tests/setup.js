import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';

// Connect to test database before all tests
beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/bookstore-test';

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to test database');
});

// Clear all collections after each test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// Disconnect after all tests
afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('✅ Disconnected from test database');
});
