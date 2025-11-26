import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Book from '../models/Book.js';
import Cart from '../models/Cart.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        discountAmount,
        totalPrice,
        couponCode,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error('Không có sản phẩm trong đơn hàng');
    }

    // Validate stock for all items
    for (const item of orderItems) {
        const book = await Book.findById(item.book);
        if (!book) {
            res.status(404);
            throw new Error(`Không tìm thấy sách: ${item.title}`);
        }
        if (book.stock < item.quantity) {
            res.status(400);
            throw new Error(`Sách "${book.title}" không đủ số lượng trong kho`);
        }
    }

    // Create order
    const order = new Order({
        user: req.user._id,
        orderItems: orderItems.map(item => ({
            book: item.book,
            title: item.title,
            quantity: item.quantity,
            image: item.image,
            price: item.price,
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        discountAmount: discountAmount || 0,
        totalPrice,
        couponCode: couponCode || null,
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

    // DO NOT clear cart here - it will be handled by frontend
    // This prevents clearing cart when user only checks out selected items

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
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        // Check if order belongs to user or user is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Không có quyền truy cập đơn hàng này');
        }

        res.json({
            success: true,
            data: order,
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
export const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });

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
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = status;

        if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        if (status === 'cancelled') {
            // Restore book stock when order is cancelled
            for (const item of order.orderItems) {
                const book = await Book.findById(item.book);
                if (book) {
                    book.stock += item.quantity;
                    await book.save();
                }
            }
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
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Không có quyền hủy đơn hàng này');
    }

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
        res.status(400);
        throw new Error('Không thể hủy đơn hàng đã giao hoặc đã hủy');
    }

    order.status = 'cancelled';

    // Restore book stock
    for (const item of order.orderItems) {
        const book = await Book.findById(item.book);
        if (book) {
            book.stock += item.quantity;
            await book.save();
        }
    }

    const updatedOrder = await order.save();

    res.json({
        success: true,
        data: updatedOrder,
    });
});

export default {
    createOrder,
    getOrderById,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    updateOrderToPaid,
    cancelOrder,
};