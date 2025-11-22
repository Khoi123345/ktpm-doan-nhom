import express from 'express';
import {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    updateOrderAddress,
    returnOrder,
    unpayOrder,
} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, admin, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/unpay', protect, admin, unpayOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/cancel', protect, admin, cancelOrder);
router.put('/:id/address', protect, admin, updateOrderAddress);
router.put('/:id/return', protect, admin, returnOrder);

export default router;
