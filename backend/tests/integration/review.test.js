import request from 'supertest';
import app from '../../src/app.js';
import { connect, close, clear } from './setup.js';
import User from '../../src/models/User.js';
import Book from '../../src/models/Book.js';
import Category from '../../src/models/Category.js';
import Review from '../../src/models/Review.js';
import generateToken from '../../src/utils/generateToken.js';

beforeAll(async () => await connect(), 30000);
afterEach(async () => await clear());
afterAll(async () => await close());

describe('Review Integration Tests', () => {
    let userToken, adminToken, otherUserToken;
    let userId;
    let bookId;

    beforeEach(async () => {
        // Create Users
        const user = await User.create({
            name: 'Review User',
            email: 'review@example.com',
            password: 'Password123!',
        });
        userToken = generateToken(user._id);
        userId = user._id;

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'Password123!',
            role: 'admin'
        });
        adminToken = generateToken(admin._id);

        const otherUser = await User.create({
            name: 'Other User',
            email: 'other@example.com',
            password: 'Password123!',
        });
        otherUserToken = generateToken(otherUser._id);

        // Create Category
        const category = await Category.create({ name: 'Fiction' });

        // Create Book
        const book = await Book.create({
            title: 'Test Book',
            author: 'Author',
            price: 100000,
            category: category._id,
            stock: 10,
            description: 'Desc',
            images: ['img.jpg']
        });
        bookId = book._id;
    });

    describe('POST /api/reviews/books/:id/reviews', () => {
        it('should create review successfully', async () => {
            const res = await request(app)
                .post(`/api/reviews/books/${bookId}/reviews`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    rating: 5,
                    comment: 'Great book!'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.rating).toBe(5);
            expect(res.body.data.comment).toBe('Great book!');

            // Verify book rating updated
            const book = await Book.findById(bookId);
            expect(book.numReviews).toBe(1);
            expect(book.rating).toBe(5);
        });

        it('should prevent duplicate reviews', async () => {
            // First review
            await request(app)
                .post(`/api/reviews/books/${bookId}/reviews`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ rating: 5, comment: 'First' });

            // Second review
            const res = await request(app)
                .post(`/api/reviews/books/${bookId}/reviews`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ rating: 4, comment: 'Second' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/đã đánh giá/i);
        });
    });

    describe('GET /api/reviews/books/:id/reviews', () => {
        beforeEach(async () => {
            await Review.create({
                user: userId,
                book: bookId,
                rating: 5,
                comment: 'Test Comment'
            });
        });

        it('should get reviews for a book', async () => {
            const res = await request(app)
                .get(`/api/reviews/books/${bookId}/reviews`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].comment).toBe('Test Comment');
        });
    });

    describe('DELETE /api/reviews/:id', () => {
        let reviewId;

        beforeEach(async () => {
            const review = await Review.create({
                user: userId,
                book: bookId,
                rating: 5,
                comment: 'To Delete'
            });
            reviewId = review._id;

            // Manually update book stats since we used Review.create directly
            const book = await Book.findById(bookId);
            book.numReviews = 1;
            book.rating = 5;
            await book.save();
        });

        it('should allow user to delete their own review', async () => {
            const res = await request(app)
                .delete(`/api/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);

            // Verify book stats updated
            const book = await Book.findById(bookId);
            expect(book.numReviews).toBe(0);
            expect(book.rating).toBe(0);
        });

        it('should not allow user to delete other review', async () => {
            const res = await request(app)
                .delete(`/api/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${otherUserToken}`);

            expect(res.statusCode).toBe(401);
        });

        it('should allow admin to delete any review', async () => {
            const res = await request(app)
                .delete(`/api/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
        });
    });
});
