import { jest } from '@jest/globals';

// Define mock functions
const mockUploadStream = jest.fn();
const mockDestroy = jest.fn();

// Mock cloudinary config
jest.unstable_mockModule('../../../src/config/cloudinary.js', () => ({
    default: {
        uploader: {
            upload_stream: mockUploadStream,
            destroy: mockDestroy,
        },
    },
}));

// Import the module under test dynamically
const { uploadToCloudinary, deleteFromCloudinary } = await import('../../../src/utils/cloudinaryUpload.js');

describe('cloudinaryUpload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadToCloudinary', () => {
        it('should upload file successfully', async () => {
            const mockBuffer = Buffer.from('test image data');
            const mockUrl = 'https://res.cloudinary.com/test/image/upload/v1234/bookstore/test.jpg';

            // Mock implementation of upload_stream
            mockUploadStream.mockImplementation((options, callback) => {
                // Simulate async success
                setTimeout(() => {
                    callback(null, { secure_url: mockUrl });
                }, 10);

                // Return a dummy stream object that can be piped to
                return {
                    on: jest.fn(),
                    once: jest.fn(),
                    emit: jest.fn(),
                    write: jest.fn(),
                    end: jest.fn(),
                    pipe: jest.fn(),
                };
            });

            const result = await uploadToCloudinary(mockBuffer, 'bookstore');

            expect(result).toBe(mockUrl);
            expect(mockUploadStream).toHaveBeenCalledWith(
                expect.objectContaining({
                    folder: 'bookstore',
                    resource_type: 'auto',
                }),
                expect.any(Function)
            );
        });

        it('should use default folder if not provided', async () => {
            const mockBuffer = Buffer.from('test image data');
            const mockUrl = 'https://res.cloudinary.com/test/image/upload/v1234/bookstore/test.jpg';

            mockUploadStream.mockImplementation((options, callback) => {
                callback(null, { secure_url: mockUrl });
                return {
                    on: jest.fn(),
                    once: jest.fn(),
                    emit: jest.fn(),
                    write: jest.fn(),
                    end: jest.fn(),
                    pipe: jest.fn(),
                };
            });

            await uploadToCloudinary(mockBuffer);

            expect(mockUploadStream).toHaveBeenCalledWith(
                expect.objectContaining({
                    folder: 'bookstore',
                }),
                expect.any(Function)
            );
        });

        it('should reject on upload error', async () => {
            const mockBuffer = Buffer.from('test image data');
            const mockError = new Error('Upload failed');

            mockUploadStream.mockImplementation((options, callback) => {
                callback(mockError, null);
                return {
                    on: jest.fn(),
                    once: jest.fn(),
                    emit: jest.fn(),
                    write: jest.fn(),
                    end: jest.fn(),
                    pipe: jest.fn(),
                };
            });

            await expect(uploadToCloudinary(mockBuffer)).rejects.toThrow('Upload failed');
        });
    });

    describe('deleteFromCloudinary', () => {
        it('should delete image successfully', async () => {
            const mockUrl = 'https://res.cloudinary.com/test/image/upload/v1234/bookstore/test.jpg';
            mockDestroy.mockResolvedValue({ result: 'ok' });

            await deleteFromCloudinary(mockUrl);

            // Logic in code:
            // parts = [..., 'bookstore', 'test.jpg']
            // filename = 'test.jpg' -> publicId = 'test'
            // folder = 'bookstore'
            // fullPublicId = 'bookstore/test'
            expect(mockDestroy).toHaveBeenCalledWith('bookstore/test');
        });

        it('should handle deletion error', async () => {
            const mockUrl = 'https://res.cloudinary.com/test/image/upload/v1234/bookstore/test.jpg';
            const mockError = new Error('Deletion failed');
            mockDestroy.mockRejectedValue(mockError);

            await expect(deleteFromCloudinary(mockUrl)).rejects.toThrow('Deletion failed');
        });

        it('should extract public_id correctly from complex URL', async () => {
            // URL: .../bookstore/books/cover.jpg
            // parts: [..., 'bookstore', 'books', 'cover.jpg']
            // filename: 'cover.jpg' -> publicId: 'cover'
            // folder: 'books'
            // full: 'books/cover'
            const mockUrl = 'https://res.cloudinary.com/test/image/upload/v1234/bookstore/books/cover.jpg';
            mockDestroy.mockResolvedValue({ result: 'ok' });

            await deleteFromCloudinary(mockUrl);

            expect(mockDestroy).toHaveBeenCalledWith('books/cover');
        });
    });
});
