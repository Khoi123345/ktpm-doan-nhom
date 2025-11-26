import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Book from '../models/Book.js';

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.book', 'title author price discountPrice stock image images');

    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            items: [],
            totalItems: 0,
            totalPrice: 0,
        });
    }

    res.json({
        success: true,
        data: cart,
    });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res) => {
    const { bookId, quantity } = req.body;

    if (!bookId || !quantity) {
        res.status(400);
        throw new Error('Vui lòng cung cấp đầy đủ thông tin');
    }

    const book = await Book.findById(bookId);

    if (!book) {
        res.status(404);
        throw new Error('Không tìm thấy sách');
    }

    if (book.stock < quantity) {
        res.status(400);
        throw new Error('Số lượng sách trong kho không đủ');
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            items: [],
        });
    }

    const existingItem = cart.items.find((item) => item.book.toString() === bookId);

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > book.stock) {
            res.status(400);
            throw new Error('Số lượng sách trong kho không đủ');
        }
        existingItem.quantity = newQuantity;
        existingItem.price = book.discountPrice || book.price;
    } else {
        cart.items.push({
            book: bookId,
            quantity,
            price: book.discountPrice || book.price,
            title: book.title,
            image: book.images && book.images.length > 0 ? book.images[0] : '',
        });
    }

    await cart.save();
    await cart.populate('items.book', 'title author price discountPrice stock image images');

    res.json({
        success: true,
        data: cart,
    });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:bookId
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const bookId = req.params.bookId;

    if (!quantity || quantity < 1) {
        res.status(400);
        throw new Error('Số lượng không hợp lệ');
    }

    const book = await Book.findById(bookId);

    if (!book) {
        res.status(404);
        throw new Error('Không tìm thấy sách');
    }

    if (book.stock < quantity) {
        res.status(400);
        throw new Error('Số lượng vượt quá tồn kho');
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Không tìm thấy giỏ hàng');
    }

    const item = cart.items.find((item) => item.book.toString() === bookId);

    if (!item) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    item.quantity = quantity;
    item.price = book.discountPrice || book.price;

    await cart.save();
    await cart.populate('items.book', 'title author price discountPrice stock image images');

    res.json({
        success: true,
        data: cart,
    });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:bookId
 * @access  Private
 */
export const removeFromCart = asyncHandler(async (req, res) => {
    const bookId = req.params.bookId;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Không tìm thấy giỏ hàng');
    }

    cart.items = cart.items.filter((item) => item.book.toString() !== bookId);

    await cart.save();
    await cart.populate('items.book', 'title author price discountPrice stock image images');

    res.json({
        success: true,
        data: cart,
    });
});

/**
 * @desc    Remove multiple items from cart
 * @route   DELETE /api/cart/remove-multiple
 * @access  Private
 */
export const removeMultipleFromCart = asyncHandler(async (req, res) => {
    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds)) {
        res.status(400);
        throw new Error('Dữ liệu không hợp lệ');
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Không tìm thấy giỏ hàng');
    }

    // Remove items by filtering out items with matching book IDs
    cart.items = cart.items.filter((item) => !itemIds.includes(item.book.toString()));

    await cart.save();
    await cart.populate('items.book', 'title author price discountPrice stock image images');

    res.json({
        success: true,
        data: cart,
    });
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        // Create empty cart if not exists
        const newCart = await Cart.create({
            user: req.user._id,
            items: [],
            totalItems: 0,
            totalPrice: 0,
        });

        return res.json({
            success: true,
            data: newCart,
        });
    }

    // Clear all items
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();

    res.json({
        success: true,
        data: cart,
    });
});

export default {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    removeMultipleFromCart,
    clearCart,
};