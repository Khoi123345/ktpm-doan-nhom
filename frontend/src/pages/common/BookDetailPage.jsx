import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getBookById, getBooks, clearBook } from '../../features/bookSlice';
import { addToCart, addToCartAsync } from '../../features/cartSlice';
import { getBookReviews } from '../../features/reviewSlice';
import { FiShoppingCart, FiMinus, FiPlus, FiHeart, FiShare2, FiCheck, FiTruck, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Rating from '../../components/common/Rating';
import Card from '../../components/common/Card';
import ReviewForm from '../../components/common/ReviewForm';
import ReviewList from '../../components/common/ReviewList';
import ProductCard from '../../components/common/ProductCard';

const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { book, books: relatedBooks, loading, error } = useSelector((state) => state.books);
    const { userInfo } = useSelector((state) => state.auth);
    const { reviews, loading: reviewsLoading } = useSelector((state) => state.reviews);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        dispatch(getBookById(id));
        dispatch(getBookReviews(id));
        window.scrollTo(0, 0);

        return () => {
            dispatch(clearBook());
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (book && book.category) {
            // Fetch related books
            dispatch(getBooks({ category: book.category._id, limit: 4 }));
        }
    }, [dispatch, book]);

    const handleAddToCart = () => {
        if (userInfo) {
            dispatch(addToCartAsync({ bookId: book._id, quantity }))
                .unwrap()
                .then(() => {
                    toast.success('Đã thêm vào giỏ hàng!');
                })
                .catch((err) => {
                    toast.error(err || 'Không thể thêm vào giỏ hàng');
                });
        } else {
            dispatch(addToCart({
                _id: book._id,
                title: book.title,
                author: book.author,
                price: book.discountPrice > 0 ? book.discountPrice : book.price,
                image: book.images?.[0],
                quantity,
            }));
            toast.success('Đã thêm vào giỏ hàng!');
        }
    };

    const handleBuyNow = () => {
        handleAddToCart();
        setTimeout(() => navigate('/cart'), 500);
    };

    const handleReviewSuccess = () => {
        dispatch(getBookReviews(id));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy sách</h2>
                <p className="text-gray-500 mb-8">Có thể sách này không tồn tại hoặc đã bị xóa.</p>
                <Button onClick={() => navigate('/books')}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    const finalPrice = book.discountPrice > 0 ? book.discountPrice : book.price;
    const discount = book.discountPrice > 0 ? Math.round(((book.price - book.discountPrice) / book.price) * 100) : 0;
    const images = book.images && book.images.length > 0 ? book.images : ['https://via.placeholder.com/400x600?text=No+Image'];

    // Filter out current book from related books
    const filteredRelatedBooks = relatedBooks.filter(b => b._id !== book._id).slice(0, 4);

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
                    <span className="mx-2">/</span>
                    <Link to="/books" className="hover:text-primary-600">Sách</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">{book.title}</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Images Column */}
                        <div className="p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
                            <div className="mb-6 relative group">
                                <img
                                    src={images[selectedImage]}
                                    alt={book.title}
                                    className="w-full h-[500px] object-contain rounded-lg transition-transform duration-300"
                                />
                                {discount > 0 && (
                                    <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                        -{discount}%
                                    </span>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-primary-600 ring-2 ring-primary-100' : 'border-gray-200 hover:border-primary-300'
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${book.title} ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info Column */}
                        <div className="p-8 lg:p-10 flex flex-col">
                            <div className="mb-auto">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <Link to={`/books?category=${book.category?._id}`} className="text-primary-600 font-medium text-sm hover:underline mb-2 block">
                                            {book.category?.name || 'Chưa phân loại'}
                                        </Link>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{book.title}</h1>
                                        <p className="text-lg text-gray-600">Tác giả: <span className="font-medium text-gray-900">{book.author}</span></p>
                                    </div>
                                    <button className="text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50">
                                        <FiHeart className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                    <Rating value={book.rating} text={`${book.numReviews} đánh giá`} />
                                    <div className="w-px h-4 bg-gray-300"></div>
                                    <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                                        <FiCheck /> {book.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                                    </span>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-end gap-4 mb-2">
                                        <span className="text-4xl font-bold text-primary-600">
                                            {finalPrice.toLocaleString('vi-VN')} đ
                                        </span>
                                        {discount > 0 && (
                                            <span className="text-xl text-gray-400 line-through mb-1">
                                                {book.price.toLocaleString('vi-VN')} đ
                                            </span>
                                        )}
                                    </div>
                                    {discount > 0 && (
                                        <p className="text-red-500 text-sm font-medium">Tiết kiệm: {(book.price - finalPrice).toLocaleString('vi-VN')} đ</p>
                                    )}
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <FiTruck />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Miễn phí vận chuyển</p>
                                            <p className="text-sm">Cho đơn hàng từ 500k</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                            <FiShield />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Bảo hành chính hãng</p>
                                            <p className="text-sm">Đổi trả trong 30 ngày</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {book.stock > 0 && (!userInfo || userInfo.role !== 'admin') ? (
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex items-center border border-gray-300 rounded-lg w-max">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="p-3 hover:bg-gray-50 text-gray-600 transition"
                                            >
                                                <FiMinus />
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, Math.min(book.stock, parseInt(e.target.value) || 1)))}
                                                className="w-16 text-center border-none focus:ring-0 font-medium"
                                                min="1"
                                                max={book.stock}
                                            />
                                            <button
                                                onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                                                className="p-3 hover:bg-gray-50 text-gray-600 transition"
                                            >
                                                <FiPlus />
                                            </button>
                                        </div>
                                        <Button
                                            onClick={handleAddToCart}
                                            className="flex-1 py-3 text-lg shadow-lg shadow-primary-200"
                                        >
                                            <FiShoppingCart className="mr-2" /> Thêm Vào Giỏ
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={handleBuyNow}
                                            className="flex-1 py-3 text-lg"
                                        >
                                            Mua Ngay
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500 font-medium">
                                        Sản phẩm tạm thời hết hàng
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium text-gray-900">Nhà xuất bản:</span> {book.publisher || 'N/A'}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">Năm xuất bản:</span> {book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'N/A'}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">Số trang:</span> {book.pages || 'N/A'}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">Ngôn ngữ:</span> {book.language || 'Tiếng Việt'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Description & Reviews */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm">
                            <h2 className="text-2xl font-bold mb-6">Mô tả sản phẩm</h2>
                            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                                {book.description}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm">
                            <h2 className="text-2xl font-bold mb-6">Đánh giá từ khách hàng</h2>
                            <div className="mb-8 bg-gray-50 p-6 rounded-xl">
                                <ReviewForm bookId={book._id} onSuccess={handleReviewSuccess} />
                            </div>
                            <ReviewList reviews={reviews} loading={reviewsLoading} />
                        </div>
                    </div>

                    {/* Related Products */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Sản phẩm tương tự</h3>
                            <div className="space-y-6">
                                {filteredRelatedBooks.length > 0 ? (
                                    filteredRelatedBooks.map(book => (
                                        <ProductCard key={book._id} book={book} className="shadow-sm border border-gray-100" />
                                    ))
                                ) : (
                                    <p className="text-gray-500">Không có sản phẩm tương tự</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailPage;
