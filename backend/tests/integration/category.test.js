import request from 'supertest';
import app from '../../src/app.js';
import { connect, close, clear } from './setup.js';
import User from '../../src/models/User.js';
import Category from '../../src/models/Category.js';
import generateToken from '../../src/utils/generateToken.js';

beforeAll(async () => await connect(), 30000);
afterEach(async () => await clear());
afterAll(async () => await close());

describe('Category Integration Tests', () => {
    let adminToken, userToken;

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
    });

    describe('POST /api/categories', () => {
        it('should allow admin to create category', async () => {
            const res = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Fiction',
                    description: 'Fictional books',
                    image: 'image.jpg'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.name).toBe('Fiction');
        });

        it('should not allow non-admin to create category', async () => {
            const res = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    name: 'Non-Fiction',
                    description: 'Non-fictional books'
                });

            expect(res.statusCode).toBe(403);
        });

        it('should prevent duplicate category names', async () => {
            await Category.create({ name: 'Fiction' });

            const res = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Fiction',
                    description: 'Duplicate'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/đã tồn tại/i);
        });
    });

    describe('GET /api/categories', () => {
        beforeEach(async () => {
            await Category.create({ name: 'Category 1' });
            await Category.create({ name: 'Category 2' });
        });

        it('should get all categories', async () => {
            const res = await request(app)
                .get('/api/categories');

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(2);
        });
    });

    describe('PUT /api/categories/:id', () => {
        let categoryId;

        beforeEach(async () => {
            const category = await Category.create({ name: 'Old Name' });
            categoryId = category._id;
        });

        it('should allow admin to update category', async () => {
            const res = await request(app)
                .put(`/api/categories/${categoryId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'New Name' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.name).toBe('New Name');
        });
    });

    describe('DELETE /api/categories/:id', () => {
        let categoryId;

        beforeEach(async () => {
            const category = await Category.create({ name: 'To Delete' });
            categoryId = category._id;
        });

        it('should allow admin to delete category', async () => {
            const res = await request(app)
                .delete(`/api/categories/${categoryId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            const deleted = await Category.findById(categoryId);
            expect(deleted).toBeNull();
        });
    });
});
