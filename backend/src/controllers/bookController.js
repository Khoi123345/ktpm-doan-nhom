import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

/**
 * @desc    Get all books with filters
 * @route   GET /api/books
 * @access  Public
 */
export const getBooks = asyncHandler(async (req, res) => {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
        ? {
            $or: [
                { title: { $regex: req.query.keyword, $options: 'i' } },
                { author: { $regex: req.query.keyword, $options: 'i' } },
            ],
        }
        : {};

    const category = req.query.category ? { category: req.query.category } : {};

    let priceQuery = {};
    if (req.query.minPrice || req.query.maxPrice) {
        const conditions = [];
        if (req.query.minPrice) {
            conditions.push({
                $gte: [
                    { $cond: { if: { $gt: ["$discountPrice", 0] }, then: "$discountPrice", else: "$price" } },
                    Number(req.query.minPrice)
                ]
            });
        }
        if (req.query.maxPrice) {
            conditions.push({
                $lte: [
                    { $cond: { if: { $gt: ["$discountPrice", 0] }, then: "$discountPrice", else: "$price" } },
                    Number(req.query.maxPrice)
                ]
            });
        }

        if (conditions.length > 0) {
            priceQuery = { $expr: { $and: conditions } };
        }
    }

    const count = await Book.countDocuments({ ...keyword, ...category, ...priceQuery });
    const books = await Book.find({ ...keyword, ...category, ...priceQuery })
        .populate('category', 'name')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: books,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

/**
 * @desc    Get single book
 * @route   GET /api/books/:id
 * @access  Public
 */
export const getBookById = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id).populate('category', 'name');

    if (book) {
        res.json({
            success: true,
            data: book,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy sách');
    }
});

/**
 * @desc    Create a book
 * @route   POST /api/books
 * @access  Private/Admin
 */
export const createBook = asyncHandler(async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        price: req.body.price,
        discountPrice: req.body.discountPrice || 0,
        category: req.body.category,
        images: req.body.images || [],
        stock: req.body.stock,
        ISBN: req.body.ISBN,
        publisher: req.body.publisher,
        publishedDate: req.body.publishedDate,
        pages: req.body.pages,
        language: req.body.language || 'Tiếng Việt',
    });

    const createdBook = await book.save();
    res.status(201).json({
        success: true,
        data: createdBook,
    });
});

/**
 * @desc    Update a book
 * @route   PUT /api/books/:id
 * @access  Private/Admin
 */
export const updateBook = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);

    if (book) {
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.description = req.body.description || book.description;
        book.price = req.body.price || book.price;
        book.discountPrice = req.body.discountPrice ?? book.discountPrice;
        book.category = req.body.category || book.category;
        book.images = req.body.images || book.images;
        book.stock = req.body.stock ?? book.stock;
        book.ISBN = req.body.ISBN || book.ISBN;
        book.publisher = req.body.publisher || book.publisher;
        book.publishedDate = req.body.publishedDate || book.publishedDate;
        book.pages = req.body.pages || book.pages;
        book.language = req.body.language || book.language;

        const updatedBook = await book.save();
        res.json({
            success: true,
            data: updatedBook,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy sách');
    }
});

/**
 * @desc    Delete a book
 * @route   DELETE /api/books/:id
 * @access  Private/Admin
 */
export const deleteBook = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);

    if (book) {
        const orderExists = await Order.findOne({ 'orderItems.book': req.params.id });
        if (orderExists) {
            res.status(400);
            throw new Error('Không thể xóa sách này vì đã có trong đơn hàng');
        }

        await book.deleteOne();
        res.json({
            success: true,
            message: 'Đã xóa sách',
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy sách');
    }
});

/**
 * @desc    Get top rated books
 * @route   GET /api/books/top
 * @access  Public
 */
export const getTopBooks = asyncHandler(async (req, res) => {
    const books = await Book.find({}).sort({ rating: -1 }).limit(8).populate('category', 'name');

    res.json({
        success: true,
        data: books,
    });
});

/**
 * @desc    Get new arrivals
 * @route   GET /api/books/new
 * @access  Public
 */
export const getNewArrivals = asyncHandler(async (req, res) => {
    const books = await Book.find({}).sort({ createdAt: -1 }).limit(8).populate('category', 'name');

    res.json({
        success: true,
        data: books,
    });
});

/**
 * @desc    Upload book images
 * @route   POST /api/books/upload
 * @access  Private/Admin
 */
export const uploadBookImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error('Vui lòng chọn ảnh');
    }

    const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, 'bookstore/books')
    );

    const imageUrls = await Promise.all(uploadPromises);

    res.json({
        success: true,
        data: imageUrls,
    });
});

export default {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    getTopBooks,
    getNewArrivals,
    uploadBookImages,
};
