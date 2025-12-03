import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../src/models/User.js', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        save: jest.fn(),
        matchPassword: jest.fn(),
    })),
}));

// Add static methods to the mock
const { default: UserMock } = await import('../../../src/models/User.js');
Object.assign(UserMock, {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
});

// Import modules dynamically
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserLock,
    changePassword
} = await import('../../../src/controllers/userController.js');

const { default: User } = await import('../../../src/models/User.js');
const { mockRequest, mockResponse, mockUser } = await import('../helpers/testHelpers.js');

describe('userController', () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const users = [mockUser(), mockUser()];

            User.find.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(users)
            });

            await getAllUsers(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: users
            });
        });
    });

    describe('getUserById', () => {
        it('should return user when found', async () => {
            const user = mockUser();
            req.params = { id: user._id };

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(user)
            });

            await getUserById(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: user
            });
        });

        it('should return 404 when not found', async () => {
            req.params = { id: 'nonexistent-id' };

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await expect(getUserById(req, res)).rejects.toThrow('Không tìm thấy người dùng');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            const user = mockUser();
            req.params = { id: user._id };
            req.body = { name: 'Updated Name', role: 'admin' };

            const updatedUser = { ...user, name: 'Updated Name', role: 'admin' };
            updatedUser.save = jest.fn().mockResolvedValue(updatedUser);
            User.findById.mockResolvedValue(updatedUser);

            await updateUser(req, res);

            expect(updatedUser.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                }
            });
        });

        it('should handle partial updates', async () => {
            const user = mockUser({ name: 'Old Name', role: 'user' });
            req.params = { id: user._id };
            req.body = { name: 'New Name' }; // Only update name

            const updatedUser = { ...user, name: 'New Name' };
            updatedUser.save = jest.fn().mockResolvedValue(updatedUser);
            User.findById.mockResolvedValue(updatedUser);

            await updateUser(req, res);

            expect(updatedUser.name).toBe('New Name');
            expect(updatedUser.role).toBe('user'); // Should remain unchanged
            expect(updatedUser.save).toHaveBeenCalled();
        });

        it('should return 404 when not found', async () => {
            req.params = { id: 'nonexistent-id' };
            req.body = { name: 'Updated Name' };

            User.findById.mockResolvedValue(null);

            await expect(updateUser(req, res)).rejects.toThrow('Không tìm thấy người dùng');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            const user = mockUser({ role: 'user' });
            req.params = { id: user._id };

            user.deleteOne = jest.fn().mockResolvedValue(true);
            User.findById.mockResolvedValue(user);

            await deleteUser(req, res);

            expect(user.deleteOne).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Đã xóa người dùng'
            });
        });

        it('should return 400 when trying to delete admin', async () => {
            const adminUser = mockUser({ role: 'admin' });
            req.params = { id: adminUser._id };

            User.findById.mockResolvedValue(adminUser);

            await expect(deleteUser(req, res)).rejects.toThrow('Không thể xóa tài khoản admin');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 when not found', async () => {
            req.params = { id: 'nonexistent-id' };

            User.findById.mockResolvedValue(null);

            await expect(deleteUser(req, res)).rejects.toThrow('Không tìm thấy người dùng');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const user = mockUser();
            req.user = { _id: user._id };
            req.body = {
                oldPassword: 'OldPassword123!',
                newPassword: 'NewPassword123!'
            };

            user.matchPassword = jest.fn().mockResolvedValue(true);
            user.save = jest.fn().mockResolvedValue(user);

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(user)
            });

            await changePassword(req, res);

            expect(user.matchPassword).toHaveBeenCalledWith('OldPassword123!');
            expect(user.password).toBe('NewPassword123!');
            expect(user.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Đổi mật khẩu thành công'
            });
        });

        it('should return 401 if old password is incorrect', async () => {
            const user = mockUser();
            req.user = { _id: user._id };
            req.body = {
                oldPassword: 'WrongPassword',
                newPassword: 'NewPassword123!'
            };

            user.matchPassword = jest.fn().mockResolvedValue(false);

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(user)
            });

            await expect(changePassword(req, res)).rejects.toThrow('Mật khẩu cũ không đúng');
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 400 if new password is too short', async () => {
            const user = mockUser();
            req.user = { _id: user._id };
            req.body = {
                oldPassword: 'OldPassword123!',
                newPassword: 'Short1!'
            };

            user.matchPassword = jest.fn().mockResolvedValue(true);

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(user)
            });

            await expect(changePassword(req, res)).rejects.toThrow('Mật khẩu mới phải có ít nhất 8 ký tự');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if new password lacks complexity', async () => {
            const user = mockUser();
            req.user = { _id: user._id };
            req.body = {
                oldPassword: 'OldPassword123!',
                newPassword: 'weakpassword' // No uppercase, number, special char
            };

            user.matchPassword = jest.fn().mockResolvedValue(true);

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(user)
            });

            await expect(changePassword(req, res)).rejects.toThrow('Mật khẩu mới phải chứa ít nhất một chữ cái viết hoa, một số và một ký tự đặc biệt');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if user not found', async () => {
            req.user = { _id: 'nonexistent-id' };
            req.body = {
                oldPassword: 'OldPassword123!',
                newPassword: 'NewPassword123!'
            };

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await expect(changePassword(req, res)).rejects.toThrow('Không tìm thấy người dùng');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('toggleUserLock', () => {
        it('should lock user successfully', async () => {
            const user = mockUser({ isLocked: false, role: 'user' });
            req.params = { id: user._id };

            const updatedUser = { ...user, isLocked: true };
            user.save = jest.fn().mockResolvedValue(updatedUser);
            User.findById.mockResolvedValue(user);

            await toggleUserLock(req, res);

            expect(user.isLocked).toBe(true);
            expect(user.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Đã khóa tài khoản',
                data: {
                    _id: updatedUser._id,
                    isLocked: true
                }
            });
        });

        it('should unlock user successfully', async () => {
            const user = mockUser({ isLocked: true, role: 'user' });
            req.params = { id: user._id };

            const updatedUser = { ...user, isLocked: false };
            user.save = jest.fn().mockResolvedValue(updatedUser);
            User.findById.mockResolvedValue(user);

            await toggleUserLock(req, res);

            expect(user.isLocked).toBe(false);
            expect(user.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Đã mở khóa tài khoản',
                data: {
                    _id: updatedUser._id,
                    isLocked: false
                }
            });
        });

        it('should return 400 when trying to lock admin', async () => {
            const adminUser = mockUser({ role: 'admin' });
            req.params = { id: adminUser._id };

            User.findById.mockResolvedValue(adminUser);

            await expect(toggleUserLock(req, res)).rejects.toThrow('Không thể khóa tài khoản admin');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 when not found', async () => {
            req.params = { id: 'nonexistent-id' };

            User.findById.mockResolvedValue(null);

            await expect(toggleUserLock(req, res)).rejects.toThrow('Không tìm thấy người dùng');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
