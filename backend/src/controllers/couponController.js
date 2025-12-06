import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';

/**
 * @desc    Get all active coupons
 * @route   GET /api/coupons
 * @access  Public
 */
export const getCoupons = asyncHandler(async (req, res) => {
    // Auto-expire coupons
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    await Coupon.updateMany({ endDate: { $lt: startOfToday }, isActive: true }, { isActive: false });

    const coupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: coupons,
    });
});

/**
 * @desc    Get coupon by code
 * @route   GET /api/coupons/:code
 * @access  Public
 */
export const getCouponByCode = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });

    if (coupon) {
        res.json({
            success: true,
            data: coupon,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy mã giảm giá');
    }
});

/**
 * @desc    Validate coupon
 * @route   POST /api/coupons/validate
 * @access  Public
 */
export const validateCoupon = asyncHandler(async (req, res) => {
    const { code, orderValue } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
        res.status(404);
        throw new Error('Mã giảm giá không tồn tại');
    }

    // Check if coupon is active
    if (!coupon.isActive) {
        res.status(400);
        throw new Error('Mã giảm giá không khả dụng');
    }

    // Check date validity
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    // Set end date to end of day to be inclusive
    endDate.setHours(23, 59, 59, 999);



    if (now < startDate || now > endDate) {
        // If expired, update status to inactive
        if (now > endDate) {
            coupon.isActive = false;
            await coupon.save();
        }
        res.status(400);
        throw new Error('Mã giảm giá đã hết hạn hoặc chưa có hiệu lực');
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        res.status(400);
        throw new Error('Mã giảm giá đã hết lượt sử dụng');
    }

    // Check minimum order value
    if (orderValue < coupon.minOrderValue) {
        res.status(400);
        throw new Error(`Mã giảm giá này chỉ áp dụng cho đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')} VNĐ`);
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
        discountAmount = (orderValue * coupon.discountValue) / 100;
    } else {
        discountAmount = coupon.discountValue;
    }

    res.json({
        success: true,
        data: {
            code: coupon.code,
            discountAmount,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
        },
    });
});

/**
 * @desc    Create coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = asyncHandler(async (req, res) => {
    const {
        code,
        description,
        discountType,
        discountValue,
        minOrderValue,
        startDate,
        endDate,
        usageLimit,
    } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
        res.status(400);
        throw new Error('Mã giảm giá đã tồn tại');
    }

    const coupon = await Coupon.create({
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minOrderValue,
        startDate,
        endDate,
        usageLimit,
        createdBy: req.user._id,
    });

    res.status(201).json({
        success: true,
        data: coupon,
    });
});

/**
 * @desc    Update coupon
 * @route   PUT /api/coupons/:id
 * @access  Private/Admin
 */
export const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        // Only allow updating description, usageLimit, and isActive
        coupon.description = req.body.description || coupon.description;
        coupon.usageLimit = req.body.usageLimit ?? coupon.usageLimit;
        coupon.isActive = req.body.isActive ?? coupon.isActive;

        // Other fields are NOT updated to preserve data integrity

        const updatedCoupon = await coupon.save();
        res.json({
            success: true,
            data: updatedCoupon,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy mã giảm giá');
    }
});

/**
 * @desc    Delete coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        // Check if coupon has been used in any order
        const orderWithCoupon = await Order.findOne({ 'couponApplied.code': coupon.code });

        if (orderWithCoupon) {
            res.status(400);
            throw new Error('Không thể xóa mã giảm giá đã được sử dụng trong đơn hàng');
        }

        await coupon.deleteOne();
        res.json({
            success: true,
            message: 'Đã xóa mã giảm giá',
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy mã giảm giá');
    }
});

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/coupons/admin/all
 * @access  Private/Admin
 */
export const getAllCoupons = asyncHandler(async (req, res) => {
    // Auto-expire coupons
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    await Coupon.updateMany({ endDate: { $lt: startOfToday }, isActive: true }, { isActive: false });

    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).populate('createdBy', 'name email');

    res.json({
        success: true,
        data: coupons,
    });
});

export default {
    getCoupons,
    getCouponByCode,
    validateCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getAllCoupons,
};
