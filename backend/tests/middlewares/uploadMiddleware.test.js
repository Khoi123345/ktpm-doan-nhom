import multer from 'multer';

// Mock multer
jest.mock('multer');

describe('uploadMiddleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should configure multer with memory storage', () => {
        require('../../src/middlewares/uploadMiddleware.js');

        expect(multer).toHaveBeenCalled();
        const multerConfig = multer.mock.calls[0][0];

        expect(multerConfig).toHaveProperty('storage');
        expect(multerConfig).toHaveProperty('fileFilter');
        expect(multerConfig).toHaveProperty('limits');
    });

    it('should accept image files', () => {
        multer.mockReturnValue({
            single: jest.fn(),
            array: jest.fn()
        });

        jest.resetModules();
        require('../../src/middlewares/uploadMiddleware.js');

        const multerConfig = multer.mock.calls[0][0];
        const fileFilter = multerConfig.fileFilter;

        const mockReq = {};
        const mockImageFile = { mimetype: 'image/jpeg' };
        const mockCallback = jest.fn();

        fileFilter(mockReq, mockImageFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(null, true);
    });

    it('should reject non-image files', () => {
        multer.mockReturnValue({
            single: jest.fn(),
            array: jest.fn()
        });

        jest.resetModules();
        require('../../src/middlewares/uploadMiddleware.js');

        const multerConfig = multer.mock.calls[0][0];
        const fileFilter = multerConfig.fileFilter;

        const mockReq = {};
        const mockPdfFile = { mimetype: 'application/pdf' };
        const mockCallback = jest.fn();

        fileFilter(mockReq, mockPdfFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('ảnh')
            }),
            false
        );
    });

    it('should set file size limit to 5MB', () => {
        multer.mockReturnValue({
            single: jest.fn(),
            array: jest.fn()
        });

        jest.resetModules();
        require('../../src/middlewares/uploadMiddleware.js');

        const multerConfig = multer.mock.calls[0][0];

        expect(multerConfig.limits).toBeDefined();
        expect(multerConfig.limits.fileSize).toBe(5 * 1024 * 1024);
    });
});
