import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../src/models/Cart.js', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
    }
}));

jest.unstable_mockModule('../../src/models/Book.js', () => ({
    __esModule: true,
    default: {
        findById: jest.fn(),
    }
}));

// Import modules dynamically
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    removeMultipleFromCart,
    clearCart
} = await import('../../src/controllers/cartController.js');

const { default: Cart } = await import('../../src/models/Cart.js');
const { default: Book } = await import('../../src/models/Book.js');
const { mockRequest, mockResponse, mockCart, mockBook, mockUser } = await import('../helpers/testHelpers.js');

describe('cartController', () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        req.user = mockUser();
        jest.clearAllMocks();
    });

    describe('getCart', () => {
        it('should return existing cart', async () => {
            const cart = mockCart({ user: req.user._id });

            Cart.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(cart)
            });

            await getCart(req, res);

            expect(Cart.findOne).toHaveBeenCalledWith({ user: req.user._id });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: cart
            });
        });

        it('should create new cart if not exists', async () => {
            const newCart = mockCart({ user: req.user._id });

            Cart.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });
            Cart.create.mockResolvedValue(newCart);

            await getCart(req, res);

            expect(Cart.create).toHaveBeenCalledWith({
                user: req.user._id,
                items: [],
                totalItems: 0,
                totalPrice: 0
            });
        });
    });

    describe('addToCart', () => {
        it('should add new item to cart', async () => {
            const book = mockBook();
            req.body = { bookId: book._id, quantity: 2 };

            const cart = mockCart({ user: req.user._id, items: [] });
            Book.findById.mockResolvedValue(book);
            Cart.findOne.mockResolvedValue(cart);

            await addToCart(req, res);

            expect(cart.items).toHaveLength(1);
            expect(cart.save).toHaveBeenCalled();
        });

        it('should update quantity for existing item', async () => {
            const book = mockBook();
            req.body = { bookId: book._id, quantity: 2 };

            const cart = mockCart({
                user: req.user._id,
                items: [{ book: book._id, quantity: 1, price: book.price }]
            });

            Book.findById.mockResolvedValue(book);
            Cart.findOne.mockResolvedValue(cart);

            await addToCart(req, res);

            expect(cart.items[0].quantity).toBe(3);
            expect(cart.save).toHaveBeenCalled();
        });

        it('should return 404 when book not found', async () => {
            req.body = { bookId: 'nonexistent-id', quantity: 1 };

            Book.findById.mockResolvedValue(null);

            await expect(addToCart(req, res)).rejects.toThrow('Không tìm thấy sách');
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 400 when stock insufficient', async () => {
            const book = mockBook({ stock: 5 });
            req.body = { bookId: book._id, quantity: 10 };

            Book.findById.mockResolvedValue(book);

            await expect(addToCart(req, res)).rejects.toThrow('Số lượng sách trong kho không đủ');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 when missing required fields', async () => {
            req.body = { bookId: 'some-id' };

            await expect(addToCart(req, res)).rejects.toThrow('Vui lòng cung cấp đầy đủ thông tin');
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateCartItem', () => {
        it('should update item quantity', async () => {
            const book = mockBook({ stock: 10 });
            req.params = { bookId: book._id };
            req.body = { quantity: 5 };

            const cart = mockCart({
                user: req.user._id,
                items: [{ book: book._id, quantity: 2, price: book.price }]
            });

            Book.findById.mockResolvedValue(book);
            Cart.findOne.mockResolvedValue(cart);

            await updateCartItem(req, res);

            expect(cart.items[0].quantity).toBe(5);
            expect(cart.save).toHaveBeenCalled();
        });

        it('should return 400 when quantity exceeds stock', async () => {
            const book = mockBook({ stock: 5 });
            req.params = { bookId: book._id };
            req.body = { quantity: 10 };

            Book.findById.mockResolvedValue(book);

            await expect(updateCartItem(req, res)).rejects.toThrow('Số lượng vượt quá tồn kho');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 when cart not found', async () => {
            const book = mockBook();
            req.params = { bookId: book._id };
            req.body = { quantity: 2 };

            Book.findById.mockResolvedValue(book);
            Cart.findOne.mockResolvedValue(null);

            await expect(updateCartItem(req, res)).rejects.toThrow('Không tìm thấy giỏ hàng');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('removeFromCart', () => {
        it('should remove item from cart', async () => {
            const bookId = '507f1f77bcf86cd799439012';
            req.params = { bookId };

            const cart = mockCart({
                user: req.user._id,
                items: [{ book: bookId, quantity: 2 }]
            });

            Cart.findOne.mockResolvedValue(cart);

            await removeFromCart(req, res);

            expect(cart.items).toHaveLength(0);
            expect(cart.save).toHaveBeenCalled();
        });

        it('should return 404 when cart not found', async () => {
            req.params = { bookId: 'some-id' };

            Cart.findOne.mockResolvedValue(null);

            await expect(removeFromCart(req, res)).rejects.toThrow('Không tìm thấy giỏ hàng');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('removeMultipleFromCart', () => {
        it('should remove multiple items', async () => {
            const itemIds = ['id1', 'id2'];
            req.body = { itemIds };

            const cart = mockCart({
                user: req.user._id,
                items: [
                    { book: 'id1', quantity: 1 },
                    { book: 'id2', quantity: 2 },
                    { book: 'id3', quantity: 3 }
                ]
            });

            Cart.findOne.mockResolvedValue(cart);

            await removeMultipleFromCart(req, res);

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].book).toBe('id3');
        });

        it('should return 400 when invalid data', async () => {
            req.body = { itemIds: 'not-an-array' };

            await expect(removeMultipleFromCart(req, res)).rejects.toThrow('Dữ liệu không hợp lệ');
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('clearCart', () => {
        it('should clear all items from cart', async () => {
            const cart = mockCart({
                user: req.user._id,
                items: [{ book: 'id1', quantity: 1 }],
                totalItems: 1,
                totalPrice: 100000
            });

            Cart.findOne.mockResolvedValue(cart);

            await clearCart(req, res);

            expect(cart.items).toHaveLength(0);
            expect(cart.totalItems).toBe(0);
            expect(cart.totalPrice).toBe(0);
            expect(cart.save).toHaveBeenCalled();
        });

        it('should create cart if not exists', async () => {
            const newCart = mockCart({ user: req.user._id });

            Cart.findOne.mockResolvedValue(null);
            Cart.create.mockResolvedValue(newCart);

            await clearCart(req, res);

            expect(Cart.create).toHaveBeenCalled();
        });
    });
});
