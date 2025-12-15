import { jest } from '@jest/globals';
import crypto from 'crypto';

// Mock axios and config
const mockAxiosPost = jest.fn();

jest.unstable_mockModule('axios', () => ({
    default: {
        post: mockAxiosPost,
    },
}));

jest.unstable_mockModule('../../../src/config/env.js', () => ({
    default: {
        momo: {
            partnerCode: 'MOMO_PARTNER_CODE',
            accessKey: 'MOMO_ACCESS_KEY',
            secretKey: 'MOMO_SECRET_KEY',
            endpoint: 'https://test-momo.com/pay',
            redirectUrl: 'https://mysite.com/return',
            ipnUrl: 'https://mysite.com/ipn',
        },
    },
}));

// Import module under test
const { createMoMoPayment, verifyMoMoSignature, parseMoMoReturn } = await import('../../../src/utils/momoHelper.js');

describe('momoHelper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createMoMoPayment', () => {
        const mockOrderInfo = {
            orderId: 'ORDER_123',
            amount: 50000,
            orderDescription: 'Payment for order 123',
        };

        it('createPaymentRequestSuccessfully', async () => {
            const mockResponse = { payUrl: 'https://momo.vn/pay' };
            mockAxiosPost.mockResolvedValue({ data: mockResponse });

            const result = await createMoMoPayment(mockOrderInfo);

            expect(result).toEqual(mockResponse);
            expect(mockAxiosPost).toHaveBeenCalledWith(
                'https://test-momo.com/pay',
                expect.objectContaining({
                    partnerCode: 'MOMO_PARTNER_CODE',
                    accessKey: 'MOMO_ACCESS_KEY',
                    requestId: 'ORDER_123',
                    amount: 50000,
                    orderId: 'ORDER_123',
                    orderInfo: 'Payment for order 123',
                    redirectUrl: 'https://mysite.com/return',
                    ipnUrl: 'https://mysite.com/ipn',
                    requestType: 'captureWallet',
                    lang: 'vi',
                    signature: expect.any(String),
                })
            );
        });

        it('generateCorrectSignature', async () => {
            mockAxiosPost.mockResolvedValue({ data: {} });

            await createMoMoPayment(mockOrderInfo);

            const requestBody = mockAxiosPost.mock.calls[0][1];
            const signature = requestBody.signature;

            // Re-calculate signature to verify
            const rawSignature = `accessKey=MOMO_ACCESS_KEY&amount=50000&extraData=&ipnUrl=https://mysite.com/ipn&orderId=ORDER_123&orderInfo=Payment for order 123&partnerCode=MOMO_PARTNER_CODE&redirectUrl=https://mysite.com/return&requestId=ORDER_123&requestType=captureWallet`;
            const expectedSignature = crypto
                .createHmac('sha256', 'MOMO_SECRET_KEY')
                .update(rawSignature)
                .digest('hex');

            expect(signature).toBe(expectedSignature);
        });

        it('throwErrorIfAxiosFails', async () => {
            const mockError = new Error('Network error');
            mockAxiosPost.mockRejectedValue(mockError);

            await expect(createMoMoPayment(mockOrderInfo)).rejects.toThrow('Network error');
        });
    });

    describe('verifyMoMoSignature', () => {
        const baseParams = {
            partnerCode: 'MOMO_PARTNER_CODE',
            orderId: 'ORDER_123',
            requestId: 'ORDER_123',
            amount: 50000,
            orderInfo: 'Payment for order 123',
            orderType: 'momo_wallet',
            transId: 'TRANS_123',
            resultCode: 0,
            message: 'Success',
            payType: 'qr',
            responseTime: 1234567890,
            extraData: '',
        };

        it('returnTrueForValidSignature', () => {
            const rawSignature = `accessKey=MOMO_ACCESS_KEY&amount=${baseParams.amount}&extraData=${baseParams.extraData}&message=${baseParams.message}&orderId=${baseParams.orderId}&orderInfo=${baseParams.orderInfo}&orderType=${baseParams.orderType}&partnerCode=${baseParams.partnerCode}&payType=${baseParams.payType}&requestId=${baseParams.requestId}&responseTime=${baseParams.responseTime}&resultCode=${baseParams.resultCode}&transId=${baseParams.transId}`;

            const validSignature = crypto
                .createHmac('sha256', 'MOMO_SECRET_KEY')
                .update(rawSignature)
                .digest('hex');

            const params = { ...baseParams, signature: validSignature };

            const isValid = verifyMoMoSignature(params);
            expect(isValid).toBe(true);
        });

        it('returnFalseForInvalidSignature', () => {
            const params = { ...baseParams, signature: 'invalid_signature' };

            const isValid = verifyMoMoSignature(params);
            expect(isValid).toBe(false);
        });
    });

    describe('parseMoMoReturn', () => {
        it('parseSuccessReturnDataCorrectly', () => {
            const momoParams = {
                orderId: 'ORDER_123',
                amount: 50000,
                orderInfo: 'Payment info',
                resultCode: 0,
                transId: 'TRANS_123',
                message: 'Success',
                payType: 'qr',
                responseTime: 1234567890,
            };

            const result = parseMoMoReturn(momoParams);

            expect(result).toEqual({
                orderId: 'ORDER_123',
                amount: 50000,
                orderInfo: 'Payment info',
                resultCode: 0,
                transId: 'TRANS_123',
                message: 'Success',
                payType: 'qr',
                responseTime: 1234567890,
                isSuccess: true,
            });
        });

        it('parseFailedReturnDataCorrectly', () => {
            const momoParams = {
                orderId: 'ORDER_123',
                amount: 50000,
                orderInfo: 'Payment info',
                resultCode: 1006, // User cancelled
                transId: 'TRANS_123',
                message: 'User cancelled',
                payType: 'qr',
                responseTime: 1234567890,
            };

            const result = parseMoMoReturn(momoParams);

            expect(result.isSuccess).toBe(false);
            expect(result.resultCode).toBe(1006);
        });
    });
});
