import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import orderRoutes from '../src/routes/orderRoutes.js';
import { notFound, errorHandler } from '../src/middlewares/errorMiddleware.js';
import {
    createTestUser,
    createTestAdmin,
    createTestBook,
    getAuthToken,
} from './helpers/testHelpers.js';
import '../tests/setup.js';

dotenv.config();

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);
app.use(notFound);
app.use(errorHandler);

describe('Order Endpoints', () => {
    let user;
    let token;
    let book;

    beforeEach(async () => {
        user = await createTestUser();
        token = getAuthToken(user._id);
        book = await createTestBook({ stock: 10 });
    });

    describe('POST /api/orders', () => {
        it('should create new order', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    orderItems: [
                        {
                            book: book._id,
                            title: book.title,
                            image: book.images[0],
                            price: book.price,
                            quantity: 2,
                        },
                    ],
                    shippingAddress: {
                        fullName: 'Test User',
                        phone: '0123456789',
                        address: '123 Test St',
                        city: 'Ho Chi Minh',
                        district: 'District 1',
                    },
                    paymentMethod: 'COD',
                    itemsPrice: book.price * 2,
                    shippingPrice: 30000,
                    totalPrice: book.price * 2 + 30000,
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.orderItems).toHaveLength(1);
            expect(res.body.data.status).toBe('pending');
        });

        it('should not create order with empty items', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    orderItems: [],
                    shippingAddress: {
                        fullName: 'Test User',
                        phone: '0123456789',
                        address: '123 Test St',
                        city: 'Ho Chi Minh',
                        district: 'District 1',
                    },
                    paymentMethod: 'COD',
                    itemsPrice: 0,
                    shippingPrice: 30000,
                    totalPrice: 30000,
                });

            expect(res.statusCode).toBe(400);
        });

        it('should not create order without authentication', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({
                    orderItems: [
                        {
                            book: book._id,
                            title: book.title,
                            image: book.images[0],
                            price: book.price,
                            quantity: 2,
                        },
                    ],
                    shippingAddress: {
                        fullName: 'Test User',
                        phone: '0123456789',
                        address: '123 Test St',
                        city: 'Ho Chi Minh',
                        district: 'District 1',
                    },
                    paymentMethod: 'COD',
                    itemsPrice: book.price * 2,
                    shippingPrice: 30000,
                    totalPrice: book.price * 2 + 30000,
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/orders/myorders', () => {
        it('should get user orders', async () => {
            // Create an order first
            await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    orderItems: [
                        {
                            book: book._id,
                            title: book.title,
                            image: book.images[0],
                            price: book.price,
                            quantity: 1,
                        },
                    ],
                    shippingAddress: {
                        fullName: 'Test User',
                        phone: '0123456789',
                        address: '123 Test St',
                        city: 'Ho Chi Minh',
                        district: 'District 1',
                    },
                    paymentMethod: 'COD',
                    itemsPrice: book.price,
                    shippingPrice: 30000,
                    totalPrice: book.price + 30000,
                });

            const res = await request(app)
                .get('/api/orders/myorders')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
        });

        it('should not get orders without authentication', async () => {
            const res = await request(app).get('/api/orders/myorders');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/orders/:id', () => {
        it('should get order by id', async () => {
            // Create an order first
            const createRes = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    orderItems: [
                        {
                            book: book._id,
                            title: book.title,
                            image: book.images[0],
                            price: book.price,
                            quantity: 1,
                        },
                    ],
                    shippingAddress: {
                        fullName: 'Test User',
                        phone: '0123456789',
                        address: '123 Test St',
                        city: 'Ho Chi Minh',
                        district: 'District 1',
                    },
                    paymentMethod: 'COD',
                    itemsPrice: book.price,
                    shippingPrice: 30000,
                    totalPrice: book.price + 30000,
                });

            const orderId = createRes.body.data._id;

            const res = await request(app)
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(orderId);
        });
    });

    describe('GET /api/orders (Admin)', () => {
        it('should get all orders as admin', async () => {
            const admin = await createTestAdmin();
            const adminToken = getAuthToken(admin._id);

            // Create some orders
            await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    orderItems: [
                        {
                            book: book._id,
                            title: book.title,
                            image: book.images[0],
                            price: book.price,
                            quantity: 1,
                        },
                    ],
                    shippingAddress: {
                        fullName: 'Test User',
                        phone: '0123456789',
                        address: '123 Test St',
                        city: 'Ho Chi Minh',
                        district: 'District 1',
                    },
                    paymentMethod: 'COD',
                    itemsPrice: book.price,
                    shippingPrice: 30000,
                    totalPrice: book.price + 30000,
                });

            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should not get all orders as regular user', async () => {
            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PUT /api/orders/:id/status (Admin)', () => {
        it('should update order status as admin', async () => {
            const admin = await createTestAdmin();
            const adminToken = getAuthToken(admin._id);

            // Create an order
            const createRes = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    orderItems: [
                        {
                            book: book._id,
                            title: book.title,
                            image: book.images[0],
                            price: book.price,
                            quantity: 1,
                        },
                    ],
                    shippingAddress: {
                        fullName: 'Test User',
                        phone: '0123456789',
                        address: '123 Test St',
                        city: 'Ho Chi Minh',
                        district: 'District 1',
                    },
                    paymentMethod: 'COD',
                    itemsPrice: book.price,
                    shippingPrice: 30000,
                    totalPrice: book.price + 30000,
                });

            const orderId = createRes.body.data._id;

            const res = await request(app)
                .put(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'processing',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.status).toBe('processing');
        });

        it('should not update order status as regular user', async () => {
            // Create an order
            const createRes = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    orderItems: [
                        {
                            book: book._id,
                            title: book.title,
                            image: book.images[0],
                            price: book.price,
                            quantity: 1,
                        },
                    ],
                    shippingAddress: {
                        fullName: 'Test User',
                        phone: '0123456789',
                        address: '123 Test St',
                        city: 'Ho Chi Minh',
                        district: 'District 1',
                    },
                    paymentMethod: 'COD',
                    itemsPrice: book.price,
                    shippingPrice: 30000,
                    totalPrice: book.price + 30000,
                });

            const orderId = createRes.body.data._id;

            const res = await request(app)
                .put(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    status: 'processing',
                });

            expect(res.statusCode).toBe(403);
        });
    });
});
