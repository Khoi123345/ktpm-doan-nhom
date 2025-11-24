import asyncHandler from 'express-async-handler';

/**
 * Admin middleware - Check if user is admin
 */
export const admin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Không có quyền truy cập - Chỉ dành cho Admin');
    }
});

export default admin;
