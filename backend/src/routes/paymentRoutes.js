import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// MoMo routes
router.post('/momo/create', protect, paymentController.create);
router.post('/momo/ipn', paymentController.handleMomoIPN);
router.post('/momo/check-status', paymentController.checkStatus);
// router.post('/momo/return', paymentController.momoReturn); // Frontend handles return URL

export default router;
