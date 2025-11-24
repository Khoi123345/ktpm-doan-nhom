import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from '../src/routes/authRoutes.js';
import { notFound, errorHandler } from '../src/middlewares/errorMiddleware.js';
import { createTestUser, getAuthToken } from './helpers/testHelpers.js';
import '../tests/setup.js';

dotenv.config();

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);

describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New User',
                    email: 'newuser@example.com',
                    password: '123456',
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.email).toBe('newuser@example.com');
            expect(res.body.data.name).toBe('New User');
        });

        it('should not register user with duplicate email', async () => {
            await createTestUser({ email: 'duplicate@example.com' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate User',
                    email: 'duplicate@example.com',
                    password: '123456',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBeUndefined();
        });

        it('should not register user without required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Incomplete User',
                });

            expect(res.statusCode).toBe(500);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with correct credentials', async () => {
            await createTestUser({
                email: 'login@example.com',
                password: '123456',
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: '123456',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.email).toBe('login@example.com');
        });

        it('should not login with wrong password', async () => {
            await createTestUser({
                email: 'wrongpass@example.com',
                password: '123456',
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrongpass@example.com',
                    password: 'wrongpassword',
                });

            expect(res.statusCode).toBe(401);
        });

        it('should not login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'notexist@example.com',
                    password: '123456',
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/auth/profile', () => {
        it('should get user profile with valid token', async () => {
            const user = await createTestUser();
            const token = getAuthToken(user._id);

            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe(user.email);
        });

        it('should not get profile without token', async () => {
            const res = await request(app).get('/api/auth/profile');

            expect(res.statusCode).toBe(401);
        });

        it('should not get profile with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalidtoken');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/auth/profile', () => {
        it('should update user profile', async () => {
            const user = await createTestUser();
            const token = getAuthToken(user._id);

            const res = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Name',
                    phone: '0123456789',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Updated Name');
            expect(res.body.data.phone).toBe('0123456789');
        });

        it('should not update profile without token', async () => {
            const res = await request(app)
                .put('/api/auth/profile')
                .send({
                    name: 'Updated Name',
                });

            expect(res.statusCode).toBe(401);
        });
    });
});
