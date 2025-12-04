import request from 'supertest';
import app from '../../src/app.js';
import { connect, close, clear } from './setup.js';
import User from '../../src/models/User.js';
import Coupon from '../../src/models/Coupon.js';
import generateToken from '../../src/utils/generateToken.js';

beforeAll(async () => await connect(), 30000);
afterEach(async () => await clear());
afterAll(async () => await close());

describe('Coupon Integration Tests', () => {
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

    describe('POST /api/coupons', () => {
        it('should allow admin to create coupon', async () => {
            const res = await request(app)
                .post('/api/coupons')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    code: 'TEST10',
                    description: 'Test Coupon',
                    discountType: 'percentage',
                    discountValue: 10,
                    minOrderValue: 100000,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                    usageLimit: 100
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.code).toBe('TEST10');
        });

        it('should not allow non-admin to create coupon', async () => {
            const res = await request(app)
                .post('/api/coupons')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    code: 'TEST10',
                    discountType: 'percentage',
                    discountValue: 10,
                    startDate: new Date(),
                    endDate: new Date()
                });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('POST /api/coupons/validate', () => {
        beforeEach(async () => {
            await Coupon.create({
                code: 'VALID10',
                discountType: 'percentage',
                discountValue: 10,
                minOrderValue: 100000,
                startDate: new Date(),
                endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                usageLimit: 100
            });

            await Coupon.create({
                code: 'EXPIRED',
                discountType: 'fixed',
                discountValue: 50000,
                startDate: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
                endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                minOrderValue: 0
            });
        });

        it('should validate valid coupon', async () => {
            const res = await request(app)
                .post('/api/coupons/validate')
                .send({
                    code: 'VALID10',
                    orderValue: 200000
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.discountAmount).toBe(20000); // 10% of 200000
        });

        it('should fail if order value is too low', async () => {
            const res = await request(app)
                .post('/api/coupons/validate')
                .send({
                    code: 'VALID10',
                    orderValue: 50000 // Min is 100000
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/tối thiểu/i);
        });

        it('should fail if coupon is expired', async () => {
            const res = await request(app)
                .post('/api/coupons/validate')
                .send({
                    code: 'EXPIRED',
                    orderValue: 100000
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/hết hạn/i);
        });
    });

    describe('DELETE /api/coupons/:id', () => {
        let couponId;

        beforeEach(async () => {
            const coupon = await Coupon.create({
                code: 'DELETE_ME',
                discountType: 'fixed',
                discountValue: 10000,
                startDate: new Date(),
                endDate: new Date(),
                minOrderValue: 0
            });
            couponId = coupon._id;
        });

        it('should allow admin to delete coupon', async () => {
            const res = await request(app)
                .delete(`/api/coupons/${couponId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            const deleted = await Coupon.findById(couponId);
            expect(deleted).toBeNull();
        });
    });
});
