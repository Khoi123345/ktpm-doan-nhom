import express from 'express';
import { createReview, getBookReviews, deleteReview, getAllReviews } from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.post('/books/:id/reviews', protect, createReview);
router.get('/books/:id/reviews', getBookReviews);
router.get('/admin/all', protect, admin, getAllReviews);
router.delete('/:id', protect, admin, deleteReview);

export default router;
