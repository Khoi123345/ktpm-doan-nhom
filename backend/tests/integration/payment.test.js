import { jest } from '@jest/globals';
import request from 'supertest';
import { connect, close, clear } from './setup.js';
import User from '../../src/models/User.js';
import Order from '../../src/models/Order.js';
import Book from '../../src/models/Book.js';
import Category from '../../src/models/Category.js';
import generateToken from '../../src/utils/generateToken.js';

const app = (await import('../../src/app.js')).default;

beforeAll(async () => await connect(), 30000);
afterEach(async () => {
    await clear();
    jest.clearAllMocks();
});
afterAll(async () => await close());

describe('Payment Integration Tests', () => {
    let userToken;
    let orderId;

    beforeEach(async () => {
        // Create User
        const user = await User.create({
            name: 'Payment User',
            email: 'payment@example.com',
            password: 'Password123!',
        });
        userToken = generateToken(user._id);

        // Create Category & Book
        const category = await Category.create({ name: 'Fiction' });
        const book = await Book.create({
            title: 'Test Book',
            author: 'Author',
            price: 100000,
            category: category._id,
            stock: 10,
            description: 'Desc',
            images: ['img.jpg']
        });

        // Create Order
        const order = await Order.create({
            user: user._id,
            orderItems: [{
                book: book._id,
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
            paymentMethod: 'MoMo',
            itemsPrice: 100000,
            shippingPrice: 30000,
            totalPrice: 130000
        });
        orderId = order._id;
    });

    describe('POST /api/payment/momo/create', () => {
        it('should create payment url successfully', async () => {
            // Controller calls MoMo API directly, so we test the real response
            const res = await request(app)
                .post('/api/payment/momo/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ orderId });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.paymentUrl).toContain('https://test-payment.momo.vn');
            expect(res.body.data.paymentUrl).toBeTruthy();
        });

        it('should fail if order not found', async () => {
            const res = await request(app)
                .post('/api/payment/momo/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ orderId: '000000000000000000000000' });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/payment/momo/ipn', () => {
        it('should update order status on successful IPN', async () => {
            const res = await request(app)
                .post('/api/payment/momo/ipn')
                .send({
                    partnerCode: 'MOMO',
                    orderId: `${orderId}_${Date.now()}`,
                    resultCode: 0,
                    extraData: JSON.stringify({ dbOrderId: orderId.toString() })
                });

            expect(res.statusCode).toBe(204);

            const updatedOrder = await Order.findById(orderId);
            expect(updatedOrder.isPaid).toBe(true);
            expect(updatedOrder.status).toBe('confirmed');
        });

        it('should fail if order ID cannot be determined', async () => {
            const res = await request(app)
                .post('/api/payment/momo/ipn')
                .send({
                    partnerCode: 'MOMO',
                    orderId: 'invalid',
                    resultCode: 0
                });

            expect(res.statusCode).toBe(500);
        });
    });
});
