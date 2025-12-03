import { jest } from '@jest/globals';

// Mock User model
jest.unstable_mockModule('../../src/models/User.js', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
    }
}));

// Mock generateToken
jest.unstable_mockModule('../../src/utils/generateToken.js', () => ({
    __esModule: true,
    default: jest.fn()
}));

const { register, login, getProfile, updateProfile } = await import('../../src/controllers/authController.js');
const { default: User } = await import('../../src/models/User.js');
const { default: generateToken } = await import('../../src/utils/generateToken.js');
const { mockRequest, mockResponse, mockNext, mockUser } = await import('../helpers/testHelpers.js');

describe('authController', () => {
    let req, res, next;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        next = jest.fn();
        jest.clearAllMocks();
        generateToken.mockReturnValue('mock.jwt.token');
    });

    describe('register', () => {
        it('should register new user successfully', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            req.body = userData;

            const newUser = mockUser(userData);
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue(newUser);

            await register(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
            expect(User.create).toHaveBeenCalledWith(userData);
            expect(generateToken).toHaveBeenCalledWith(newUser._id);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    token: 'mock.jwt.token'
                })
            });
        });

        it('should return 400 if email already exists', async () => {
            req.body = {
                name: 'Test User',
                email: 'existing@example.com',
                password: 'password123'
            };

            User.findOne.mockResolvedValue(mockUser());

            await register(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should return 400 if user creation fails', async () => {
            req.body = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue(null);

            await register(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('login', () => {
        it('should login user with valid credentials', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123'
            };
            req.body = credentials;

            const user = mockUser({ email: credentials.email });
            user.matchPassword = jest.fn().mockResolvedValue(true);

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(user)
            });

            await login(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({ email: credentials.email });
            expect(user.matchPassword).toHaveBeenCalledWith(credentials.password);
            expect(generateToken).toHaveBeenCalledWith(user._id);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    email: user.email,
                    token: 'mock.jwt.token'
                })
            });
        });

        it('should return 401 if email does not exist', async () => {
            req.body = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await login(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should return 401 if password is incorrect', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            const user = mockUser();
            user.matchPassword = jest.fn().mockResolvedValue(false);

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(user)
            });

            await login(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should return 403 if account is locked', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            const lockedUser = mockUser({ isLocked: true });

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(lockedUser)
            });

            await login(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
            const user = mockUser();
            req.user = { _id: user._id };

            User.findById.mockResolvedValue(user);

            await getProfile(req, res, next);

            expect(User.findById).toHaveBeenCalledWith(user._id);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    _id: user._id,
                    name: user.name,
                    email: user.email
                })
            });
        });

        it('should return 404 if user not found', async () => {
            req.user = { _id: 'nonexistent-id' };

            User.findById.mockResolvedValue(null);

            await getProfile(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('updateProfile', () => {
        it('should update user profile successfully', async () => {
            const user = mockUser();
            const updates = {
                name: 'Updated Name',
                phone: '0987654321'
            };
            req.user = { _id: user._id };
            req.body = updates;

            const updatedUser = { ...user, ...updates };
            updatedUser.save = jest.fn().mockResolvedValue(updatedUser);
            User.findById.mockResolvedValue(updatedUser);

            await updateProfile(req, res, next);

            expect(updatedUser.save).toHaveBeenCalled();
            expect(generateToken).toHaveBeenCalledWith(updatedUser._id);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    name: updates.name,
                    phone: updates.phone,
                    token: 'mock.jwt.token'
                })
            });
        });

        it('should update password when provided', async () => {
            const user = mockUser();
            req.user = { _id: user._id };
            req.body = { password: 'newpassword123' };

            const updatedUser = { ...user, save: jest.fn().mockResolvedValue(true) };
            User.findById.mockResolvedValue(updatedUser);

            await updateProfile(req, res);

            expect(updatedUser.password).toBe('newpassword123');
            expect(updatedUser.save).toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            req.user = { _id: 'nonexistent-id' };
            req.body = { name: 'New Name' };

            User.findById.mockResolvedValue(null);

            await updateProfile(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
