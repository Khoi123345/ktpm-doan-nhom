import request from 'supertest';
import app from '../../src/app.js';
import { connect, close, clear } from './setup.js';
import User from '../../src/models/User.js';
import Category from '../../src/models/Category.js';
import generateToken from '../../src/utils/generateToken.js';

beforeAll(async () => await connect(), 30000);
afterEach(async () => await clear());
afterAll(async () => await close());

describe('Book Integration Tests', () => {
    let adminToken;
    let userToken;
    let categoryId;

    beforeEach(async () => {
        // Create Admin User
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'Password123!',
            role: 'admin'
        });
        adminToken = generateToken(admin._id);

        // Create Regular User
        const user = await User.create({
            name: 'Regular User',
            email: 'user@example.com',
            password: 'Password123!',
        });
        userToken = generateToken(user._id);

        // Create Category
        const category = await Category.create({
            name: 'Fiction',
            description: 'Fiction books'
        });
        categoryId = category._id;
    });

    describe('GET /api/books', () => {
        it('should return empty list when no books', async () => {
            const res = await request(app).get('/api/books');
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual([]);
        });

        it('should return list of books', async () => {
            // Create a book first
            await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Test Book',
                    author: 'Test Author',
                    price: 100000,
                    category: categoryId,
                    stock: 10,
                    description: 'Test Description',
                    images: ['image1.jpg']
                });

            const res = await request(app).get('/api/books');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].title).toBe('Test Book');
        });
    });

    describe('POST /api/books', () => {
        it('should create a book as admin', async () => {
            const res = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'New Book',
                    author: 'New Author',
                    price: 200000,
                    category: categoryId,
                    stock: 5,
                    description: 'New Description',
                    images: ['image2.jpg']
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.title).toBe('New Book');
        });

        it('should not create a book as regular user', async () => {
            const res = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'New Book',
                    author: 'New Author',
                    price: 200000
                });

            expect(res.statusCode).toBe(403); // Assuming 403 for forbidden
        });
    });

    describe('PUT /api/books/:id', () => {
        it('should update a book as admin', async () => {
            // Create book
            const createRes = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Old Title',
                    author: 'Old Author',
                    price: 100000,
                    category: categoryId,
                    stock: 10,
                    description: 'Desc',
                    images: ['img.jpg']
                });

            const bookId = createRes.body.data._id;

            const res = await request(app)
                .put(`/api/books/${bookId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Updated Title'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.title).toBe('Updated Title');
        });
    });

    describe('DELETE /api/books/:id', () => {
        it('should delete a book as admin', async () => {
            // Create book
            const createRes = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'To Delete',
                    author: 'Author',
                    price: 100000,
                    category: categoryId,
                    stock: 10,
                    description: 'Desc',
                    images: ['img.jpg']
                });

            const bookId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/books/${bookId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Đã xóa sách');
        });
    });
});
