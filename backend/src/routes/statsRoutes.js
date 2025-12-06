import express from 'express';
import {
    getOverviewStats,
    getRevenueStats,
    getOrderStats,
    getTopProducts,
    getCategoryStats,
    getUserGrowth
} from '../controllers/statsController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// All routes are protected and admin-only
router.use(protect, admin);

router.get('/overview', getOverviewStats);
router.get('/revenue', getRevenueStats);
router.get('/orders', getOrderStats);
router.get('/top-products', getTopProducts);
router.get('/categories', getCategoryStats);
router.get('/user-growth', getUserGrowth);

export default router;
