import express from 'express';
import {
    createVNPayPaymentUrl,
    vnpayReturn,
    vnpayIPN,
    createMoMoPaymentUrl,
    momoReturn,
    momoIPN,
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// VNPay routes
router.post('/vnpay/create', protect, createVNPayPaymentUrl);
router.get('/vnpay/return', vnpayReturn);
router.post('/vnpay/ipn', vnpayIPN);

// MoMo routes
router.post('/momo/create', protect, createMoMoPaymentUrl);
router.post('/momo/return', momoReturn);
router.post('/momo/ipn', momoIPN);

export default router;
