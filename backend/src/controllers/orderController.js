import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Book from '../models/Book.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';

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
        couponApplied: {
            code: couponCode || '',
            discountAmount: discountAmount || 0
        },
    });

    const createdOrder = await order.save();

    // Update coupon usage
    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode });
        if (coupon) {
            coupon.usedCount = (coupon.usedCount || 0) + 1;
            await coupon.save();
        }
    }

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
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const status = req.query.status;
    const keyword = req.query.keyword;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;

    const pipeline = [];

    // Lookup user to search by user name/email
    pipeline.push({
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
        }
    });

    pipeline.push({
        $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true
        }
    });

    // Add string version of _id for partial search
    pipeline.push({
        $addFields: {
            orderIdString: { $toString: '$_id' }
        }
    });

    // Match stage
    const matchConditions = {};

    if (status) {
        matchConditions.status = status;
    }

    if (keyword) {
        matchConditions.$or = [
            { 'shippingAddress.fullName': { $regex: keyword, $options: 'i' } },
            { 'shippingAddress.phone': { $regex: keyword, $options: 'i' } },
            { 'user.name': { $regex: keyword, $options: 'i' } },
            { 'user.email': { $regex: keyword, $options: 'i' } },
            { orderIdString: { $regex: keyword, $options: 'i' } }
        ];
    }

    // Date filter
    if (startDate || endDate) {
        matchConditions.createdAt = {};
        if (startDate) {
            matchConditions.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            // Set end date to end of day
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchConditions.createdAt.$lte = end;
        }
    }

    // Price filter
    if (minPrice || maxPrice) {
        matchConditions.totalPrice = {};
        if (minPrice) matchConditions.totalPrice.$gte = Number(minPrice);
        if (maxPrice) matchConditions.totalPrice.$lte = Number(maxPrice);
    }

    if (Object.keys(matchConditions).length > 0) {
        pipeline.push({ $match: matchConditions });
    }

    // Sort
    pipeline.push({ $sort: { createdAt: -1 } });

    // Pagination facet
    pipeline.push({
        $facet: {
            metadata: [{ $count: 'total' }],
            data: [
                { $skip: pageSize * (page - 1) },
                { $limit: pageSize },
                {
                    $project: {
                        orderIdString: 0, // Remove temp field
                        'user.password': 0 // Don't send password
                    }
                }
            ]
        }
    });

    const result = await Order.aggregate(pipeline);

    // Handle empty result
    if (!result || result.length === 0 || !result[0]) {
        return res.json({
            success: true,
            data: [],
            page,
            pages: 0,
            total: 0
        });
    }

    const metadata = result[0].metadata && result[0].metadata[0] ? result[0].metadata[0] : null;
    const orders = result[0].data || [];
    const total = metadata ? metadata.total : 0;

    res.json({
        success: true,
        data: orders,
        page,
        pages: Math.ceil(total / pageSize),
        total
    });
});

/**
 * @route   PUT / api / orders /: id / status
        * @access  Private / Admin
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

        // Restore coupon usage if cancelled
        if (status === 'cancelled' && order.couponApplied && order.couponApplied.code) {
            const coupon = await Coupon.findOne({ code: order.couponApplied.code });
            if (coupon) {
                coupon.usedCount = Math.max(0, (coupon.usedCount || 0) - 1);
                await coupon.save();
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

    // Restore coupon usage
    if (order.couponApplied && order.couponApplied.code) {
        const coupon = await Coupon.findOne({ code: order.couponApplied.code });
        if (coupon) {
            coupon.usedCount = Math.max(0, (coupon.usedCount || 0) - 1);
            await coupon.save();
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

    // Check if order can be returned
    if (order.status === 'cancelled' || order.status === 'returned') {
        res.status(400);
        throw new Error('Đơn hàng đã hủy hoặc đã hoàn');
    }

    const oldStatus = order.status;
    order.status = 'returned';
    order.cancelReason = req.body.reason || '';

    // Restore book stock
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
                price: { $first: '$orderItems.price' },
                totalSold: { $sum: '$orderItems.quantity' },
                revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
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
                isPaid: true
            }
        },
        {
            $group: {
                _id: '$user',
                totalSpent: { $sum: '$totalPrice' },
                orderCount: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        {
            $project: {
                _id: 1,
                name: '$user.name',
                email: '$user.email',
                totalSpent: 1,
                orderCount: 1
            }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 }
    ]);

    res.json({
        success: true,
        data: topBuyers,
    });
});
