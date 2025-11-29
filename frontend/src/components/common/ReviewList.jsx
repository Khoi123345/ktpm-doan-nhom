import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { FiStar, FiUser, FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import { updateReview } from '../../features/reviewSlice';
import { toast } from 'react-toastify';
import Rating from './Rating';

const ReviewList = ({ reviews, loading }) => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    const [editingId, setEditingId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleEditClick = (review) => {
        setEditingId(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditRating(5);
        setEditComment('');
    };

    const handleSaveEdit = (reviewId) => {
        if (editRating < 1 || editRating > 5) {
            toast.error('Vui lòng chọn số sao');
            return;
        }
        if (!editComment.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }

        dispatch(updateReview({
            id: reviewId,
            reviewData: {
                rating: editRating,
                comment: editComment
            }
        }))
            .unwrap()
            .then(() => {
                toast.success('Đã cập nhật đánh giá');
                setEditingId(null);
            })
            .catch((err) => {
                toast.error(err || 'Không thể cập nhật đánh giá');
            });
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">Đang tải đánh giá...</p>
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FiStar size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600">Chưa có đánh giá nào</p>
                <p className="text-sm text-gray-500 mt-1">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    {editingId === review._id ? (
                        // Edit Mode
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setEditRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="focus:outline-none"
                                        >
                                            <FiStar
                                                size={24}
                                                className={`${star <= (hoveredRating || editRating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                    } transition-colors`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSaveEdit(review._id)}
                                        className="text-green-600 hover:text-green-700 p-2 rounded-full hover:bg-green-50"
                                        title="Lưu"
                                    >
                                        <FiCheck size={20} />
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                                        title="Hủy"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>
                            </div>
                            <textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                rows="3"
                                placeholder="Nhập nội dung đánh giá..."
                            />
                        </div>
                    ) : (
                        // View Mode
                        <>
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                        <FiUser className="text-primary-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {review.user?.name || 'Người dùng'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}

                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Rating value={review.rating} />
                                    {userInfo && review.user && (
                                        (userInfo._id?.toString() === review.user._id?.toString() || userInfo.role === 'admin')
                                    ) && (
                                            <button
                                                onClick={() => handleEditClick(review)}
                                                className="text-gray-400 hover:text-primary-600 transition-colors"
                                                title="Sửa đánh giá"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                        )}
                                </div>
                            </div>
                            <p className="text-gray-700 mt-3 whitespace-pre-line">
                                {review.comment}
                            </p>
                            {review.response && (
                                <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-sm font-semibold text-primary-600 mb-1">Phản hồi từ nhà sách:</p>
                                    <p className="text-sm text-gray-700">{review.response}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

ReviewList.propTypes = {
    reviews: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            user: PropTypes.shape({
                name: PropTypes.string,
            }),
            rating: PropTypes.number.isRequired,
            comment: PropTypes.string.isRequired,
            createdAt: PropTypes.string.isRequired,
        })
    ),
    loading: PropTypes.bool,
};

ReviewList.defaultProps = {
    reviews: [],
    loading: false,
};

export default ReviewList;
