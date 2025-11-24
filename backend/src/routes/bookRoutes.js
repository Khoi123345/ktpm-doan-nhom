import express from 'express';
import {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    getTopBooks,
    getNewArrivals,
    uploadBookImages,
} from '../controllers/bookController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/').get(getBooks).post(protect, admin, createBook);
router.get('/top', getTopBooks);
router.get('/new', getNewArrivals);
router.post('/upload', protect, admin, upload.array('images', 5), uploadBookImages);
router.route('/:id').get(getBookById).put(protect, admin, updateBook).delete(protect, admin, deleteBook);

export default router;
