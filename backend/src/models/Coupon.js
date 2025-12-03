import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Vui lòng nhập mã coupon'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: [true, 'Vui lòng chọn loại giảm giá'],
        },
        discountValue: {
            type: Number,
            required: [true, 'Vui lòng nhập giá trị giảm'],
            min: 0,
        },
        minOrderValue: {
            type: Number,
            default: 0,
            min: 0,
        },
        startDate: {
            type: Date,
            required: [true, 'Vui lòng chọn ngày bắt đầu'],
        },
        endDate: {
            type: Date,
            required: [true, 'Vui lòng chọn ngày kết thúc'],
        },
        usageLimit: {
            type: Number,
            default: 0,
            min: 0,
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
