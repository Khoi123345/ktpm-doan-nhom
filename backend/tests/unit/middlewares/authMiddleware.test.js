import { jest } from '@jest/globals';

// Mock User model
jest.unstable_mockModule('../../../src/models/User.js', () => ({
    __esModule: true,
    default: {
        findById: jest.fn()
    }
}));

// Mock jwt
jest.unstable_mockModule('jsonwebtoken', () => ({
    __esModule: true,
    default: {
        verify: jest.fn(),
        sign: jest.fn()
    }
}));

const jwt = (await import('jsonwebtoken')).default;
const { protect } = await import('../../../src/middlewares/authMiddleware.js');
const { default: User } = await import('../../../src/models/User.js');
const { mockRequest, mockResponse, mockNext, mockUser } = await import('../helpers/testHelpers.js');

describe('authMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        next = mockNext();
        process.env.JWT_SECRET = 'test-secret';
        jest.clearAllMocks();
    });

    describe('protect middleware', () => {
        it('should authenticate user with valid token', async () => {
            const user = mockUser();
            const token = 'valid.jwt.token';

            req.headers.authorization = `Bearer ${token}`;

            jwt.verify.mockReturnValue({ id: user._id });
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(user)
            });

            await protect(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
            expect(User.findById).toHaveBeenCalledWith(user._id);
            expect(req.user).toEqual(user);
            expect(next).toHaveBeenCalled();
        });

        it('should reject request without authorization header', async () => {
            await protect(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should reject request with invalid token format', async () => {
            req.headers.authorization = 'InvalidFormat';

            await protect(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should reject request with invalid token', async () => {
            const token = 'invalid.jwt.token';
            req.headers.authorization = `Bearer ${token}`;

            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await protect(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should reject request when user not found', async () => {
            const token = 'valid.jwt.token';
            req.headers.authorization = `Bearer ${token}`;

            jwt.verify.mockReturnValue({ id: 'nonexistent-user-id' });
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await protect(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should reject request with expired token', async () => {
            const token = 'expired.jwt.token';
            req.headers.authorization = `Bearer ${token}`;

            jwt.verify.mockImplementation(() => {
                const error = new Error('jwt expired');
                error.name = 'TokenExpiredError';
                throw error;
            });

            await protect(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
