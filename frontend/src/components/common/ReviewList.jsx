import React from 'react';
import PropTypes from 'prop-types';
import { FiStar, FiUser } from 'react-icons/fi';
import Rating from './Rating';

const ReviewList = ({ reviews, loading }) => {
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
                <div key={review._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                        <Rating value={review.rating} />
                    </div>
                    <p className="text-gray-700 mt-3 whitespace-pre-line">
                        {review.comment}
                    </p>
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
