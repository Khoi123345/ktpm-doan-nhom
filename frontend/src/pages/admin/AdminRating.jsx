import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTopSellingBooks, getTopBuyers } from '../../features/orderSlice';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

const AdminRating = () => {
    const dispatch = useDispatch();
    const { topSellingBooks, topBuyers, loading, error } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(getTopSellingBooks());
        dispatch(getTopBuyers());
    }, [dispatch]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Xếp hạng</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Selling Books */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                        Top 5 Sách Bán Chạy
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="pb-2">#</th>
                                    <th className="pb-2">Sách</th>
                                    <th className="pb-2 text-right">Đã bán</th>
                                    <th className="pb-2 text-right">Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSellingBooks.map((book, index) => (
                                    <tr key={book._id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 text-gray-500 font-medium">{index + 1}</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={book.image}
                                                    alt={book.title}
                                                    className="w-10 h-14 object-cover rounded shadow-sm"
                                                />
                                                <span className="font-medium text-gray-800 line-clamp-2" title={book.title}>
                                                    {book.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-right font-semibold text-blue-600">
                                            {book.totalSold}
                                        </td>
                                        <td className="py-3 text-right text-gray-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.revenue || 0)}
                                        </td>
                                    </tr>
                                ))}
                                {topSellingBooks.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-4 text-center text-gray-500">
                                            Chưa có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Buyers */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                        Top 5 Khách Hàng Mua Nhiều
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="pb-2">#</th>
                                    <th className="pb-2">Khách hàng</th>
                                    <th className="pb-2 text-right">Đơn hàng</th>
                                    <th className="pb-2 text-right">Tổng chi tiêu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topBuyers.map((user, index) => (
                                    <tr key={user._id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 text-gray-500 font-medium">{index + 1}</td>
                                        <td className="py-3">
                                            <div>
                                                <p className="font-medium text-gray-800">{user.name || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 text-right font-semibold text-blue-600">
                                            {user.orderCount || 0}
                                        </td>
                                        <td className="py-3 text-right text-green-600 font-medium">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.totalSpent || 0)}
                                        </td>
                                    </tr>
                                ))}
                                {topBuyers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-4 text-center text-gray-500">
                                            Chưa có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRating;
