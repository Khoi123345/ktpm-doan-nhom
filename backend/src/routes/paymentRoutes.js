import express from 'express';
import {

    createMoMoPaymentUrl,
    momoReturn,
    momoIPN,
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();



// MoMo routes
router.post('/momo/create', protect, createMoMoPaymentUrl);
router.post('/momo/return', momoReturn);
router.post('/momo/ipn', momoIPN);

export default router;
