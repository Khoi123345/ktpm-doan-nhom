import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import Rating from './Rating';
import Button from './Button';

const ProductCard = ({ book, onAddToCart, showQuickAdd = false, className = '' }) => {
    const finalPrice = book.discountPrice > 0 ? book.discountPrice : book.price;
    const discount = book.discountPrice > 0
        ? Math.round(((book.price - book.discountPrice) / book.price) * 100)
        : 0;

    return (
        <div className={`group relative ${className}`}>
            <Link to={`/books/${book._id}`} className="block">
                <div className="card hover:shadow-2xl transition-all duration-300 h-full overflow-hidden">
                    {/* Image Container */}
                    <div className="relative overflow-hidden rounded-t-lg">
                        <img
                            src={book.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
                            alt={book.title}
                            className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {discount > 0 && (
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                    -{discount}%
                                </span>
                            )}
                            {book.stock === 0 && (
                                <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                    Hết hàng
                                </span>
                            )}
                            {book.stock > 0 && book.stock < 5 && (
                                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                    Chỉ còn {book.stock}
                                </span>
                            )}
                        </div>

                        {/* Quick Add Overlay - Changed to View Details */}
                        {showQuickAdd && (
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                <Link
                                    to={`/books/${book._id}`}
                                    className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-primary-600 font-bold py-2 px-6 rounded-full shadow-lg hover:bg-primary-600 hover:text-white flex items-center gap-2"
                                >
                                    Xem chi tiết
                                </Link>
                            </div>
                        )}

                        {/* Out of Stock Overlay */}
                        {book.stock === 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">Hết hàng</span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Title */}
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[3.5rem]">
                            {book.title}
                        </h3>

                        {/* Author */}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-1">{book.author}</p>

                        {/* Rating */}
                        <div className="mb-3">
                            <Rating value={book.rating} text={`(${book.numReviews})`} size="sm" />
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-primary-600 font-bold text-xl">
                                    {finalPrice.toLocaleString('vi-VN')}đ
                                </span>
                                {discount > 0 && (
                                    <span className="text-gray-400 line-through text-sm">
                                        {book.price.toLocaleString('vi-VN')}đ
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

ProductCard.propTypes = {
    book: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        discountPrice: PropTypes.number,
        images: PropTypes.arrayOf(PropTypes.string).isRequired,
        rating: PropTypes.number,
        numReviews: PropTypes.number,
        stock: PropTypes.number,
    }).isRequired,
    onAddToCart: PropTypes.func,
    showQuickAdd: PropTypes.bool,
    className: PropTypes.string,
};

export default ProductCard;
