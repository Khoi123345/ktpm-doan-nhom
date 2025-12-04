import request from 'supertest';
import app from '../../src/app.js';
import { connect, close, clear } from './setup.js';
import User from '../../src/models/User.js';
import Book from '../../src/models/Book.js';
import Category from '../../src/models/Category.js';
import Cart from '../../src/models/Cart.js';
import generateToken from '../../src/utils/generateToken.js';

beforeAll(async () => await connect(), 30000);
afterEach(async () => await clear());
afterAll(async () => await close());

describe('Cart Integration Tests', () => {
    let userToken;
    let userId;
    let bookId, book2Id;

    beforeEach(async () => {
        // Create User
        const user = await User.create({
            name: 'Cart User',
            email: 'cart@example.com',
            password: 'Password123!',
        });
        userToken = generateToken(user._id);
        userId = user._id;

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
    });

    describe('POST /api/cart', () => {
        it('should add item to cart', async () => {
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    bookId: bookId,
                    quantity: 2
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.items).toHaveLength(1);
            expect(res.body.data.items[0].book._id).toBe(bookId.toString());
            expect(res.body.data.items[0].quantity).toBe(2);
        });

        it('should fail if quantity exceeds stock', async () => {
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    bookId: bookId,
                    quantity: 11 // Stock is 10
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/không đủ/i);
        });

        it('should increment quantity if item already in cart', async () => {
            // Add first time
            await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ bookId: bookId, quantity: 2 });

            // Add second time
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ bookId: bookId, quantity: 3 });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.items[0].quantity).toBe(5);
        });
    });

    describe('PUT /api/cart/:bookId', () => {
        beforeEach(async () => {
            // Add item to cart first
            await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ bookId: bookId, quantity: 2 });
        });

        it('should update item quantity', async () => {
            const res = await request(app)
                .put(`/api/cart/${bookId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ quantity: 5 });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.items[0].quantity).toBe(5);
        });

        it('should fail update if quantity exceeds stock', async () => {
            const res = await request(app)
                .put(`/api/cart/${bookId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ quantity: 11 });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('DELETE /api/cart/:bookId', () => {
        beforeEach(async () => {
            // Add item to cart first
            await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ bookId: bookId, quantity: 2 });
        });

        it('should remove item from cart', async () => {
            const res = await request(app)
                .delete(`/api/cart/${bookId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.items).toHaveLength(0);
        });
    });

    describe('DELETE /api/cart', () => {
        beforeEach(async () => {
            // Add items to cart first
            await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ bookId: bookId, quantity: 2 });

            await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ bookId: book2Id, quantity: 1 });
        });

        it('should clear cart', async () => {
            const res = await request(app)
                .delete('/api/cart')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.items).toHaveLength(0);
        });
    });
});
