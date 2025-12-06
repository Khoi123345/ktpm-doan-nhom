import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
        ? {
            $or: [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { email: { $regex: req.query.keyword, $options: 'i' } },
            ],
        }
        : {};

    const count = await User.countDocuments({ ...keyword });
    const users = await User.find({ ...keyword })
        .select('-password')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: users,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        res.json({
            success: true,
            data: user,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
    }
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        // Email cannot be changed for security reasons
        user.role = req.body.role || user.role;

        const updatedUser = await user.save();

        res.json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
    }
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Không thể xóa tài khoản admin');
        }

        await user.deleteOne();
        res.json({
            success: true,
            message: 'Đã xóa người dùng',
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
    }
});

/**
 * @desc    Change user password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
    }

    // Check if old password is correct
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
        res.status(401);
        throw new Error('Mật khẩu cũ không đúng');
    }

    // Validate new password
    if (newPassword.length < 8) {
        res.status(400);
        throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự');
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
        res.status(400);
        throw new Error('Mật khẩu mới phải chứa ít nhất một chữ cái viết hoa, một số và một ký tự đặc biệt');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Đổi mật khẩu thành công',
    });
});

/**
 * @desc    Lock/Unlock user
 * @route   PUT /api/users/:id/lock
 * @access  Private/Admin
 */
export const toggleUserLock = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Không thể khóa tài khoản admin');
        }

        user.isLocked = !user.isLocked;
        const updatedUser = await user.save();

        res.json({
            success: true,
            message: updatedUser.isLocked ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
            data: {
                _id: updatedUser._id,
                isLocked: updatedUser.isLocked,
            },
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
    }
});

export default {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changePassword,
    toggleUserLock,
};
