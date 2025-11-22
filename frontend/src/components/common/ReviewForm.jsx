import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { createReview, resetCreateSuccess } from '../../features/reviewSlice';
import { FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Button from './Button';

const ReviewForm = ({ bookId, onSuccess }) => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    const { loading, createSuccess } = useSelector((state) => state.reviews);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);

    React.useEffect(() => {
        if (createSuccess) {
            toast.success('Đánh giá của bạn đã được gửi!');
            setRating(5);
            setComment('');
            dispatch(resetCreateSuccess());
            if (onSuccess) onSuccess();
        }
    }, [createSuccess, dispatch, onSuccess]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!userInfo) {
            toast.error('Vui lòng đăng nhập để đánh giá');
            return;
        }

        if (rating < 1 || rating > 5) {
            toast.error('Vui lòng chọn số sao từ 1-5');
            return;
        }

        if (!comment.trim()) {
            toast.error('Vui lòng nhập nhận xét');
            return;
        }

        dispatch(createReview({
            bookId,
            reviewData: { rating, comment }
        }));
    };

    if (!userInfo) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">Vui lòng đăng nhập để đánh giá sản phẩm</p>
                <Button onClick={() => window.location.href = '/login'}>
                    Đăng nhập
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Viết đánh giá của bạn</h3>

            {/* Rating */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đánh giá của bạn
                </label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <FiStar
                                size={32}
                                className={`${star <= (hoveredRating || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                    } transition-colors`}
                            />
                        </button>
                    ))}
                    <span className="ml-2 text-gray-600 self-center">
                        ({rating} sao)
                    </span>
                </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét của bạn
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input-field min-h-[120px] resize-none"
                    placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
                    required
                    maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {comment.length}/500 ký tự
                </p>
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={loading}
                className="w-full"
            >
                {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
        </form>
    );
};

ReviewForm.propTypes = {
    bookId: PropTypes.string.isRequired,
    onSuccess: PropTypes.func,
};

export default ReviewForm;
