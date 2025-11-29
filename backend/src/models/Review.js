import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true,
        },
        rating: {
            type: Number,
            required: [true, 'Vui lòng chọn đánh giá'],
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: [true, 'Vui lòng nhập bình luận'],
            trim: true,
        },
        response: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate reviews from same user for same book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
