import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../features/orderSlice';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const OrderHistoryPage = () => {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(getMyOrders());
    }, [dispatch]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <FiClock className="text-yellow-500" />;
            case 'confirmed':
                return <FiCheckCircle className="text-blue-500" />;
            case 'processing':
                return <FiPackage className="text-blue-500" />;
            case 'shipped':
            case 'shipping':
                return <FiPackage className="text-purple-500" />;
            case 'delivered':
                return <FiCheckCircle className="text-green-500" />;
            case 'cancelled':
                return <FiXCircle className="text-red-500" />;
            case 'returned':
                return <FiPackage className="text-orange-500" />;
            default:
                return <FiClock className="text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            processing: 'Đang xử lý',
            shipped: 'Đang giao',
            shipping: 'Đang giao hàng',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy',
            returned: 'Đã hoàn',
        };
        return statusMap[status] || status;
    };

    const getPaymentStatusText = (isPaid) => {
        return isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Lịch sử đơn hàng</h1>

            {orders.length === 0 ? (
                <div className="card text-center py-12">
                    <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-600 mb-4">Chưa có đơn hàng nào</h2>
                    <Link to="/books" className="btn-primary">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="card hover:shadow-lg transition">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">
                                        Đơn hàng #{order._id.slice(-8).toUpperCase()}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 mt-3 md:mt-0">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(order.status)}
                                        <span className="font-medium">{getStatusText(order.status)}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${order.isPaid
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {getPaymentStatusText(order.isPaid)}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3 mb-4">
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-16 h-20 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium line-clamp-1">{item.title}</p>
                                            <p className="text-sm text-gray-600">
                                                {item.price.toLocaleString('vi-VN')} đ x {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-primary-600">
                                            {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="border-t pt-4 flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="space-y-1 mb-3 md:mb-0">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Phương thức thanh toán:</span> {order.paymentMethod}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Địa chỉ:</span> {order.shippingAddress.address}, {order.shippingAddress.city}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Tổng tiền</p>
                                        <p className="text-2xl font-bold text-primary-600">
                                            {order.totalPrice.toLocaleString('vi-VN')} đ
                                        </p>
                                    </div>
                                    <Link
                                        to={`/orders/${order._id}`}
                                        className="btn-secondary"
                                    >
                                        Chi tiết
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
