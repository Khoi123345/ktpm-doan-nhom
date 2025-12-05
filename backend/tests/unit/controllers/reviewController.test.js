import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../src/models/Review.js', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        save: jest.fn(),
    })),
}));

jest.unstable_mockModule('../../../src/models/Book.js', () => ({
    __esModule: true,
    default: {
        findById: jest.fn(),
    }
}));

// Add static methods to the mock
const { default: ReviewMock } = await import('../../../src/models/Review.js');
Object.assign(ReviewMock, {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
});

// Import modules dynamically
const {
    createReview,
    getBookReviews,
    updateReview,
    deleteReview,
    getAllReviews
} = await import('../../../src/controllers/reviewController.js');

const { default: Review } = await import('../../../src/models/Review.js');
const { default: Book } = await import('../../../src/models/Book.js');
const { mockRequest, mockResponse, mockReview, mockUser, mockBook } = await import('../helpers/testHelpers.js');

describe('reviewController', () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        req.user = mockUser();
        jest.clearAllMocks();
    });

    describe('getBookReviews', () => {
        it('returnAllReviewsForABook', async () => {
            const reviews = [mockReview(), mockReview()];
            req.params = { id: 'book-id' };

            Review.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(reviews)
            });

            await getBookReviews(req, res);

            expect(Review.find).toHaveBeenCalledWith({ book: 'book-id' });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: reviews
            });
        });
    });

    describe('createReview', () => {
        it('createReviewSuccessfully', async () => {
            const reviewData = {
                rating: 5,
                comment: 'Great book!'
            };
            req.params = { id: 'book-id' };
            req.body = reviewData;

            const book = mockBook({ _id: 'book-id', numReviews: 0, rating: 0 });
            book.save = jest.fn().mockResolvedValue(true);
            Book.findById.mockResolvedValue(book);

            Review.findOne.mockResolvedValue(null);

            const newReview = mockReview({ ...reviewData, book: 'book-id', user: req.user._id });
            Review.create.mockResolvedValue(newReview);

            // Mock finding reviews to update book rating
            const reviews = [newReview];
            Review.find.mockResolvedValue(reviews);

            await createReview(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(book.save).toHaveBeenCalled();
            expect(book.numReviews).toBe(1);
            expect(book.rating).toBe(5); // 5/1 = 5
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: newReview
            });
        });

        it('return404WhenBookNotFound', async () => {
            req.params = { id: 'nonexistent-id' };
            req.body = { rating: 5 };
            Book.findById.mockResolvedValue(null);

            await expect(createReview(req, res)).rejects.toThrow('Không tìm thấy sách');
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('return400WhenAlreadyReviewed', async () => {
            req.params = { id: 'book-id' };
            req.body = { rating: 5 };

            Book.findById.mockResolvedValue(mockBook());
            Review.findOne.mockResolvedValue(mockReview());

            await expect(createReview(req, res)).rejects.toThrow('Bạn đã đánh giá sách này rồi');
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateReview', () => {
        it('updateReviewSuccessfully', async () => {
            const review = mockReview({ user: req.user._id, book: 'book-id' });
            req.params = { id: review._id };
            req.body = { rating: 4, comment: 'Updated comment' };

            review.save = jest.fn().mockResolvedValue(review);
            Review.findById.mockResolvedValue(review);

            const book = mockBook({ _id: 'book-id' });
            book.save = jest.fn().mockResolvedValue(true);
            Book.findById.mockResolvedValue(book);

            Review.find.mockResolvedValue([review]);

            await updateReview(req, res);

            expect(review.rating).toBe(4);
            expect(review.save).toHaveBeenCalled();
            expect(book.rating).toBe(4); // 4/1 = 4
            expect(book.save).toHaveBeenCalled();
        });

        it('allowAdminToUpdateResponse', async () => {
            const review = mockReview({ user: 'user-id', book: 'book-id' });
            req.params = { id: review._id };
            req.body = { response: 'Thank you!' };
            req.user = mockUser({ role: 'admin' });

            review.save = jest.fn().mockResolvedValue(review);
            Review.findById.mockResolvedValue(review);

            const book = mockBook({ _id: 'book-id' });
            book.save = jest.fn().mockResolvedValue(true);
            Book.findById.mockResolvedValue(book);

            Review.find.mockResolvedValue([review]);

            await updateReview(req, res);

            expect(review.response).toBe('Thank you!');
            expect(review.save).toHaveBeenCalled();
        });

        it('return401WhenUnauthorized', async () => {
            const review = mockReview({ user: 'different-user-id' });
            req.params = { id: review._id };
            req.body = { rating: 4 };

            Review.findById.mockResolvedValue(review);

            await expect(updateReview(req, res)).rejects.toThrow('Không có quyền sửa đánh giá này');
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('return404WhenReviewNotFound', async () => {
            req.params = { id: 'nonexistent-id' };
            Review.findById.mockResolvedValue(null);

            await expect(updateReview(req, res)).rejects.toThrow('Không tìm thấy đánh giá');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteReview', () => {
        it('deleteReviewSuccessfully', async () => {
            const review = mockReview({ user: req.user._id, book: 'book-id' });
            req.params = { id: review._id };

            review.deleteOne = jest.fn().mockResolvedValue(true);
            Review.findById.mockResolvedValue(review);

            const book = mockBook({ _id: 'book-id' });
            book.save = jest.fn().mockResolvedValue(true);
            Book.findById.mockResolvedValue(book);

            Review.find.mockResolvedValue([]);

            await deleteReview(req, res);

            expect(review.deleteOne).toHaveBeenCalled();
            expect(book.numReviews).toBe(0);
            expect(book.rating).toBe(0);
            expect(book.save).toHaveBeenCalled();
        });

        it('allowAdminToDeleteAnyReview', async () => {
            const review = mockReview({ user: 'other-user-id', book: 'book-id' });
            req.params = { id: review._id };
            req.user = mockUser({ role: 'admin' });

            review.deleteOne = jest.fn().mockResolvedValue(true);
            Review.findById.mockResolvedValue(review);

            const book = mockBook({ _id: 'book-id' });
            book.save = jest.fn().mockResolvedValue(true);
            Book.findById.mockResolvedValue(book);

            Review.find.mockResolvedValue([]);

            await deleteReview(req, res);

            expect(review.deleteOne).toHaveBeenCalled();
        });

        it('return401WhenUnauthorized', async () => {
            const review = mockReview({ user: 'different-user-id' });
            req.params = { id: review._id };
            req.user = mockUser({ role: 'customer' });

            Review.findById.mockResolvedValue(review);

            await expect(deleteReview(req, res)).rejects.toThrow('Không có quyền xóa đánh giá này');
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('return404WhenReviewNotFound', async () => {
            req.params = { id: 'nonexistent-id' };
            Review.findById.mockResolvedValue(null);

            await expect(deleteReview(req, res)).rejects.toThrow('Không tìm thấy đánh giá');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('getAllReviews', () => {
        it('returnAllReviewsAdmin', async () => {
            const reviews = [mockReview(), mockReview()];

            Review.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(reviews)
            });

            await getAllReviews(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: reviews
            });
        });
    });
});
