import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../src/models/Order.js', () => ({
    __esModule: true,
    default: {
        find: jest.fn(),
        countDocuments: jest.fn(),
        aggregate: jest.fn()
    }
}));

jest.unstable_mockModule('../../../src/models/Book.js', () => ({
    __esModule: true,
    default: {
        countDocuments: jest.fn()
    }
}));

jest.unstable_mockModule('../../../src/models/User.js', () => ({
    __esModule: true,
    default: {
        countDocuments: jest.fn(),
        aggregate: jest.fn()
    }
}));

jest.unstable_mockModule('../../../src/models/Category.js', () => ({
    __esModule: true,
    default: {
        countDocuments: jest.fn()
    }
}));

// Import modules dynamically
const {
    getOverviewStats,
    getRevenueStats,
    getOrderStats,
    getTopProducts,
    getCategoryStats,
    getUserGrowth
} = await import('../../../src/controllers/statsController.js');

const { default: Order } = await import('../../../src/models/Order.js');
const { default: Book } = await import('../../../src/models/Book.js');
const { default: User } = await import('../../../src/models/User.js');
const { default: Category } = await import('../../../src/models/Category.js');
const { mockRequest, mockResponse } = await import('../helpers/testHelpers.js');

describe('statsController', () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('getOverviewStats', () => {
        it('returnOverviewStatistics', async () => {
            const mockOrders = [
                { isPaid: true, totalPrice: 100000, createdAt: new Date() },
                { isPaid: true, totalPrice: 200000, createdAt: new Date() },
                { isPaid: false, totalPrice: 50000, createdAt: new Date() }
            ];

            Order.find.mockResolvedValueOnce(mockOrders);
            Order.find.mockResolvedValueOnce([mockOrders[0]]);
            Order.find.mockResolvedValueOnce([]);
            Book.countDocuments.mockResolvedValue(100);
            User.countDocuments.mockResolvedValueOnce(50);
            User.countDocuments.mockResolvedValueOnce(5);
            User.countDocuments.mockResolvedValueOnce(3);
            Category.countDocuments.mockResolvedValue(10);

            await getOverviewStats(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    totalRevenue: 300000,
                    totalOrders: 3,
                    totalBooks: 100,
                    totalUsers: 50,
                    totalCategories: 10,
                    trends: expect.any(Object)
                })
            });
        });

        it('handleZeroDivisionInTrends', async () => {
            Order.find.mockResolvedValue([]);
            Book.countDocuments.mockResolvedValue(0);
            User.countDocuments.mockResolvedValue(0);
            Category.countDocuments.mockResolvedValue(0);

            await getOverviewStats(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    totalRevenue: 0,
                    totalOrders: 0,
                    totalBooks: 0,
                    totalUsers: 0,
                    totalCategories: 0
                })
            });
        });
    });

    describe('getRevenueStats', () => {
        it('return7DaysRevenueStats', async () => {
            req.query = { period: '7days' };
            const mockRevenueData = [
                { _id: '2024-12-01', revenue: 100000, orders: 5 },
                { _id: '2024-12-02', revenue: 150000, orders: 7 }
            ];

            Order.aggregate.mockResolvedValue(mockRevenueData);

            await getRevenueStats(req, res);

            expect(Order.aggregate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    period: '7days',
                    dateFormat: 'daily',
                    stats: mockRevenueData.map(item => ({
                        date: item._id,
                        revenue: item.revenue,
                        orders: item.orders
                    }))
                }
            });
        });

        it('return30DaysRevenueStats', async () => {
            req.query = { period: '30days' };
            const mockRevenueData = [
                { _id: '2024-11-15', revenue: 200000, orders: 10 }
            ];

            Order.aggregate.mockResolvedValue(mockRevenueData);

            await getRevenueStats(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    period: '30days',
                    dateFormat: 'daily',
                    stats: expect.any(Array)
                }
            });
        });

        it('return12MonthsRevenueStats', async () => {
            req.query = { period: '12months' };
            const mockRevenueData = [
                { _id: '2024-01', revenue: 5000000, orders: 100 },
                { _id: '2024-02', revenue: 6000000, orders: 120 }
            ];

            Order.aggregate.mockResolvedValue(mockRevenueData);

            await getRevenueStats(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    period: '12months',
                    dateFormat: 'monthly',
                    stats: expect.any(Array)
                }
            });
        });

        it('useDefaultPeriodWhenInvalid', async () => {
            req.query = { period: 'invalid' };
            Order.aggregate.mockResolvedValue([]);

            await getRevenueStats(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    period: 'invalid',
                    dateFormat: 'daily'
                })
            });
        });

        it('useDefaultPeriodWhenNotProvided', async () => {
            req.query = {};
            Order.aggregate.mockResolvedValue([]);

            await getRevenueStats(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    period: '7days',
                    dateFormat: 'daily'
                })
            });
        });
    });

    describe('getOrderStats', () => {
        it('returnOrderStatisticsByStatus', async () => {
            const mockOrdersByStatus = [
                { _id: 'PENDING', count: 10, revenue: 1000000 },
                { _id: 'CONFIRMED', count: 5, revenue: 500000 },
                { _id: 'DELIVERED', count: 20, revenue: 2000000 }
            ];

            const mockPaymentStats = [
                { _id: true, count: 25, total: 2500000 },
                { _id: false, count: 10, total: 1000000 }
            ];

            Order.aggregate
                .mockResolvedValueOnce(mockOrdersByStatus)
                .mockResolvedValueOnce(mockPaymentStats);

            await getOrderStats(req, res);

            expect(Order.aggregate).toHaveBeenCalledTimes(2);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    byStatus: mockOrdersByStatus.map(item => ({
                        status: item._id,
                        count: item.count,
                        revenue: item.revenue
                    })),
                    byPayment: mockPaymentStats.map(item => ({
                        isPaid: item._id,
                        count: item.count,
                        total: item.total
                    }))
                }
            });
        });

        it('handleEmptyOrderStats', async () => {
            Order.aggregate.mockResolvedValue([]);

            await getOrderStats(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    byStatus: [],
                    byPayment: []
                }
            });
        });
    });

    describe('getTopProducts', () => {
        it('returnTopSellingProducts', async () => {
            req.query = { limit: '5' };
            const mockTopProducts = [
                {
                    _id: 'book1',
                    totalSold: 100,
                    revenue: 5000000,
                    bookDetails: {
                        _id: 'book1',
                        title: 'Book 1',
                        author: 'Author 1',
                        image: 'image1.jpg',
                        price: 50000
                    }
                },
                {
                    _id: 'book2',
                    totalSold: 80,
                    revenue: 4000000,
                    bookDetails: {
                        _id: 'book2',
                        title: 'Book 2',
                        author: 'Author 2',
                        image: 'image2.jpg',
                        price: 50000
                    }
                }
            ];

            Order.aggregate.mockResolvedValue(mockTopProducts);

            await getTopProducts(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockTopProducts.map(item => ({
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

        it('useDefaultLimitWhenNotProvided', async () => {
            req.query = {};
            Order.aggregate.mockResolvedValue([]);

            await getTopProducts(req, res);

            expect(Order.aggregate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: []
            });
        });

        it('handleInvalidLimit', async () => {
            req.query = { limit: 'invalid' };
            Order.aggregate.mockResolvedValue([]);

            await getTopProducts(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: []
            });
        });
    });

    describe('getCategoryStats', () => {
        it('returnRevenueByCategoryStatistics', async () => {
            const mockCategoryStats = [
                {
                    _id: 'cat1',
                    revenue: 3000000,
                    itemsSold: 60,
                    categoryDetails: {
                        _id: 'cat1',
                        name: 'Fiction'
                    }
                },
                {
                    _id: 'cat2',
                    revenue: 2000000,
                    itemsSold: 40,
                    categoryDetails: {
                        _id: 'cat2',
                        name: 'Non-Fiction'
                    }
                }
            ];

            Order.aggregate.mockResolvedValue(mockCategoryStats);

            await getCategoryStats(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockCategoryStats.map(item => ({
                    category: {
                        _id: item.categoryDetails._id,
                        name: item.categoryDetails.name
                    },
                    revenue: item.revenue,
                    itemsSold: item.itemsSold
                }))
            });
        });

        it('handleEmptyCategoryStats', async () => {
            Order.aggregate.mockResolvedValue([]);

            await getCategoryStats(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: []
            });
        });
    });

    describe('getUserGrowth', () => {
        it('return7DaysUserGrowth', async () => {
            req.query = { period: '7days' };
            const mockUserGrowth = [
                { _id: '2024-12-01', newUsers: 5 },
                { _id: '2024-12-02', newUsers: 8 }
            ];

            User.aggregate.mockResolvedValue(mockUserGrowth);

            await getUserGrowth(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    period: '7days',
                    stats: mockUserGrowth.map(item => ({
                        date: item._id,
                        newUsers: item.newUsers
                    }))
                }
            });
        });

        it('return30DaysUserGrowth', async () => {
            req.query = { period: '30days' };
            const mockUserGrowth = [
                { _id: '2024-11-15', newUsers: 10 }
            ];

            User.aggregate.mockResolvedValue(mockUserGrowth);

            await getUserGrowth(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    period: '30days',
                    stats: expect.any(Array)
                }
            });
        });

        it('useDefaultPeriodWhenNotProvided', async () => {
            req.query = {};
            User.aggregate.mockResolvedValue([]);

            await getUserGrowth(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    period: '30days'
                })
            });
        });

        it('handleInvalidPeriod', async () => {
            req.query = { period: 'invalid' };
            User.aggregate.mockResolvedValue([]);

            await getUserGrowth(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    period: 'invalid'
                })
            });
        });
    });
});
