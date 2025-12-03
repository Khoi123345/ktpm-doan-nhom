import { jest } from '@jest/globals';
import { admin } from '../../../src/middlewares/adminMiddleware.js';
import { mockRequest, mockResponse, mockNext, mockUser } from '../helpers/testHelpers.js';

describe('adminMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        next = mockNext();
        jest.clearAllMocks();
    });

    describe('admin middleware', () => {
        it('should allow access for admin user', async () => {
            const adminUser = mockUser({ role: 'admin' });
            req.user = adminUser;

            await admin(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should deny access for customer user', async () => {
            const customerUser = mockUser({ role: 'customer' });
            req.user = customerUser;

            await admin(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should deny access when user is not authenticated', async () => {
            req.user = null;

            await admin(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should deny access for user without role', async () => {
            const userWithoutRole = mockUser();
            delete userWithoutRole.role;
            req.user = userWithoutRole;

            await admin(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
