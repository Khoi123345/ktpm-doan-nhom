import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../src/models/Order.js', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.unstable_mockModule('../../../src/utils/momoHelper.js', () => ({
    __esModule: true,
    createMoMoPayment: jest.fn(),
    verifyMoMoSignature: jest.fn(),
    parseMoMoReturn: jest.fn(),
}));

jest.unstable_mockModule('../helpers/testHelpers.js', () => ({
    __esModule: true,
    mockRequest: () => ({
        body: {},
        params: {},
        query: {},
        headers: {},
        connection: { remoteAddress: '127.0.0.1' }
    }),
    mockResponse: () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.redirect = jest.fn().mockReturnValue(res);
        return res;
    },
    mockOrder: (data = {}) => ({
        _id: 'order-id',
        totalPrice: 100000,
        isPaid: false,
        save: jest.fn(),
        ...data
    })
}));

// Import modules dynamically
const { default: Order } = await import('../../../src/models/Order.js');
const { createMoMoPayment, verifyMoMoSignature, parseMoMoReturn } = await import('../../../src/utils/momoHelper.js');
const { mockRequest, mockResponse, mockOrder } = await import('../helpers/testHelpers.js');
const { createMoMoPaymentUrl, momoReturn, momoIPN } = await import('../../../src/controllers/paymentController.js');

describe('paymentController', () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();

        // Setup Order mock static methods
        Order.findById = jest.fn();
    });

    describe('createMoMoPaymentUrl', () => {
        it('createMoMoPaymentSuccessfully', async () => {
            const order = mockOrder({ _id: 'order-id', totalPrice: 100000 });
            req.body = { orderId: order._id, orderDescription: 'Test Order' };

            Order.findById.mockResolvedValue(order);
            createMoMoPayment.mockResolvedValue({
                resultCode: 0,
                payUrl: 'https://momo.vn/pay',
                qrCodeUrl: 'https://momo.vn/qr'
            });

            await createMoMoPaymentUrl(req, res);

            expect(createMoMoPayment).toHaveBeenCalledWith({
                orderId: order._id,
                amount: order.totalPrice,
                orderDescription: 'Test Order'
            });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    paymentUrl: 'https://momo.vn/pay',
                    qrCodeUrl: 'https://momo.vn/qr'
                }
            });
        });

        it('return404WhenOrderNotFound', async () => {
            req.body = { orderId: 'nonexistent-id' };
            Order.findById.mockResolvedValue(null);

            await expect(createMoMoPaymentUrl(req, res)).rejects.toThrow('Không tìm thấy đơn hàng');
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('return400WhenMoMoCreationFails', async () => {
            const order = mockOrder({ _id: 'order-id', totalPrice: 100000 });
            req.body = { orderId: order._id };
            Order.findById.mockResolvedValue(order);
            createMoMoPayment.mockResolvedValue({
                resultCode: 1,
                message: 'Error creating payment'
            });

            await expect(createMoMoPaymentUrl(req, res)).rejects.toThrow('Error creating payment');
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('momoReturn', () => {
        it('handleSuccessfulPaymentReturn', async () => {
            req.body = {
                partnerCode: 'MOMO',
                orderId: 'order-id',
                requestId: 'request-id',
                amount: 100000,
                orderInfo: 'Test Order',
                orderType: 'momo_wallet',
                transId: 123456789,
                resultCode: 0,
                message: 'Success',
                payType: 'qr',
                responseTime: 123456789,
                extraData: '',
                signature: 'valid-signature'
            };

            const order = mockOrder({ _id: 'order-id' });
            order.save = jest.fn().mockResolvedValue(order);

            verifyMoMoSignature.mockReturnValue(true);
            parseMoMoReturn.mockReturnValue({
                orderId: 'order-id',
                isSuccess: true,
                transId: 123456789,
                responseTime: 123456789
            });
            Order.findById.mockResolvedValue(order);

            await momoReturn(req, res);

            expect(order.isPaid).toBe(true);
            expect(order.status).toBe('processing');
            expect(order.save).toHaveBeenCalled();
            expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/payment/success'));
        });

        it('redirectToFailWhenSignatureIsInvalid', async () => {
            req.body = { signature: 'invalid' };
            verifyMoMoSignature.mockReturnValue(false);

            await momoReturn(req, res);

            expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/payment/fail'));
        });

        it('redirectToFailWhenPaymentResultIsNotSuccess', async () => {
            req.body = { signature: 'valid-signature' };
            verifyMoMoSignature.mockReturnValue(true);
            parseMoMoReturn.mockReturnValue({
                orderId: 'order-id',
                isSuccess: false
            });

            await momoReturn(req, res);

            expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/payment/fail'));
        });
    });

    describe('momoIPN', () => {
        it('handleSuccessfulIPN', async () => {
            req.body = {
                partnerCode: 'MOMO',
                orderId: 'order-id',
                resultCode: 0,
                signature: 'valid-signature'
            };

            const order = mockOrder({ _id: 'order-id', isPaid: false });
            order.save = jest.fn().mockResolvedValue(order);

            verifyMoMoSignature.mockReturnValue(true);
            parseMoMoReturn.mockReturnValue({
                orderId: 'order-id',
                isSuccess: true,
                transId: 123456789,
                responseTime: 123456789
            });
            Order.findById.mockResolvedValue(order);

            await momoIPN(req, res);

            expect(order.isPaid).toBe(true);
            expect(order.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ resultCode: 0, message: 'Success' });
        });

        it('return97WhenSignatureIsInvalid', async () => {
            req.body = { signature: 'invalid' };
            verifyMoMoSignature.mockReturnValue(false);

            await momoIPN(req, res);

            expect(res.json).toHaveBeenCalledWith({ resultCode: 97, message: 'Invalid signature' });
        });

        it('return1WhenPaymentResultIsNotSuccess', async () => {
            req.body = { signature: 'valid-signature' };
            verifyMoMoSignature.mockReturnValue(true);
            parseMoMoReturn.mockReturnValue({
                orderId: 'order-id',
                isSuccess: false
            });

            await momoIPN(req, res);

            expect(res.json).toHaveBeenCalledWith({ resultCode: 1, message: 'Payment failed' });
        });

        it('notUpdateOrderIfAlreadyPaid', async () => {
            req.body = { signature: 'valid-signature' };
            const order = mockOrder({ _id: 'order-id', isPaid: true });
            order.save = jest.fn();

            verifyMoMoSignature.mockReturnValue(true);
            parseMoMoReturn.mockReturnValue({
                orderId: 'order-id',
                isSuccess: true
            });
            Order.findById.mockResolvedValue(order);

            await momoIPN(req, res);

            expect(order.save).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ resultCode: 0, message: 'Success' });
        });
    });
});
