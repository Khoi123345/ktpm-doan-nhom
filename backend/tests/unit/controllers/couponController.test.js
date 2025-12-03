import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../src/models/Coupon.js', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        save: jest.fn(),
    })),
}));

jest.unstable_mockModule('../../../src/models/Order.js', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
    },
}));

// Add static methods to the mock
const { default: CouponMock } = await import('../../../src/models/Coupon.js');
Object.assign(CouponMock, {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
});

// Import modules dynamically
const {
    getCoupons,
    getCouponByCode,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    getAllCoupons
} = await import('../../../src/controllers/couponController.js');

const { default: Coupon } = await import('../../../src/models/Coupon.js');
const { default: Order } = await import('../../../src/models/Order.js');
const { mockRequest, mockResponse, mockCoupon } = await import('../helpers/testHelpers.js');

describe('couponController', () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('getCoupons', () => {
        it('should return all coupons', async () => {
            const coupons = [mockCoupon(), mockCoupon()];
            Coupon.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(coupons)
            });

            await getCoupons(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: coupons
            });
        });
    });

    describe('getAllCoupons', () => {
        it('should return all coupons with populated data', async () => {
            const coupons = [mockCoupon(), mockCoupon()];
            const mockPopulate = jest.fn().mockResolvedValue(coupons);
            const mockSort = jest.fn().mockReturnValue({ populate: mockPopulate });
            Coupon.find.mockReturnValue({ sort: mockSort });

            await getAllCoupons(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: coupons
            });
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockPopulate).toHaveBeenCalledWith('createdBy', 'name email');
        });
    });

    describe('getCouponByCode', () => {
        it('should return coupon when found', async () => {
            const coupon = mockCoupon();
            req.params = { code: coupon.code };
            Coupon.findOne.mockResolvedValue(coupon);

            await getCouponByCode(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: coupon
            });
        });

        it('should return 404 when not found', async () => {
            req.params = { code: 'nonexistent-code' };
            Coupon.findOne.mockResolvedValue(null);

            await expect(getCouponByCode(req, res)).rejects.toThrow('Không tìm thấy mã giảm giá');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('validateCoupon', () => {
        it('should validate active coupon', async () => {
            const coupon = mockCoupon({ isActive: true, usedCount: 5, usageLimit: 100 });
            req.body = { code: coupon.code, orderValue: 200000 };

            Coupon.findOne.mockResolvedValue(coupon);

            await validateCoupon(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    code: coupon.code,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue
                })
            });
        });

        it('should return 404 when coupon not found', async () => {
            req.body = { code: 'INVALID', orderValue: 100000 };
            Coupon.findOne.mockResolvedValue(null);

            await expect(validateCoupon(req, res)).rejects.toThrow('Mã giảm giá không tồn tại');
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 400 when coupon expired', async () => {
            const expiredCoupon = mockCoupon({
                endDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
            });
            req.body = { code: expiredCoupon.code, orderValue: 100000 };

            Coupon.findOne.mockResolvedValue(expiredCoupon);

            await expect(validateCoupon(req, res)).rejects.toThrow('Mã giảm giá đã hết hạn hoặc chưa có hiệu lực');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 when usage limit reached', async () => {
            const coupon = mockCoupon({ usedCount: 100, usageLimit: 100 });
            req.body = { code: coupon.code, orderValue: 100000 };

            Coupon.findOne.mockResolvedValue(coupon);

            await expect(validateCoupon(req, res)).rejects.toThrow('Mã giảm giá đã hết lượt sử dụng');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 when minimum order not met', async () => {
            const coupon = mockCoupon({ minOrderValue: 200000 });
            req.body = { code: coupon.code, orderValue: 100000 };

            Coupon.findOne.mockResolvedValue(coupon);

            await expect(validateCoupon(req, res)).rejects.toThrow(/Mã giảm giá này chỉ áp dụng cho đơn hàng tối thiểu/);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 when coupon is inactive', async () => {
            const coupon = mockCoupon({ isActive: false });
            req.body = { code: coupon.code, orderValue: 200000 };

            Coupon.findOne.mockResolvedValue(coupon);

            await expect(validateCoupon(req, res)).rejects.toThrow('Mã giảm giá không khả dụng');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 when coupon has not started yet', async () => {
            const futureCoupon = mockCoupon({
                startDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
            req.body = { code: futureCoupon.code, orderValue: 200000 };

            Coupon.findOne.mockResolvedValue(futureCoupon);

            await expect(validateCoupon(req, res)).rejects.toThrow('Mã giảm giá đã hết hạn hoặc chưa có hiệu lực');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should calculate percentage discount correctly', async () => {
            const coupon = mockCoupon({ discountType: 'percentage', discountValue: 10 });
            req.body = { code: coupon.code, orderValue: 200000 };

            Coupon.findOne.mockResolvedValue(coupon);

            await validateCoupon(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    discountAmount: 20000
                })
            });
        });

        it('should calculate fixed amount discount correctly', async () => {
            const coupon = mockCoupon({ discountType: 'fixed', discountValue: 50000 });
            req.body = { code: coupon.code, orderValue: 200000 };

            Coupon.findOne.mockResolvedValue(coupon);

            await validateCoupon(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    discountAmount: 50000
                })
            });
        });
    });

    describe('createCoupon', () => {
        it('should create coupon successfully', async () => {
            const couponData = {
                code: 'NEWCODE',
                discountType: 'percentage',
                discountValue: 10
            };
            req.body = couponData;
            req.user = { _id: 'admin-id' };

            const newCoupon = mockCoupon(couponData);

            Coupon.findOne.mockResolvedValue(null);
            Coupon.create.mockResolvedValue(newCoupon);

            await createCoupon(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 when code already exists', async () => {
            req.body = { code: 'EXISTING' };
            Coupon.findOne.mockResolvedValue(mockCoupon());

            await expect(createCoupon(req, res)).rejects.toThrow('Mã giảm giá đã tồn tại');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should save coupon code in uppercase', async () => {
            const couponData = {
                code: 'lowercase',
                discountType: 'percentage',
                discountValue: 10
            };
            req.body = couponData;
            req.user = { _id: 'admin-id' };

            const newCoupon = mockCoupon({ ...couponData, code: 'LOWERCASE' });

            Coupon.findOne.mockResolvedValue(null);
            Coupon.create.mockResolvedValue(newCoupon);

            await createCoupon(req, res);

            expect(Coupon.create).toHaveBeenCalledWith(expect.objectContaining({
                code: 'LOWERCASE'
            }));
        });
    });

    describe('updateCoupon', () => {
        it('should update coupon successfully', async () => {
            const coupon = mockCoupon();
            req.params = { id: coupon._id };
            req.body = { discountValue: 20 };

            const updatedCoupon = { ...coupon, discountValue: 20 };
            updatedCoupon.save = jest.fn().mockResolvedValue(updatedCoupon);
            Coupon.findById.mockResolvedValue(updatedCoupon);

            await updateCoupon(req, res);

            expect(updatedCoupon.save).toHaveBeenCalled();
        });

        it('should return 404 when not found', async () => {
            req.params = { id: 'nonexistent-id' };
            req.body = { discountValue: 20 };
            Coupon.findById.mockResolvedValue(null);

            await expect(updateCoupon(req, res)).rejects.toThrow('Không tìm thấy mã giảm giá');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteCoupon', () => {
        it('should delete coupon successfully', async () => {
            const coupon = mockCoupon();
            req.params = { id: coupon._id };

            coupon.deleteOne = jest.fn().mockResolvedValue(true);
            Coupon.findById.mockResolvedValue(coupon);
            Order.findOne.mockResolvedValue(null);

            await deleteCoupon(req, res);

            expect(coupon.deleteOne).toHaveBeenCalled();
        });

        it('should return 400 when coupon is used in an order', async () => {
            const coupon = mockCoupon();
            req.params = { id: coupon._id };

            Coupon.findById.mockResolvedValue(coupon);
            Order.findOne.mockResolvedValue({ _id: 'order-id' });

            await expect(deleteCoupon(req, res)).rejects.toThrow('Không thể xóa mã giảm giá đã được sử dụng trong đơn hàng');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 when not found', async () => {
            req.params = { id: 'nonexistent-id' };
            Coupon.findById.mockResolvedValue(null);

            await expect(deleteCoupon(req, res)).rejects.toThrow('Không tìm thấy mã giảm giá');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
