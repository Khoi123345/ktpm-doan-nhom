import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
});

const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    ward: {
        type: String,
        required: true,
    },
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderItems: [orderItemSchema],
        shippingAddress: shippingAddressSchema,
        paymentMethod: {
            type: String,
            enum: ['COD', 'MoMo'],
            required: true,
            default: 'COD',
        },
        couponApplied: {
            code: {
                type: String,
                default: '',
            },
            discountAmount: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        paymentResult: {
            id: String,
            status: String,
            update_time: String,
            email_address: String,
        },
        itemsPrice: {
            type: Number,
            required: true,
            default: 0.0,
            min: 0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
            min: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
            min: 0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'shipping', 'shipped', 'delivered', 'returned', 'cancelled'],
            default: 'pending',
        },
        cancelReason: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
