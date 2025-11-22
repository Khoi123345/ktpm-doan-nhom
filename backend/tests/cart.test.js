import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import cartRoutes from '../src/routes/cartRoutes.js';
import { notFound, errorHandler } from '../src/middlewares/errorMiddleware.js';
import { createTestUser, createTestBook, getAuthToken } from './helpers/testHelpers.js';
import '../tests/setup.js';

dotenv.config();

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/cart', cartRoutes);
app.use(notFound);
app.use(errorHandler);

describe('Cart Endpoints', () => {
    let user;
    let token;
    let book;

    beforeEach(async () => {
        user = await createTestUser();
        token = getAuthToken(user._id);
        book = await createTestBook({ stock: 10 });
    });

    describe('GET /api/cart', () => {
        it('should get empty cart for new user', async () => {
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.items).toHaveLength(0);
            expect(res.body.data.totalItems).toBe(0);
        });

        it('should not get cart without authentication', async () => {
            const res = await request(app).get('/api/cart');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/cart', () => {
        it('should add item to cart', async () => {
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: book._id.toString(),
                    quantity: 2,
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.items).toHaveLength(1);
            expect(res.body.data.items[0].quantity).toBe(2);
            expect(res.body.data.totalItems).toBe(2);
        });

        it('should update quantity if item already exists', async () => {
            // Add item first time
            await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: book._id.toString(),
                    quantity: 2,
                });

            // Add same item again
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: book._id.toString(),
                    quantity: 3,
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.items).toHaveLength(1);
            expect(res.body.data.items[0].quantity).toBe(5);
        });

        it('should not add more than available stock', async () => {
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: book._id.toString(),
                    quantity: 20, // More than stock (10)
                });

            expect(res.statusCode).toBe(400);
        });

        it('should not add non-existent book', async () => {
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: '507f1f77bcf86cd799439011',
                    quantity: 1,
                });

            expect(res.statusCode).toBe(404);
        });

        it('should not add without authentication', async () => {
            const res = await request(app)
                .post('/api/cart')
                .send({
                    bookId: book._id.toString(),
                    quantity: 1,
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/cart/:itemId', () => {
        it('should update cart item quantity', async () => {
            // Add item first
            const addRes = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: book._id.toString(),
                    quantity: 2,
                });

            const itemId = addRes.body.data.items[0]._id;

            // Update quantity
            const res = await request(app)
                .put(`/api/cart/${itemId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    quantity: 5,
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.items[0].quantity).toBe(5);
        });

        it('should not update to quantity exceeding stock', async () => {
            // Add item first
            const addRes = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: book._id.toString(),
                    quantity: 2,
                });

            const itemId = addRes.body.data.items[0]._id;

            // Try to update to more than stock
            const res = await request(app)
                .put(`/api/cart/${itemId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    quantity: 20,
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('DELETE /api/cart/:itemId', () => {
        it('should remove item from cart', async () => {
            // Add item first
            const addRes = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: book._id.toString(),
                    quantity: 2,
                });

            const itemId = addRes.body.data.items[0]._id;

            // Remove item
            const res = await request(app)
                .delete(`/api/cart/${itemId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.items).toHaveLength(0);
        });
    });

    describe('DELETE /api/cart', () => {
        it('should clear entire cart', async () => {
            // Add multiple items
            await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: book._id.toString(),
                    quantity: 2,
                });

            const book2 = await createTestBook({ title: 'Book 2' });
            await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: book2._id.toString(),
                    quantity: 1,
                });

            // Clear cart
            const res = await request(app)
                .delete('/api/cart')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.items).toHaveLength(0);
            expect(res.body.data.totalItems).toBe(0);
        });
    });
});
