import express from 'express';
import {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    cancelOrder,
    returnOrder,
} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, admin, getOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/return', protect, admin, returnOrder);

export default router;
