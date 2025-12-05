import { jest } from '@jest/globals';

// Mock multer
const mockMulter = jest.fn();
const mockMemoryStorage = jest.fn();

// Setup mock return value for multer
mockMulter.memoryStorage = mockMemoryStorage;

jest.unstable_mockModule('multer', () => ({
    default: mockMulter,
}));

describe('uploadMiddleware', () => {
    let uploadMiddleware;

    beforeEach(async () => {
        jest.clearAllMocks();
        mockMulter.mockReturnValue({
            single: jest.fn(),
            array: jest.fn(),
            fields: jest.fn(),
            any: jest.fn(),
        });

        // Re-import module for each test to ensure fresh execution of top-level code
        jest.resetModules();
        const module = await import('../../../src/middlewares/uploadMiddleware.js');
        uploadMiddleware = module.default;
    });

    it('configureMulterWithMemoryStorage', () => {
        expect(mockMulter).toHaveBeenCalled();
        expect(mockMemoryStorage).toHaveBeenCalled();

        const multerConfig = mockMulter.mock.calls[0][0];
        expect(multerConfig).toHaveProperty('storage');
        expect(multerConfig).toHaveProperty('fileFilter');
        expect(multerConfig).toHaveProperty('limits');
    });

    it('acceptImageFiles', () => {
        const multerConfig = mockMulter.mock.calls[0][0];
        const fileFilter = multerConfig.fileFilter;

        const mockReq = {};
        const mockImageFile = { mimetype: 'image/jpeg' };
        const mockCallback = jest.fn();

        fileFilter(mockReq, mockImageFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(null, true);
    });

    it('rejectNonImageFiles', () => {
        const multerConfig = mockMulter.mock.calls[0][0];
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

    it('setFileSizeLimitTo5MB', () => {
        const multerConfig = mockMulter.mock.calls[0][0];

        expect(multerConfig.limits).toBeDefined();
        expect(multerConfig.limits.fileSize).toBe(5 * 1024 * 1024);
    });
});
