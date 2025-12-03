import { jest } from '@jest/globals';

// Mock test helpers
const mockRequest = () => ({
    originalUrl: '/test-url',
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

// Import module under test dynamically
const { notFound, errorHandler } = await import('../../../src/middlewares/errorMiddleware.js');

describe('errorMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        next = mockNext; // Reset mockNext
        jest.clearAllMocks();
        process.env.NODE_ENV = 'test';
    });

    describe('notFound middleware', () => {
        it('should create 404 error with correct message', () => {
            req.originalUrl = '/api/nonexistent';

            notFound(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toContain('/api/nonexistent');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('errorHandler middleware', () => {
        it('should handle generic errors', () => {
            const error = new Error('Test error');
            res.statusCode = 500;

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Test error',
                stack: expect.any(String)
            });
        });

        it('should use 500 status code when statusCode is 200', () => {
            const error = new Error('Test error');
            res.statusCode = 200;

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should not include stack trace in production', () => {
            process.env.NODE_ENV = 'production';
            const error = new Error('Test error');
            res.statusCode = 500;

            errorHandler(error, req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Test error',
                stack: null
            });
        });

        it('should include stack trace in development', () => {
            process.env.NODE_ENV = 'development';
            const error = new Error('Test error');
            res.statusCode = 500;

            errorHandler(error, req, res, next);

            const jsonCall = res.json.mock.calls[0][0];
            expect(jsonCall.stack).toBeTruthy();
            expect(jsonCall.stack).not.toBe(null);
        });
    });
});
