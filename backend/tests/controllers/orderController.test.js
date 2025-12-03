import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../src/models/Order.js', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        save: jest.fn(),
    })),
}));

jest.unstable_mockModule('../../src/models/Book.js', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.unstable_mockModule('../../src/models/Cart.js', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.unstable_mockModule('../../src/models/Coupon.js', () => ({
    __esModule: true,
    default: jest.fn(),
}));

// Add static methods to the mocks
const { default: OrderMock } = await import('../../src/models/Order.js');
Object.assign(OrderMock, {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
});

const { default: BookMock } = await import('../../src/models/Book.js');
Object.assign(BookMock, {
    findById: jest.fn(),
});

const { default: CartMock } = await import('../../src/models/Cart.js');
Object.assign(CartMock, {
    findOne: jest.fn(),
});

const { default: CouponMock } = await import('../../src/models/Coupon.js');
Object.assign(CouponMock, {
    findOne: jest.fn(),
});

// Import modules dynamically
const {
    createOrder,
    getOrderById,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    updateOrderToPaid,
    cancelOrder,
    returnOrder,
    getTopSellingBooks,
    getTopBuyers
} = await import('../../src/controllers/orderController.js');

const { default: Order } = await import('../../src/models/Order.js');
const { default: Book } = await import('../../src/models/Book.js');
const { default: Coupon } = await import('../../src/models/Coupon.js');
const { mockRequest, mockResponse, mockOrder, mockBook, mockUser } = await import('../helpers/testHelpers.js');

describe('orderController', () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        req.user = mockUser();
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        it('should create order successfully', async () => {
            const orderData = {
                orderItems: [{ book: 'book-id', quantity: 2, price: 100000, title: 'Book Title' }],
                shippingAddress: { fullName: 'Test', phone: '0123456789', address: '123 St' },
                paymentMethod: 'COD',
                itemsPrice: 200000,
                shippingPrice: 30000,
                totalPrice: 230000
            };
            req.body = orderData;

            const newOrder = mockOrder(orderData);
            newOrder.save = jest.fn().mockResolvedValue(newOrder);
            Order.mockImplementation(() => newOrder);

            const book = mockBook({ stock: 10 });
            Book.findById.mockResolvedValue(book);

            await createOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: newOrder
            });
            // Stock should NOT be reduced here
            expect(book.save).not.toHaveBeenCalled();
        });

        it('should return 400 when no items', async () => {
            req.body = { orderItems: [] };

            await expect(createOrder(req, res)).rejects.toThrow('Không có sản phẩm trong đơn hàng');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 when stock is insufficient', async () => {
            const orderData = {
                orderItems: [{ book: 'book-id', quantity: 20, title: 'Book Title' }]
            };
            req.body = orderData;

            const book = mockBook({ stock: 10, title: 'Book Title' });
            Book.findById.mockResolvedValue(book);

            await expect(createOrder(req, res)).rejects.toThrow('Sách "Book Title" không đủ số lượng trong kho');
            expect(res.status).toHaveBeenCalledWith(400);
        });


        it('should increment coupon usage when coupon code is provided', async () => {
            const orderData = {
                orderItems: [{ book: 'book-id', quantity: 1, price: 100, title: 'Book' }],
                couponCode: 'TEST10',
                totalPrice: 90
            };
            req.body = orderData;

            const newOrder = mockOrder(orderData);
            newOrder.save = jest.fn().mockResolvedValue(newOrder);
            Order.mockImplementation(() => newOrder);

            const book = mockBook({ stock: 10 });
            Book.findById.mockResolvedValue(book);

            const coupon = { code: 'TEST10', usedCount: 0, save: jest.fn() };
            Coupon.findOne.mockResolvedValue(coupon);

            await createOrder(req, res);

            expect(Coupon.findOne).toHaveBeenCalledWith({ code: 'TEST10' });
            expect(coupon.usedCount).toBe(1);
            expect(coupon.save).toHaveBeenCalled();
        });
    });

    describe('getOrderById', () => {
        it('should return order for owner', async () => {
            const order = mockOrder({ user: { _id: req.user._id } });
            req.params = { id: order._id };

            Order.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(order)
            });

            await getOrderById(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: order
            });
        });

        it('should return 404 when not found', async () => {
            req.params = { id: 'nonexistent-id' };

            Order.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await expect(getOrderById(req, res)).rejects.toThrow('Không tìm thấy đơn hàng');
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 403 when unauthorized', async () => {
            const order = mockOrder({ user: { _id: 'different-user-id' } });
            req.params = { id: order._id };
            req.user = mockUser({ role: 'customer' });

            Order.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(order)
            });

            await expect(getOrderById(req, res)).rejects.toThrow('Không có quyền truy cập đơn hàng này');
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('getMyOrders', () => {
        it('should return user orders', async () => {
            const orders = [mockOrder(), mockOrder()];

            Order.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(orders)
            });

            await getMyOrders(req, res);

            expect(Order.find).toHaveBeenCalledWith({ user: req.user._id });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: orders
            });
        });
    });



    describe('getOrders', () => {
        it('should return all orders (admin)', async () => {
            const orders = [mockOrder(), mockOrder()];
            Order.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(orders)
                })
            });

            await getOrders(req, res);

            expect(Order.find).toHaveBeenCalledWith({});
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: orders
            });
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status and reduce stock when confirmed', async () => {
            const order = mockOrder({
                status: 'pending',
                orderItems: [{ book: 'book-id', quantity: 2 }]
            });
            req.params = { id: order._id };
            req.body = { status: 'confirmed' };

            order.save = jest.fn().mockResolvedValue(order);
            Order.findById.mockResolvedValue(order);

            const book = mockBook({ stock: 10 });
            book.save = jest.fn().mockResolvedValue(true);
            Book.findById.mockResolvedValue(book);

            await updateOrderStatus(req, res);

            expect(order.status).toBe('confirmed');
            expect(book.stock).toBe(8); // 10 - 2
            expect(book.save).toHaveBeenCalled();
            expect(order.save).toHaveBeenCalled();
        });

        it('should restore stock when cancelled (if previously confirmed)', async () => {
            const order = mockOrder({
                status: 'confirmed', // Was confirmed, so stock was reduced
                orderItems: [{ book: 'book-id', quantity: 2 }]
            });
            req.params = { id: order._id };
            req.body = { status: 'cancelled' };

            order.save = jest.fn().mockResolvedValue(order);
            Order.findById.mockResolvedValue(order);

            const book = mockBook({ stock: 8 });
            book.save = jest.fn().mockResolvedValue(true);
            Book.findById.mockResolvedValue(book);

            await updateOrderStatus(req, res);

            expect(book.stock).toBe(10); // 8 + 2
            expect(book.save).toHaveBeenCalled();
        });


        it('should restore coupon usage when cancelled', async () => {
            const order = mockOrder({
                status: 'pending',
                couponApplied: { code: 'TEST10' }
            });
            req.params = { id: order._id };
            req.body = { status: 'cancelled' };

            order.save = jest.fn().mockResolvedValue(order);
            Order.findById.mockResolvedValue(order);

            const coupon = { code: 'TEST10', usedCount: 1, save: jest.fn() };
            Coupon.findOne.mockResolvedValue(coupon);

            await updateOrderStatus(req, res);

            expect(coupon.usedCount).toBe(0);
            expect(coupon.save).toHaveBeenCalled();
        });
    });

    describe('updateOrderToPaid', () => {
        it('should update order to paid', async () => {
            const order = mockOrder({ isPaid: false });
            req.params = { id: order._id };
            req.body = {
                id: 'payment-id',
                status: 'COMPLETED',
                update_time: '2024-01-01'
            };

            Order.findById.mockResolvedValue(order);
            order.save = jest.fn().mockResolvedValue(order);

            await updateOrderToPaid(req, res);

            expect(order.isPaid).toBe(true);
            expect(order.paidAt).toBeDefined();
            expect(order.paymentResult).toEqual({
                id: 'payment-id',
                status: 'COMPLETED',
                update_time: '2024-01-01'
            });
            expect(order.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: order
            });
        });

        it('should return 404 when order not found', async () => {
            req.params = { id: 'nonexistent-id' };
            Order.findById.mockResolvedValue(null);

            await expect(updateOrderToPaid(req, res)).rejects.toThrow('Không tìm thấy đơn hàng');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('cancelOrder', () => {
        it('should cancel order successfully (pending status, no stock restore)', async () => {
            const order = mockOrder({ status: 'pending', user: req.user._id });
            req.params = { id: order._id };

            order.save = jest.fn().mockResolvedValue(order);
            Order.findById.mockResolvedValue(order);

            await cancelOrder(req, res);

            expect(order.status).toBe('cancelled');
            expect(order.save).toHaveBeenCalled();
            // Should NOT call book save because status was pending
            expect(Book.findById).not.toHaveBeenCalled();
        });

        it('should cancel order and restore stock (confirmed status)', async () => {
            const order = mockOrder({
                status: 'confirmed',
                user: req.user._id,
                orderItems: [{ book: 'book-id', quantity: 2 }]
            });
            req.params = { id: order._id };

            order.save = jest.fn().mockResolvedValue(order);
            Order.findById.mockResolvedValue(order);

            const book = mockBook({ stock: 8 });
            book.save = jest.fn().mockResolvedValue(true);
            Book.findById.mockResolvedValue(book);

            await cancelOrder(req, res);

            expect(order.status).toBe('cancelled');
            expect(book.stock).toBe(10);
            expect(book.save).toHaveBeenCalled();
        });

        it('should return 400 when already delivered', async () => {
            const order = mockOrder({ status: 'delivered', user: req.user._id });
            req.params = { id: order._id };

            Order.findById.mockResolvedValue(order);

            await expect(cancelOrder(req, res)).rejects.toThrow('Không thể hủy đơn hàng đã giao, đã hủy hoặc đã hoàn');
            expect(res.status).toHaveBeenCalledWith(400);
        });


        it('should restore coupon usage when cancelled', async () => {
            const order = mockOrder({
                status: 'pending',
                user: req.user._id,
                couponApplied: { code: 'TEST10' }
            });
            req.params = { id: order._id };

            order.save = jest.fn().mockResolvedValue(order);
            Order.findById.mockResolvedValue(order);

            const coupon = { code: 'TEST10', usedCount: 5, save: jest.fn() };
            Coupon.findOne.mockResolvedValue(coupon);

            await cancelOrder(req, res);

            expect(coupon.usedCount).toBe(4);
            expect(coupon.save).toHaveBeenCalled();
        });

        it('should return 403 when unauthorized to cancel', async () => {
            const order = mockOrder({ user: 'different-user-id' });
            req.params = { id: order._id };
            req.user = mockUser({ role: 'customer' });

            Order.findById.mockResolvedValue(order);

            await expect(cancelOrder(req, res)).rejects.toThrow('Không có quyền hủy đơn hàng này');
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('returnOrder', () => {
        it('should return order and restore stock', async () => {
            const order = mockOrder({
                status: 'delivered',
                orderItems: [{ book: 'book-id', quantity: 2 }]
            });
            req.params = { id: order._id };

            order.save = jest.fn().mockResolvedValue(order);
            Order.findById.mockResolvedValue(order);

            const book = mockBook({ stock: 8 });
            book.save = jest.fn().mockResolvedValue(true);
            Book.findById.mockResolvedValue(book);

            await returnOrder(req, res);

            expect(order.status).toBe('returned');
            expect(book.stock).toBe(10);
            expect(book.save).toHaveBeenCalled();
            expect(order.save).toHaveBeenCalled();
        });

        it('should return 400 if already returned', async () => {
            const order = mockOrder({ status: 'returned' });
            req.params = { id: order._id };
            Order.findById.mockResolvedValue(order);

            await expect(returnOrder(req, res)).rejects.toThrow('Đơn hàng đã hủy hoặc đã hoàn');
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('getTopSellingBooks', () => {
        it('should return top selling books', async () => {
            const topBooks = [{ _id: 'book1', totalSold: 10 }];
            Order.aggregate.mockResolvedValue(topBooks);

            await getTopSellingBooks(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: topBooks
            });
        });
    });

    describe('getTopBuyers', () => {
        it('should return top buyers', async () => {
            const topBuyers = [{ _id: 'user1', totalSpent: 1000 }];
            Order.aggregate.mockResolvedValue(topBuyers);

            await getTopBuyers(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: topBuyers
            });
        });
    });
});
