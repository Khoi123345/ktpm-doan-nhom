import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllReviews, deleteReview } from '../../features/reviewSlice';
import { toast } from 'react-toastify';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ActionButtons from '../../components/common/ActionButtons';
import Rating from '../../components/common/Rating';

const AdminReviews = () => {
    const dispatch = useDispatch();
    const { reviews, loading, error } = useSelector((state) => state.reviews);

    useEffect(() => {
        dispatch(getAllReviews());
    }, [dispatch]);

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
                                    <p className="line-clamp-2 text-sm text-gray-700">{review.comment}</p>
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
