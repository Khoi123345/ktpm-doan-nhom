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

    // NOTE: Stock is NOT reduced here anymore. It will be reduced when admin confirms the order.

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
        const oldStatus = order.status;
        order.status = status;

        if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        // Reduce stock when confirmed
        if (status === 'confirmed' && oldStatus === 'pending') {
            for (const item of order.orderItems) {
                const book = await Book.findById(item.book);
                if (book) {
                    if (book.stock < item.quantity) {
                        res.status(400);
                        throw new Error(`Sách "${book.title}" không đủ số lượng trong kho`);
                    }
                    book.stock -= item.quantity;
                    await book.save();
                }
            }
        }

        // Restore stock if cancelled (only if it was previously confirmed/processed etc)
        if (status === 'cancelled' && oldStatus !== 'pending' && oldStatus !== 'cancelled' && oldStatus !== 'returned') {
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

    // Check if order belongs to user or user is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Không có quyền hủy đơn hàng này');
    }

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled' || order.status === 'returned') {
        res.status(400);
        throw new Error('Không thể hủy đơn hàng đã giao, đã hủy hoặc đã hoàn');
    }

    const oldStatus = order.status;
    order.status = 'cancelled';
    order.cancelReason = req.body.reason || '';

    // Restore book stock ONLY if it was previously confirmed (i.e., stock was reduced)
    if (oldStatus !== 'pending') {
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
});

/**
 * @desc    Return order
 * @route   PUT /api/orders/:id/return
 * @access  Private/Admin
 */
export const returnOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    // Only admin can mark as returned (for now)
    // if (req.user.role !== 'admin') { ... } // Already protected by route middleware

    // Check if order can be returned
    if (order.status === 'cancelled' || order.status === 'returned') {
        res.status(400);
        throw new Error('Đơn hàng đã hủy hoặc đã hoàn');
    }

    const oldStatus = order.status;
    order.status = 'returned';
    order.cancelReason = req.body.reason || ''; // Reuse cancelReason for return reason

    // Restore book stock (assuming returned orders should restore stock)
    // If it was pending, stock wasn't reduced, so don't restore. But returned usually implies delivered, so stock WAS reduced.
    if (oldStatus !== 'pending') {
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
});

/**
 * @desc    Get top selling books
 * @route   GET /api/orders/analytics/top-books
 * @access  Private/Admin
 */
export const getTopSellingBooks = asyncHandler(async (req, res) => {
    const topBooks = await Order.aggregate([
        {
            $match: {
                $or: [
                    { isPaid: true },
                    { status: 'delivered' }
                ]
            }
        },
        { $unwind: '$orderItems' },
        {
            $group: {
                _id: '$orderItems.book',
                title: { $first: '$orderItems.title' },
                image: { $first: '$orderItems.image' },
                totalSold: { $sum: '$orderItems.quantity' },
                totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
    ]);

    res.json({
        success: true,
        data: topBooks,
    });
});

/**
 * @desc    Get top buyers
 * @route   GET /api/orders/analytics/top-buyers
 * @access  Private/Admin
 */
export const getTopBuyers = asyncHandler(async (req, res) => {
    const topBuyers = await Order.aggregate([
        {
            $match: {
                $or: [
                    { isPaid: true },
                    { status: 'delivered' }
                ]
            }
        },
        {
            $group: {
                _id: '$user',
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: '$totalPrice' }
            }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $project: {
                _id: 1,
                totalOrders: 1,
                totalSpent: 1,
                name: { $arrayElemAt: ['$userDetails.name', 0] },
                email: { $arrayElemAt: ['$userDetails.email', 0] }
            }
        }
    ]);

    res.json({
        success: true,
        data: topBuyers,
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
    returnOrder,
    getTopSellingBooks,
    getTopBuyers,
};