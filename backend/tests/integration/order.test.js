import request from 'supertest';
import app from '../../src/app.js';
import { connect, close, clear } from './setup.js';
import User from '../../src/models/User.js';
import Book from '../../src/models/Book.js';
import Category from '../../src/models/Category.js';
import Order from '../../src/models/Order.js';
import Coupon from '../../src/models/Coupon.js';
import generateToken from '../../src/utils/generateToken.js';

beforeAll(async () => await connect(), 30000);
afterEach(async () => await clear());
afterAll(async () => await close());

describe('Order Integration Tests', () => {
    let adminToken, userToken, otherUserToken;
    let userId, otherUserId;
    let bookId, book2Id;
    let couponCode = 'TEST10';

    beforeEach(async () => {
        // Create Users
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'Password123!',
            role: 'admin'
        });
        adminToken = generateToken(admin._id);

        const user = await User.create({
            name: 'Regular User',
            email: 'user@example.com',
            password: 'Password123!',
        });
        userToken = generateToken(user._id);
        userId = user._id;

        const otherUser = await User.create({
            name: 'Other User',
            email: 'other@example.com',
            password: 'Password123!',
        });
        otherUserToken = generateToken(otherUser._id);
        otherUserId = otherUser._id;

        // Create Category
        const category = await Category.create({ name: 'Fiction' });

        // Create Books
        const book = await Book.create({
            title: 'Test Book',
            author: 'Author',
            price: 100000,
            category: category._id,
            stock: 10,
            description: 'Desc',
            images: ['img.jpg']
        });
        bookId = book._id;

        const book2 = await Book.create({
            title: 'Test Book 2',
            author: 'Author 2',
            price: 200000,
            category: category._id,
            stock: 5,
            description: 'Desc 2',
            images: ['img2.jpg']
        });
        book2Id = book2._id;

        // Create Coupon
        await Coupon.create({
            code: couponCode,
            discountType: 'fixed',
            discountValue: 10000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            minOrderValue: 50000
        });
    });

    describe('POST /api/orders', () => {
        it('should create order successfully', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    orderItems: [
                        {
                            book: bookId,
                            title: 'Test Book',
                            quantity: 2,
                            price: 100000,
                            image: 'img.jpg'
                        }
                    ],
                    shippingAddress: {
                        fullName: 'Test User',
                        address: '123 Test St',
                        city: 'Test City',
                        district: 'Test District',
                        ward: 'Test Ward',
                        phone: '0123456789'
                    },
                    paymentMethod: 'COD',
                    itemsPrice: 200000,
                    shippingPrice: 30000,
                    totalPrice: 230000
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.user).toBe(userId.toString());
            expect(res.body.data.orderItems).toHaveLength(1);

            // Verify stock is NOT reduced on creation (as per controller logic)
            const book = await Book.findById(bookId);
            expect(book.stock).toBe(10);
        });

        it('should fail if stock is insufficient', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    orderItems: [
                        {
                            book: bookId,
                            title: 'Test Book',
                            quantity: 11, // Stock is 10
                            price: 100000,
                            image: 'img.jpg'
                        }
                    ],
                    shippingAddress: {
                        fullName: 'Test User',
                        address: '123 St',
                        city: 'City',
                        district: 'District',
                        ward: 'Ward',
                        phone: '123'
                    },
                    paymentMethod: 'COD',
                    itemsPrice: 1100000,
                    shippingPrice: 0,
                    totalPrice: 1100000
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/không đủ số lượng/i);
        });
    });

    describe('GET /api/orders/:id', () => {
        let orderId;

        beforeEach(async () => {
            const order = await Order.create({
                user: userId,
                orderItems: [{
                    book: bookId,
                    title: 'Test Book',
                    quantity: 1,
                    price: 100000,
                    image: 'img.jpg'
                }],
                shippingAddress: {
                    fullName: 'Test User',
                    address: '123 St',
                    city: 'City',
                    district: 'District',
                    ward: 'Ward',
                    phone: '123'
                },
                paymentMethod: 'COD',
                itemsPrice: 100000,
                shippingPrice: 30000,
                totalPrice: 130000
            });
            orderId = order._id;
        });

        it('should allow owner to view order', async () => {
            const res = await request(app)
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data._id).toBe(orderId.toString());
        });

        it('should allow admin to view any order', async () => {
            const res = await request(app)
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
        });

        it('should not allow other user to view order', async () => {
            const res = await request(app)
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${otherUserToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PUT /api/orders/:id/status', () => {
        let orderId;

        beforeEach(async () => {
            const order = await Order.create({
                user: userId,
                orderItems: [{
                    book: bookId,
                    title: 'Test Book',
                    quantity: 2, // Will reduce stock by 2
                    price: 100000,
                    image: 'img.jpg'
                }],
                shippingAddress: {
                    fullName: 'Test User',
                    address: '123 St',
                    city: 'City',
                    district: 'District',
                    ward: 'Ward',
                    phone: '123'
                },
                paymentMethod: 'COD',
                itemsPrice: 200000,
                shippingPrice: 30000,
                totalPrice: 230000,
                status: 'pending'
            });
            orderId = order._id;
        });

        it('should reduce stock when confirmed', async () => {
            const res = await request(app)
                .put(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'confirmed' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.status).toBe('confirmed');

            // Verify stock reduced: 10 - 2 = 8
            const book = await Book.findById(bookId);
            expect(book.stock).toBe(8);
        });

        it('should restore stock when cancelled from confirmed', async () => {
            // First confirm it
            await request(app)
                .put(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'confirmed' });

            // Then cancel it
            const res = await request(app)
                .put(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'cancelled' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.status).toBe('cancelled');

            // Verify stock restored: 8 + 2 = 10
            const book = await Book.findById(bookId);
            expect(book.stock).toBe(10);
        });
    });
});
