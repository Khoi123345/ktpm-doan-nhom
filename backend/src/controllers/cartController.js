import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Book from '../models/Book.js';

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.book', 'title author stock');

    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            items: [],
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

    // Check if book exists and has enough stock
    const book = await Book.findById(bookId);
    if (!book) {
        res.status(404);
        throw new Error('Không tìm thấy sách');
    }

    if (book.stock < quantity) {
        res.status(400);
        throw new Error(`Chỉ còn ${book.stock} sản phẩm trong kho`);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = new Cart({
            user: req.user._id,
            items: [],
        });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
        (item) => item.book.toString() === bookId
    );

    if (existingItemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;

        if (book.stock < newQuantity) {
            res.status(400);
            throw new Error(`Chỉ còn ${book.stock} sản phẩm trong kho`);
        }

        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].price = book.discountPrice || book.price;
    } else {
        // Add new item
        cart.items.push({
            book: bookId,
            title: book.title,
            image: book.images[0] || 'https://via.placeholder.com/150',
            price: book.discountPrice || book.price,
            quantity,
        });
    }

    await cart.save();
    await cart.populate('items.book', 'title author stock');

    res.json({
        success: true,
        data: cart,
    });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        res.status(400);
        throw new Error('Số lượng phải lớn hơn 0');
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        res.status(404);
        throw new Error('Không tìm thấy giỏ hàng');
    }

    const itemIndex = cart.items.findIndex(
        (item) => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    // Check stock
    const book = await Book.findById(cart.items[itemIndex].book);
    if (book.stock < quantity) {
        res.status(400);
        throw new Error(`Chỉ còn ${book.stock} sản phẩm trong kho`);
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = book.discountPrice || book.price;

    await cart.save();
    await cart.populate('items.book', 'title author stock');

    res.json({
        success: true,
        data: cart,
    });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
export const removeFromCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Không tìm thấy giỏ hàng');
    }

    cart.items = cart.items.filter(
        (item) => item._id.toString() !== req.params.itemId
    );

    await cart.save();
    await cart.populate('items.book', 'title author stock');

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
        res.status(404);
        throw new Error('Không tìm thấy giỏ hàng');
    }

    cart.items = [];
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
    clearCart,
};
