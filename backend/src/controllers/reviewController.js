import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Book from '../models/Book.js';

/**
 * @desc    Create a review
 * @route   POST /api/reviews/books/:id/reviews
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);

    if (!book) {
        res.status(404);
        throw new Error('Không tìm thấy sách');
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
        book: bookId,
        user: req.user._id,
    });

    if (alreadyReviewed) {
        res.status(400);
        throw new Error('Bạn đã đánh giá sách này rồi');
    }

    const review = await Review.create({
        user: req.user._id,
        book: bookId,
        rating: Number(rating),
        comment,
    });

    // Update book rating
    const reviews = await Review.find({ book: bookId });
    book.numReviews = reviews.length;
    book.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await book.save();

    res.status(201).json({
        success: true,
        data: review,
    });
});

/**
 * @desc    Get book reviews
 * @route   GET /api/reviews/books/:id/reviews
 * @access  Public
 */
export const getBookReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ book: req.params.id })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: reviews,
    });
});

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private/Admin
 */
export const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (review) {
        const bookId = review.book;
        await review.deleteOne();

        // Update book rating
        const book = await Book.findById(bookId);
        const reviews = await Review.find({ book: bookId });
        book.numReviews = reviews.length;
        book.rating = reviews.length > 0
            ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
            : 0;
        await book.save();

        res.json({
            success: true,
            message: 'Đã xóa đánh giá',
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đánh giá');
    }
});

/**
 * @desc    Get all reviews (Admin)
 * @route   GET /api/reviews/admin/all
 * @access  Private/Admin
 */
export const getAllReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({})
        .populate('user', 'name email')
        .populate('book', 'title')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: reviews,
    });
});

export default {
    createReview,
    getBookReviews,
    deleteReview,
    getAllReviews,
};
