import { uploadToCloudinary, deleteFromCloudinary } from '../../src/utils/cloudinaryUpload.js';
import cloudinary from '../../src/config/cloudinary.js';

// Mock cloudinary
jest.mock('../../src/config/cloudinary.js', () => ({
    __esModule: true,
    default: {
        uploader: {
            upload_stream: jest.fn(),
            destroy: jest.fn()
        }
    }
}));

describe('cloudinaryUpload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadToCloudinary', () => {
        it('should upload file successfully', async () => {
            const mockBuffer = Buffer.from('test image data');
            const mockUrl = 'https://res.cloudinary.com/test/image/upload/v1234/bookstore/test.jpg';

            cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
                callback(null, { secure_url: mockUrl });
                return {
                    on: jest.fn(),
                    end: jest.fn()
                };
            });

            const result = await uploadToCloudinary(mockBuffer, 'bookstore');

            expect(result).toBe(mockUrl);
            expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
                expect.objectContaining({
                    folder: 'bookstore',
                    resource_type: 'auto'
                }),
                expect.any(Function)
            );
        });

        it('should use default folder if not provided', async () => {
            const mockBuffer = Buffer.from('test image data');
            const mockUrl = 'https://res.cloudinary.com/test/image/upload/v1234/bookstore/test.jpg';

            cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
                callback(null, { secure_url: mockUrl });
                return {
                    on: jest.fn(),
                    end: jest.fn()
                };
            });

            await uploadToCloudinary(mockBuffer);

            expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
                expect.objectContaining({
                    folder: 'bookstore'
                }),
                expect.any(Function)
            );
        });

        it('should reject on upload error', async () => {
            const mockBuffer = Buffer.from('test image data');
            const mockError = new Error('Upload failed');

            cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
                callback(mockError, null);
                return {
                    on: jest.fn(),
                    end: jest.fn()
                };
            });

            await expect(uploadToCloudinary(mockBuffer)).rejects.toThrow('Upload failed');
        });
    });

    describe('deleteFromCloudinary', () => {
        it('should delete image successfully', async () => {
            const mockUrl = 'https://res.cloudinary.com/test/image/upload/v1234/bookstore/test.jpg';
            cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

            await deleteFromCloudinary(mockUrl);

            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('bookstore/test');
        });

        it('should handle deletion error', async () => {
            const mockUrl = 'https://res.cloudinary.com/test/image/upload/v1234/bookstore/test.jpg';
            const mockError = new Error('Deletion failed');
            cloudinary.uploader.destroy.mockRejectedValue(mockError);

            await expect(deleteFromCloudinary(mockUrl)).rejects.toThrow('Deletion failed');
        });

        it('should extract public_id correctly from complex URL', async () => {
            const mockUrl = 'https://res.cloudinary.com/test/image/upload/v1234/bookstore/books/cover.jpg';
            cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

            await deleteFromCloudinary(mockUrl);

            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('books/cover');
        });
    });
});
