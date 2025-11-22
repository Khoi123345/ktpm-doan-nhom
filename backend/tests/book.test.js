import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import bookRoutes from '../src/routes/bookRoutes.js';
import { notFound, errorHandler } from '../src/middlewares/errorMiddleware.js';
import {
    createTestUser,
    createTestAdmin,
    createTestBook,
    createTestBooks,
    createTestCategory,
    getAuthToken,
} from './helpers/testHelpers.js';
import '../tests/setup.js';

dotenv.config();

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/books', bookRoutes);
app.use(notFound);
app.use(errorHandler);

describe('Book Endpoints', () => {
    describe('GET /api/books', () => {
        it('should get all books', async () => {
            await createTestBooks(5);

            const res = await request(app).get('/api/books');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(5);
            expect(res.body.total).toBe(5);
        });

        it('should filter books by keyword', async () => {
            await createTestBook({ title: 'JavaScript Guide' });
            await createTestBook({ title: 'Python Basics' });

            const res = await request(app).get('/api/books?keyword=JavaScript');

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].title).toContain('JavaScript');
        });

        it('should filter books by category', async () => {
            const category1 = await createTestCategory({ name: 'Programming' });
            const category2 = await createTestCategory({ name: 'Fiction' });

            await createTestBook({ category: category1._id });
            await createTestBook({ category: category2._id });

            const res = await request(app).get(`/api/books?category=${category1._id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });

        it('should paginate results', async () => {
            await createTestBooks(15);

            const res = await request(app).get('/api/books?page=2');

            expect(res.statusCode).toBe(200);
            expect(res.body.page).toBe(2);
            expect(res.body.data.length).toBeLessThanOrEqual(12);
        });
    });

    describe('GET /api/books/:id', () => {
        it('should get single book by id', async () => {
            const book = await createTestBook({ title: 'Specific Book' });

            const res = await request(app).get(`/api/books/${book._id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Specific Book');
        });

        it('should return 404 for non-existent book', async () => {
            const res = await request(app).get('/api/books/507f1f77bcf86cd799439011');

            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/books', () => {
        it('should create book as admin', async () => {
            const admin = await createTestAdmin();
            const token = getAuthToken(admin._id);
            const category = await createTestCategory();

            const res = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'New Book',
                    author: 'New Author',
                    description: 'New book description',
                    price: 150000,
                    category: category._id,
                    stock: 20,
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('New Book');
        });

        it('should not create book without admin role', async () => {
            const user = await createTestUser();
            const token = getAuthToken(user._id);
            const category = await createTestCategory();

            const res = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'New Book',
                    author: 'New Author',
                    description: 'New book description',
                    price: 150000,
                    category: category._id,
                    stock: 20,
                });

            expect(res.statusCode).toBe(403);
        });

        it('should not create book without authentication', async () => {
            const category = await createTestCategory();

            const res = await request(app)
                .post('/api/books')
                .send({
                    title: 'New Book',
                    author: 'New Author',
                    description: 'New book description',
                    price: 150000,
                    category: category._id,
                    stock: 20,
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/books/:id', () => {
        it('should update book as admin', async () => {
            const admin = await createTestAdmin();
            const token = getAuthToken(admin._id);
            const book = await createTestBook();

            const res = await request(app)
                .put(`/api/books/${book._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Updated Title',
                    price: 200000,
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.title).toBe('Updated Title');
            expect(res.body.data.price).toBe(200000);
        });

        it('should not update book without admin role', async () => {
            const user = await createTestUser();
            const token = getAuthToken(user._id);
            const book = await createTestBook();

            const res = await request(app)
                .put(`/api/books/${book._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Updated Title',
                });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('DELETE /api/books/:id', () => {
        it('should delete book as admin', async () => {
            const admin = await createTestAdmin();
            const token = getAuthToken(admin._id);
            const book = await createTestBook();

            const res = await request(app)
                .delete(`/api/books/${book._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should not delete book without admin role', async () => {
            const user = await createTestUser();
            const token = getAuthToken(user._id);
            const book = await createTestBook();

            const res = await request(app)
                .delete(`/api/books/${book._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/books/top', () => {
        it('should get top rated books', async () => {
            await createTestBook({ title: 'Top Book', rating: 5 });
            await createTestBook({ title: 'Low Book', rating: 2 });

            const res = await request(app).get('/api/books/top');

            expect(res.statusCode).toBe(200);
            expect(res.body.data[0].rating).toBeGreaterThanOrEqual(res.body.data[1].rating);
        });
    });
});
