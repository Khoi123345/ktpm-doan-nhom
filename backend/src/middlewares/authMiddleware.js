import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Không tìm thấy người dùng');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Không có quyền truy cập, token không hợp lệ');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Không có quyền truy cập, không có token');
    }
});

export default protect;
