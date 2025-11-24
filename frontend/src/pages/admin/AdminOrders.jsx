import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getOrders } from '../../features/orderSlice';
import { toast } from 'react-toastify';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ActionButtons from '../../components/common/ActionButtons';
import Badge from '../../components/common/Badge';

const AdminOrders = () => {
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(getOrders());
    }, [dispatch]);

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

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={() => dispatch(getOrders())} />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Quản lý đơn hàng</h1>

            <div className="card overflow-x-auto">
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
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
