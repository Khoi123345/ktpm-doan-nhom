import express from 'express';
import { createReview, getBookReviews, deleteReview, getAllReviews, updateReview } from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.post('/books/:id/reviews', protect, createReview);
router.get('/books/:id/reviews', getBookReviews);
router.get('/admin/all', protect, admin, getAllReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
