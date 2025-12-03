import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, updateCartItem, clearCart, clearCartAsync, updateCartItemAsync, removeFromCartAsync } from '../../features/cartSlice';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems, itemsPrice, shippingPrice, totalPrice } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);
    const [selectedItems, setSelectedItems] = useState([]);

    // Initialize selectedItems with all items when cartItems loads
    useEffect(() => {
        // Only set if selectedItems is empty and we have cart items (initial load)
        // Or if cart items count changed (added/removed), we might want to re-sync
        // For simplicity, let's default to all selected on first load
        if (cartItems.length > 0 && selectedItems.length === 0) {
            setSelectedItems(cartItems.map(item => item._id));
        }
    }, [cartItems.length]);

    const handleRemove = (item) => {
        const bookId = userInfo ? item.book?._id : item._id;
        const cartItemId = item._id;

        if (userInfo) {
            if (bookId) {
                dispatch(removeFromCartAsync(bookId));
            }
        } else {
            dispatch(removeFromCart(bookId));
        }
        // Remove from selected items if it was selected
        setSelectedItems(prev => prev.filter(id => id !== cartItemId));
    };

    const handleUpdateQuantity = (item, quantity) => {
        const bookId = userInfo ? item.book?._id : item._id;

        if (quantity > 0) {
            if (userInfo) {
                if (bookId) {
                    dispatch(updateCartItemAsync({ bookId, quantity }))
                        .unwrap()
                        .catch((err) => toast.error(err));
                }
            } else {
                dispatch(updateCartItem({ id: bookId, quantity }));
            }
        }
    };

    const handleClearCart = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
            if (userInfo) {
                dispatch(clearCartAsync());
            } else {
                dispatch(clearCart());
            }
            setSelectedItems([]);
            toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(cartItems.map(item => item._id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    // Calculate totals based on selection
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item._id));
    const selectedItemsPrice = selectedCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const selectedShippingPrice = selectedItemsPrice > 200000 ? 0 : (selectedItemsPrice === 0 ? 0 : 30000);
    const selectedTotalPrice = selectedItemsPrice + selectedShippingPrice;

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
            return;
        }
        navigate('/checkout', { state: { selectedItems } });
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="bg-white p-8 rounded-2xl shadow-sm">
                        <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500">
                            <FiShoppingBag className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h2>
                        <p className="text-gray-500 mb-8">Có vẻ như bạn chưa thêm cuốn sách nào vào giỏ hàng. Hãy khám phá thêm nhé!</p>
                        <Button onClick={() => navigate('/books')} className="w-full py-3">
                            Khám Phá Sách Ngay
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Giỏ Hàng ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</h1>
                    <button
                        onClick={handleClearCart}
                        className="text-red-500 hover:text-red-700 font-medium flex items-center gap-2 transition"
                    >
                        <FiTrash2 /> Xóa tất cả
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="lg:w-2/3 space-y-4">
                        {/* Select All Header */}
                        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
                            <input
                                type="checkbox"
                                checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                                onChange={handleSelectAll}
                                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                            />
                            <span className="font-medium text-gray-700">Chọn tất cả ({cartItems.length} sản phẩm)</span>
                        </div>

                        {cartItems.map((item) => (
                            <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center transition hover:shadow-md">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item._id)}
                                    onChange={() => handleSelectItem(item._id)}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300 shrink-0"
                                />

                                <Link to={`/books/${userInfo ? item.book?._id : item._id}`} className="shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-24 h-32 object-cover rounded-lg border border-gray-100"
                                    />
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <Link to={`/books/${userInfo ? item.book?._id : item._id}`} className="font-semibold text-lg text-gray-900 hover:text-primary-600 line-clamp-1">
                                                {item.title}
                                            </Link>
                                            <p className="text-gray-500 text-sm">{item.author}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item)}
                                            className="text-gray-400 hover:text-red-500 p-2 transition"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                                className="p-2 hover:bg-gray-50 text-gray-600 transition disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                            >
                                                <FiMinus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-medium text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                                className="p-2 hover:bg-gray-50 text-gray-600 transition"
                                            >
                                                <FiPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-primary-600 font-bold text-lg">
                                                {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                            </p>
                                            {item.quantity > 1 && (
                                                <p className="text-gray-400 text-xs">
                                                    {item.price.toLocaleString('vi-VN')} đ / cuốn
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="mt-6">
                            <Link to="/books" className="inline-flex items-center text-primary-600 font-medium hover:underline gap-2">
                                <FiArrowLeft /> Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Tổng Đơn Hàng</h3>

                            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="flex justify-between text-gray-600">
                                    <span>Đã chọn</span>
                                    <span className="font-medium text-gray-900">{selectedItems.length} sản phẩm</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span className="font-medium text-gray-900">{selectedItemsPrice.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-medium text-gray-900">{selectedShippingPrice === 0 ? 'Miễn phí' : `${selectedShippingPrice.toLocaleString('vi-VN')} đ`}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                <span className="text-2xl font-bold text-primary-600">{selectedTotalPrice.toLocaleString('vi-VN')} đ</span>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                className="w-full py-4 text-lg shadow-lg shadow-primary-200"
                                disabled={selectedItems.length === 0}
                            >
                                Tiến Hành Thanh Toán ({selectedItems.length})
                            </Button>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-500">
                                    Bằng cách tiến hành thanh toán, bạn đồng ý với <Link to="/terms" className="text-primary-600 hover:underline">Điều khoản dịch vụ</Link> của chúng tôi.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
