import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Book from '../models/Book.js';
import Coupon from '../models/Coupon.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
    // Prevent admin from creating orders
    if (req.user.role === 'admin') {
        res.status(403);
        throw new Error('Tài khoản quản trị không thể đặt hàng. Vui lòng sử dụng tài khoản khách hàng.');
    }

    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
        couponCode,
        discountAmount,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('Giỏ hàng trống');
    }

    // Update coupon usage if applied
    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
        if (coupon) {
            coupon.usedCount += 1;
            await coupon.save();
        }
    }

    const order = new Order({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
        couponApplied: {
            code: couponCode || '',
            discountAmount: discountAmount || 0,
        },
    });

    const createdOrder = await order.save();

    // Update book stock
    for (const item of orderItems) {
        const book = await Book.findById(item.book);
        if (book) {
            book.stock -= item.quantity;
            await book.save();
        }
    }

    res.status(201).json({
        success: true,
        data: createdOrder,
    });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
    // Trim ID to remove any potential whitespace
    const orderId = req.params.id.trim();

    const order = await Order.findById(orderId)
        .populate('user', 'name email')
        .populate('orderItems.book', 'title author');

    if (order) {
        // Check if the order belongs to the user or if user is admin
        // Handle case where populated user might be null (e.g. user deleted)
        const orderUserId = order.user ? order.user._id.toString() : null;

        // If order has no user (deleted) and current user is admin, allow access
        // If order belongs to current user, allow access
        if ((orderUserId && orderUserId === req.user._id.toString()) || req.user.role === 'admin') {
            res.json({
                success: true,
                data: order,
            });
        } else {
            res.status(403);
            throw new Error('Bạn không có quyền xem đơn hàng này');
        }
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }
});

/**
 * @desc    Update order to paid
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
export const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        // When admin confirms payment (COD collected), mark as delivered
        if (req.body.id === 'ADMIN_CONFIRMED') {
            order.status = 'delivered';
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();

        res.json({
            success: true,
            data: updatedOrder,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }
});

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: orders,
    });
});

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: orders,
    });
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status || order.status;

        if (req.body.status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();

        res.json({
            success: true,
            data: updatedOrder,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }
});

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private/Admin
 */
export const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.status === 'delivered') {
            res.status(400);
            throw new Error('Không thể hủy đơn hàng đã giao');
        }

        if (order.isPaid) {
            res.status(400);
            throw new Error('Không thể hủy đơn hàng đã thanh toán');
        }

        // Restore stock for cancelled orders
        for (const item of order.orderItems) {
            const book = await Book.findById(item.book);
            if (book) {
                book.stock += item.quantity;
                await book.save();
            }
        }

        order.status = 'cancelled';
        order.cancelReason = req.body.reason || 'Không có lý do';
        const updatedOrder = await order.save();

        res.json({
            success: true,
            data: updatedOrder,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }
});

/**
 * @desc    Update order shipping address
 * @route   PUT /api/orders/:id/address
 * @access  Private/Admin
 */
export const updateOrderAddress = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Only allow address update if order hasn't been shipped yet
        if (order.status === 'shipping' || order.status === 'delivered') {
            res.status(400);
            throw new Error('Không thể sửa địa chỉ khi đơn hàng đã giao cho đơn vị vận chuyển');
        }

        order.shippingAddress = {
            ...order.shippingAddress,
            ...req.body,
        };

        const updatedOrder = await order.save();

        res.json({
            success: true,
            data: updatedOrder,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }
});

/**
 * @desc    Mark order as returned
 * @route   PUT /api/orders/:id/return
 * @access  Private/Admin
 */
export const returnOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Restore stock for returned orders
        for (const item of order.orderItems) {
            const book = await Book.findById(item.book);
            if (book) {
                book.stock += item.quantity;
                await book.save();
            }
        }

        order.status = 'returned';
        order.cancelReason = req.body.reason || 'Khách không nhận hàng';
        const updatedOrder = await order.save();

        res.json({
            success: true,
            data: updatedOrder,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }
});

/**
 * @desc    Unpay order (revert payment status)
 * @route   PUT /api/orders/:id/unpay
 * @access  Private/Admin
 */
export const unpayOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.status === 'delivered') {
            res.status(400);
            throw new Error('Không thể hủy thanh toán cho đơn hàng đã giao');
        }

        order.isPaid = false;
        order.paidAt = undefined;
        order.paymentResult = undefined;

        const updatedOrder = await order.save();

        res.json({
            success: true,
            data: updatedOrder,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }
});

export default {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    updateOrderAddress,
    returnOrder,
    unpayOrder,
};
