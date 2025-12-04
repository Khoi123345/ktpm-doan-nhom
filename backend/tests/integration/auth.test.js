import request from 'supertest';
import app from '../../src/app.js';
import { connect, close, clear } from './setup.js';
import fs from 'fs';

beforeAll(async () => await connect(), 30000);
afterEach(async () => await clear());
afterAll(async () => await close());

describe('Auth Integration Tests', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123!'
                });

            if (res.statusCode !== 201) {
                console.error('Register failed:', JSON.stringify(res.body, null, 2));
                fs.writeFileSync('integration_error.log', JSON.stringify(res.body, null, 2));
            }

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.email).toBe('test@example.com');
        });

        it('should not register user with existing email', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123!'
                });

            // Second registration with same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Another User',
                    email: 'test@example.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Email đã được sử dụng');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123!'
                });
        });

        it('should login with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
        });

        it('should not login with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Mật khẩu không đúng');
        });
    });

    describe('GET /api/auth/profile', () => {
        it('should get user profile with valid token', async () => {
            // Register and get token
            const registerRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123!'
                });

            const token = registerRes.body.data.token;

            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.email).toBe('test@example.com');
        });

        it('should not access profile without token', async () => {
            const res = await request(app)
                .get('/api/auth/profile');

            expect(res.statusCode).toBe(401);
        });
    });
});
