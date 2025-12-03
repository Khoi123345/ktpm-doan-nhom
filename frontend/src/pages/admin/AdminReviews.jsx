import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllReviews, deleteReview } from '../../features/reviewSlice';
import { toast } from 'react-toastify';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ActionButtons from '../../components/common/ActionButtons';
import Rating from '../../components/common/Rating';
import { updateReview } from '../../features/reviewSlice';
import { FiMessageSquare, FiSend, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import Button from '../../components/common/Button';

const AdminReviews = () => {
    const dispatch = useDispatch();
    const { reviews, loading, error } = useSelector((state) => state.reviews);
    const [editingResponseId, setEditingResponseId] = useState(null);
    const [editResponseText, setEditResponseText] = useState('');

    useEffect(() => {
        dispatch(getAllReviews());
    }, [dispatch]);

    const handleResponse = (id, responseText) => {
        dispatch(updateReview({
            id,
            reviewData: { response: responseText }
        }))
            .unwrap()
            .then(() => {
                toast.success('Đã gửi phản hồi thành công');
                dispatch(getAllReviews());
            })
            .catch((err) => toast.error(err));
    };

    const handleAutoResponse = (id) => {
        handleResponse(id, 'Cảm ơn bạn đã đánh giá sản phẩm');
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            dispatch(deleteReview(id))
                .unwrap()
                .then(() => {
                    toast.success('Đã xóa đánh giá thành công');
                    dispatch(getAllReviews()); // Refresh list
                })
                .catch((err) => toast.error(err));
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={() => dispatch(getAllReviews())} />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Quản lý đánh giá</h1>

            <div className="card overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b bg-gray-50">
                            <th className="p-4">Sách</th>
                            <th className="p-4">Người đánh giá</th>
                            <th className="p-4">Đánh giá</th>
                            <th className="p-4">Nhận xét</th>
                            <th className="p-4">Ngày tạo</th>
                            <th className="p-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review) => (
                            <tr key={review._id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                    <p className="font-medium">{review.book?.title || 'N/A'}</p>
                                </td>
                                <td className="p-4">
                                    <p className="font-medium">{review.user?.name || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{review.user?.email}</p>
                                </td>
                                <td className="p-4">
                                    <Rating value={review.rating} />
                                </td>
                                <td className="p-4 max-w-md">
                                    <p className="line-clamp-2 text-sm text-gray-700 mb-2">{review.comment}</p>
                                    {review.response && editingResponseId !== review._id && (
                                        <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 mb-2 flex justify-between items-start group">
                                            <span><span className="font-bold">Phản hồi:</span> {review.response}</span>
                                            <button
                                                onClick={() => {
                                                    setEditingResponseId(review._id);
                                                    setEditResponseText(review.response);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                title="Sửa phản hồi"
                                            >
                                                <FiEdit2 />
                                            </button>
                                        </div>
                                    )}
                                    {editingResponseId === review._id && (
                                        <div className="flex gap-1 mb-2">
                                            <input
                                                type="text"
                                                value={editResponseText}
                                                onChange={(e) => setEditResponseText(e.target.value)}
                                                className="text-xs border rounded px-2 py-1 flex-1"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleResponse(review._id, editResponseText);
                                                        setEditingResponseId(null);
                                                    } else if (e.key === 'Escape') {
                                                        setEditingResponseId(null);
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => {
                                                    handleResponse(review._id, editResponseText);
                                                    setEditingResponseId(null);
                                                }}
                                                className="text-green-600 hover:text-green-700 p-1"
                                            >
                                                <FiCheck />
                                            </button>
                                            <button
                                                onClick={() => setEditingResponseId(null)}
                                                className="text-red-600 hover:text-red-700 p-1"
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    )}
                                    {!review.response && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleAutoResponse(review._id)}
                                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                                            >
                                                Phản hồi tự động
                                            </button>
                                            <div className="flex-1 flex gap-1">
                                                <input
                                                    type="text"
                                                    placeholder="Phản hồi thủ công..."
                                                    className="text-xs border rounded px-2 py-1 flex-1"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleResponse(review._id, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-sm">
                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-4">
                                    <ActionButtons
                                        onDelete={() => handleDelete(review._id)}
                                        deleteTitle="Xóa đánh giá"
                                    />
                                </td>
                            </tr>
                        ))}
                        {reviews.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    Chưa có đánh giá nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminReviews;
