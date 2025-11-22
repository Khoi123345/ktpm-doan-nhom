import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<String>} - Cloudinary URL
 */
export const uploadToCloudinary = (fileBuffer, folder = 'bookstore') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        const readableStream = new Readable();
        readableStream.push(fileBuffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};

/**
 * Delete image from Cloudinary
 * @param {String} imageUrl - Cloudinary image URL
 * @returns {Promise}
 */
export const deleteFromCloudinary = async (imageUrl) => {
    try {
        // Extract public_id from URL
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];
        const folder = parts[parts.length - 2];

        const fullPublicId = `${folder}/${publicId}`;

        await cloudinary.uploader.destroy(fullPublicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

export default { uploadToCloudinary, deleteFromCloudinary };
