import request from 'supertest';
import app from '../../src/app.js';
import { connect, close, clear } from './setup.js';
import User from '../../src/models/User.js';
import generateToken from '../../src/utils/generateToken.js';

beforeAll(async () => await connect(), 30000);
afterEach(async () => await clear());
afterAll(async () => await close());

describe('User Integration Tests', () => {
    let adminToken, userToken;
    let userId;

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
        userId = user._id;
    });

    describe('GET /api/users', () => {
        it('should allow admin to list users', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(2); // Admin + User
        });

        it('should not allow non-admin to list users', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PUT /api/users/:id/lock', () => {
        it('should allow admin to lock user', async () => {
            const res = await request(app)
                .put(`/api/users/${userId}/lock`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.isLocked).toBe(true);
            expect(res.body.message).toBe('Đã khóa tài khoản');
        });

        it('should allow admin to unlock user', async () => {
            // Lock first
            await request(app)
                .put(`/api/users/${userId}/lock`)
                .set('Authorization', `Bearer ${adminToken}`);

            // Unlock
            const res = await request(app)
                .put(`/api/users/${userId}/lock`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.isLocked).toBe(false);
            expect(res.body.message).toBe('Đã mở khóa tài khoản');
        });

        it('should prevent locking admin account', async () => {
            const admin = await User.findOne({ email: 'admin@example.com' });
            const res = await request(app)
                .put(`/api/users/${admin._id}/lock`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Không thể khóa tài khoản admin');
        });
    });

    describe('PUT /api/users/change-password', () => {
        it('should allow user to change password', async () => {
            const res = await request(app)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    oldPassword: 'Password123!',
                    newPassword: 'NewPassword123!'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Đổi mật khẩu thành công');

            // Verify login with new password
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'user@example.com',
                    password: 'NewPassword123!'
                });
            expect(loginRes.statusCode).toBe(200);
        });

        it('should fail if old password is incorrect', async () => {
            const res = await request(app)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    oldPassword: 'WrongPassword',
                    newPassword: 'NewPassword123!'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Mật khẩu cũ không đúng');
        });

        it('should fail if new password is weak', async () => {
            const res = await request(app)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    oldPassword: 'Password123!',
                    newPassword: 'weak'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should allow admin to delete user', async () => {
            const res = await request(app)
                .delete(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Đã xóa người dùng');

            const deletedUser = await User.findById(userId);
            expect(deletedUser).toBeNull();
        });

        it('should prevent deleting admin account', async () => {
            const admin = await User.findOne({ email: 'admin@example.com' });
            const res = await request(app)
                .delete(`/api/users/${admin._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Không thể xóa tài khoản admin');
        });
    });
});
