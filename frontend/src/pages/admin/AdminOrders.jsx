import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getOrders } from '../../features/orderSlice';
import { toast } from 'react-toastify';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ActionButtons from '../../components/common/ActionButtons';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

const AdminOrders = () => {
    const dispatch = useDispatch();
    const { orders, loading, error, page, pages, total } = useSelector((state) => state.orders);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(getOrders({ page: currentPage, limit: 5 }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dispatch, currentPage]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const getPaymentBadge = (isPaid) => (
        <Badge variant={isPaid ? 'success' : 'warning'}>
            {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </Badge>
    );

    const getOrderStatusBadge = (status) => {
        const statusConfig = {
            pending: { variant: 'warning', text: 'Chờ xác nhận' },
            confirmed: { variant: 'info', text: 'Đã xác nhận' },
            processing: { variant: 'info', text: 'Đã xác nhận' },
            shipping: { variant: 'info', text: 'Đang giao' },
            shipped: { variant: 'info', text: 'Đang giao' },
            delivered: { variant: 'success', text: 'Đã giao' },
            returned: { variant: 'warning', text: 'Đã hoàn' },
            cancelled: { variant: 'error', text: 'Đã hủy' },
        };

        const config = statusConfig[status] || { variant: 'gray', text: status };
        return <Badge variant={config.variant}>{config.text}</Badge>;
    };

    if (error) return <ErrorState message={error} onRetry={() => dispatch(getOrders({ page: currentPage, limit: 5 }))} />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
                <div className="text-sm text-gray-500">
                    Trang: {page} | Tổng trang: {pages} | Tổng đơn: {total}
                </div>
            </div>

            <div className="relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-start justify-center pt-20 pointer-events-none">
                        <div className="bg-white/90 p-3 rounded-full shadow-lg backdrop-blur-sm">
                            <LoadingState />
                        </div>
                    </div>
                )}

                <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="card overflow-x-auto mb-6">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b bg-gray-50">
                                    <th className="p-4">Mã đơn</th>
                                    <th className="p-4">Khách hàng</th>
                                    <th className="p-4">Ngày đặt</th>
                                    <th className="p-4">Tổng tiền</th>
                                    <th className="p-4">Thanh toán</th>
                                    <th className="p-4">Trạng thái đơn</th>
                                    <th className="p-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-mono text-sm">{order._id.slice(-8).toUpperCase()}</td>
                                        <td className="p-4">
                                            <p className="font-medium">{order.user?.name || 'Khách lẻ'}</p>
                                            <p className="text-xs text-gray-500">{order.user?.email}</p>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="p-4 font-semibold text-primary-600">
                                            {order.totalPrice.toLocaleString('vi-VN')} đ
                                        </td>
                                        <td className="p-4">
                                            {getPaymentBadge(order.isPaid)}
                                        </td>
                                        <td className="p-4">
                                            {getOrderStatusBadge(order.status)}
                                        </td>
                                        <td className="p-4">
                                            <ActionButtons
                                                onView={() => window.location.href = `/admin/orders/${order._id}`}
                                                viewTitle="Xem chi tiết"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-500">
                                            Chưa có đơn hàng nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pages > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={pages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
