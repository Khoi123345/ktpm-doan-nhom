import express from 'express';
import {
    getCoupons,
    getCouponByCode,
    validateCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getAllCoupons,
} from '../controllers/couponController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.get('/', getCoupons);
router.get('/admin/all', protect, admin, getAllCoupons);
router.post('/validate', validateCoupon);
router.post('/', protect, admin, createCoupon);
router.get('/:code', getCouponByCode);
router.route('/:id').put(protect, admin, updateCoupon).delete(protect, admin, deleteCoupon);

export default router;
