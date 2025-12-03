import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import { createMoMoPayment, verifyMoMoSignature, parseMoMoReturn } from '../utils/momoHelper.js';

/**
 * @desc    Create MoMo payment
 * @route   POST /api/payment/momo/create
 * @access  Private
 */
export const createMoMoPaymentUrl = asyncHandler(async (req, res) => {
    const { orderId, orderDescription } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    const paymentResult = await createMoMoPayment({
        orderId,
        amount: order.totalPrice,
        orderDescription: orderDescription || `Thanh toán đơn hàng ${orderId}`,
    });

    if (paymentResult.resultCode === 0) {
        res.json({
            success: true,
            data: {
                paymentUrl: paymentResult.payUrl,
                qrCodeUrl: paymentResult.qrCodeUrl,
            },
        });
    } else {
        res.status(400);
        throw new Error(paymentResult.message || 'Tạo thanh toán MoMo thất bại');
    }
});

/**
 * @desc    MoMo return URL handler
 * @route   POST /api/payment/momo/return
 * @access  Public
 */
export const momoReturn = asyncHandler(async (req, res) => {
    const momoParams = req.body;

    const isValid = verifyMoMoSignature(momoParams);

    if (!isValid) {
        return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=Invalid signature`);
    }

    const paymentResult = parseMoMoReturn(momoParams);

    if (paymentResult.isSuccess) {
        const order = await Order.findById(paymentResult.orderId);
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: paymentResult.transId,
                status: 'completed',
                update_time: paymentResult.responseTime,
            };
            order.status = 'processing';
            await order.save();
        }

        res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${paymentResult.orderId}`);
    } else {
        res.redirect(`${process.env.FRONTEND_URL}/payment/fail?orderId=${paymentResult.orderId}`);
    }
});

/**
 * @desc    MoMo IPN handler
 * @route   POST /api/payment/momo/ipn
 * @access  Public
 */
export const momoIPN = asyncHandler(async (req, res) => {
    const momoParams = req.body;

    const isValid = verifyMoMoSignature(momoParams);

    if (!isValid) {
        return res.json({ resultCode: 97, message: 'Invalid signature' });
    }

    const paymentResult = parseMoMoReturn(momoParams);

    if (paymentResult.isSuccess) {
        const order = await Order.findById(paymentResult.orderId);
        if (order && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: paymentResult.transId,
                status: 'completed',
                update_time: paymentResult.responseTime,
            };
            order.status = 'processing';
            await order.save();
        }

        res.json({ resultCode: 0, message: 'Success' });
    } else {
        res.json({ resultCode: 1, message: 'Payment failed' });
    }
});

export default {
    createMoMoPaymentUrl,
    momoReturn,
    momoIPN,
};
