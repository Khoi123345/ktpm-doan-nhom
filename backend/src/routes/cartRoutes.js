import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    removeMultipleFromCart,
    clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getCart).post(protect, addToCart).delete(protect, clearCart);
router.route('/remove-multiple').delete(protect, removeMultipleFromCart);
router.route('/:bookId').put(protect, updateCartItem).delete(protect, removeFromCart);

export default router;
