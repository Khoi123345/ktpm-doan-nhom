import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

/**
 * @desc    Get overview statistics
 * @route   GET /api/stats/overview
 * @access  Private/Admin
 */
export const getOverviewStats = asyncHandler(async (req, res) => {
    const [orders, books, users, categories] = await Promise.all([
        Order.find({}),
        Book.countDocuments({}),
        User.countDocuments({ role: 'user' }),
        Category.countDocuments({})
    ]);

    // Calculate total revenue from paid orders
    const totalRevenue = orders.reduce((acc, order) => {
        return acc + (order.isPaid ? order.totalPrice : 0);
    }, 0);

    // Calculate revenue from last period for comparison
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [recentOrders, previousOrders] = await Promise.all([
        Order.find({ createdAt: { $gte: thirtyDaysAgo } }),
        Order.find({
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        })
    ]);

    const recentRevenue = recentOrders.reduce((acc, order) =>
        acc + (order.isPaid ? order.totalPrice : 0), 0
    );
    const previousRevenue = previousOrders.reduce((acc, order) =>
        acc + (order.isPaid ? order.totalPrice : 0), 0
    );

    const revenueTrend = previousRevenue > 0
        ? ((recentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
        : 100;

    // Calculate order trend
    const orderTrend = previousOrders.length > 0
        ? ((recentOrders.length - previousOrders.length) / previousOrders.length * 100).toFixed(1)
        : 100;

    // Calculate user growth
    const recentUsers = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
        role: 'user'
    });
    const previousUsers = await User.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
        role: 'user'
    });
    const userTrend = previousUsers > 0
        ? ((recentUsers - previousUsers) / previousUsers * 100).toFixed(1)
        : 100;

    res.json({
        success: true,
        data: {
            totalRevenue,
            totalOrders: orders.length,
            totalBooks: books,
            totalUsers: users,
            totalCategories: categories,
            trends: {
                revenue: parseFloat(revenueTrend),
                orders: parseFloat(orderTrend),
                users: parseFloat(userTrend)
            }
        }
    });
});

/**
 * @desc    Get revenue statistics by period
 * @route   GET /api/stats/revenue?period=7days|30days|12months
 * @access  Private/Admin
 */
export const getRevenueStats = asyncHandler(async (req, res) => {
    const { period = '7days' } = req.query;

    let startDate = new Date();
    let groupBy;
    let dateFormat;

    switch (period) {
        case '7days':
            startDate.setDate(startDate.getDate() - 7);
            groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
            dateFormat = 'daily';
            break;
        case '30days':
            startDate.setDate(startDate.getDate() - 30);
            groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
            dateFormat = 'daily';
            break;
        case '12months':
            startDate.setMonth(startDate.getMonth() - 12);
            groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
            dateFormat = 'monthly';
            break;
        default:
            startDate.setDate(startDate.getDate() - 7);
            groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
            dateFormat = 'daily';
    }

    const revenueData = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                isPaid: true
            }
        },
        {
            $group: {
                _id: groupBy,
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    res.json({
        success: true,
        data: {
            period,
            dateFormat,
            stats: revenueData.map(item => ({
                date: item._id,
                revenue: item.revenue,
                orders: item.orders
            }))
        }
    });
});

/**
 * @desc    Get order statistics by status
 * @route   GET /api/stats/orders
 * @access  Private/Admin
 */
export const getOrderStats = asyncHandler(async (req, res) => {
    const ordersByStatus = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: {
                    $sum: {
                        $cond: [{ $eq: ['$isPaid', true] }, '$totalPrice', 0]
                    }
                }
            }
        }
    ]);

    const paymentStats = await Order.aggregate([
        {
            $group: {
                _id: '$isPaid',
                count: { $sum: 1 },
                total: { $sum: '$totalPrice' }
            }
        }
    ]);

    res.json({
        success: true,
        data: {
            byStatus: ordersByStatus.map(item => ({
                status: item._id,
                count: item.count,
                revenue: item.revenue
            })),
            byPayment: paymentStats.map(item => ({
                isPaid: item._id,
                count: item.count,
                total: item.total
            }))
        }
    });
});

/**
 * @desc    Get top selling products
 * @route   GET /api/stats/top-products?limit=5
 * @access  Private/Admin
 */
export const getTopProducts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;

    const topProducts = await Order.aggregate([
        { $match: { isPaid: true } },
        { $unwind: '$orderItems' },
        {
            $group: {
                _id: '$orderItems.book',
                totalSold: { $sum: '$orderItems.quantity' },
                revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'books',
                localField: '_id',
                foreignField: '_id',
                as: 'bookDetails'
            }
        },
        { $unwind: '$bookDetails' }
    ]);

    res.json({
        success: true,
        data: topProducts.map(item => ({
            book: {
                _id: item.bookDetails._id,
                title: item.bookDetails.title,
                author: item.bookDetails.author,
                image: item.bookDetails.image,
                price: item.bookDetails.price
            },
            totalSold: item.totalSold,
            revenue: item.revenue
        }))
    });
});

/**
 * @desc    Get revenue by category
 * @route   GET /api/stats/categories
 * @access  Private/Admin
 */
export const getCategoryStats = asyncHandler(async (req, res) => {
    const categoryStats = await Order.aggregate([
        { $match: { isPaid: true } },
        { $unwind: '$orderItems' },
        {
            $lookup: {
                from: 'books',
                localField: 'orderItems.book',
                foreignField: '_id',
                as: 'bookDetails'
            }
        },
        { $unwind: '$bookDetails' },
        {
            $group: {
                _id: '$bookDetails.category',
                revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
                itemsSold: { $sum: '$orderItems.quantity' }
            }
        },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryDetails'
            }
        },
        { $unwind: '$categoryDetails' },
        { $sort: { revenue: -1 } }
    ]);

    res.json({
        success: true,
        data: categoryStats.map(item => ({
            category: {
                _id: item.categoryDetails._id,
                name: item.categoryDetails.name
            },
            revenue: item.revenue,
            itemsSold: item.itemsSold
        }))
    });
});

/**
 * @desc    Get user growth statistics
 * @route   GET /api/stats/user-growth?period=7days|30days
 * @access  Private/Admin
 */
export const getUserGrowth = asyncHandler(async (req, res) => {
    const { period = '30days' } = req.query;

    let startDate = new Date();
    let groupBy;

    switch (period) {
        case '7days':
            startDate.setDate(startDate.getDate() - 7);
            groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
            break;
        case '30days':
            startDate.setDate(startDate.getDate() - 30);
            groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
            break;
        default:
            startDate.setDate(startDate.getDate() - 30);
            groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const userGrowth = await User.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                role: 'user'
            }
        },
        {
            $group: {
                _id: groupBy,
                newUsers: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    res.json({
        success: true,
        data: {
            period,
            stats: userGrowth.map(item => ({
                date: item._id,
                newUsers: item.newUsers
            }))
        }
    });
});

export default {
    getOverviewStats,
    getRevenueStats,
    getOrderStats,
    getTopProducts,
    getCategoryStats,
    getUserGrowth
};
