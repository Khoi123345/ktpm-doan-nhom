import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderById, clearOrder } from '../../features/orderSlice';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiArrowLeft, FiMapPin, FiPhone, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentOrder, loading, error } = useSelector((state) => ({
        currentOrder: state.orders.order,
        loading: state.orders.loading,
        error: state.orders.error
    }));

    useEffect(() => {
        if (id) {
            dispatch(getOrderById(id))
                .unwrap()
                .catch((err) => {
                    toast.error(err || 'Không thể tải thông tin đơn hàng');
                    navigate('/orders');
                });
        }

        // Cleanup on unmount
        return () => {
            dispatch(clearOrder());
        };
    }, [dispatch, id, navigate]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <FiClock className="text-yellow-500" />;
            case 'processing':
            case 'confirmed':
                return <FiPackage className="text-blue-500" />;
            case 'shipped':
            case 'shipping':
                return <FiPackage className="text-purple-500" />;
            case 'delivered':
                return <FiCheckCircle className="text-green-500" />;
            case 'cancelled':
                return <FiXCircle className="text-red-500" />;
            default:
                return <FiClock className="text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            processing: 'Đã xác nhận', // old status
            shipping: 'Đang giao',
            shipped: 'Đang giao', // old status
            delivered: 'Đã giao',
            returned: 'Đã hoàn hàng',
            cancelled: 'Đã hủy',
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !currentOrder) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <FiXCircle className="mx-auto text-6xl text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy đơn hàng</h2>
                <Link to="/orders" className="btn-primary">
                    Quay lại danh sách đơn hàng
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link to="/orders" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4">
                    <FiArrowLeft />
                    <span>Quay lại danh sách đơn hàng</span>
                </Link>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Đơn hàng #{currentOrder._id.slice(-8).toUpperCase()}
                        </h1>
                        <p className="text-gray-600">
                            Ngày đặt: {new Date(currentOrder.createdAt).toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                        <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(currentOrder.status)}`}>
                            {getStatusIcon(currentOrder.status)}
                            <span className="font-medium">{getStatusText(currentOrder.status)}</span>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${currentOrder.isPaid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {currentOrder.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Sản phẩm đã đặt</h2>
                        <div className="space-y-4">
                            {currentOrder.orderItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-20 h-28 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            Số lượng: {item.quantity}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Đơn giá: {item.price.toLocaleString('vi-VN')} đ
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-primary-600">
                                            {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <FiUser className="text-gray-500 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Người nhận</p>
                                    <p className="font-medium">{currentOrder.shippingAddress.fullName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiPhone className="text-gray-500 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Số điện thoại</p>
                                    <p className="font-medium">{currentOrder.shippingAddress.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiMapPin className="text-gray-500 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Địa chỉ</p>
                                    <p className="font-medium">
                                        {currentOrder.shippingAddress.address}, {currentOrder.shippingAddress.district}, {currentOrder.shippingAddress.city}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <div className="card sticky top-20">
                        <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>

                        {/* Payment Method */}
                        <div className="mb-4 pb-4 border-b">
                            <p className="text-sm text-gray-600 mb-1">Phương thức thanh toán</p>
                            <p className="font-medium">{currentOrder.paymentMethod}</p>
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tạm tính:</span>
                                <span>{currentOrder.itemsPrice.toLocaleString('vi-VN')} đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phí vận chuyển:</span>
                                <span>{currentOrder.shippingPrice.toLocaleString('vi-VN')} đ</span>
                            </div>
                            {currentOrder.couponApplied && currentOrder.couponApplied.discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá ({currentOrder.couponApplied.code}):</span>
                                    <span>-{currentOrder.couponApplied.discountAmount.toLocaleString('vi-VN')} đ</span>
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        <div className="border-t pt-4 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold">Tổng cộng:</span>
                                <span className="text-2xl font-bold text-primary-600">
                                    {currentOrder.totalPrice.toLocaleString('vi-VN')} đ
                                </span>
                            </div>
                        </div>

                        {/* Payment Status */}
                        {currentOrder.isPaid && currentOrder.paidAt && (
                            <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                                <p className="text-sm text-green-800">
                                    <span className="font-medium">Đã thanh toán:</span> {new Date(currentOrder.paidAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        )}

                        {/* Delivery Status */}
                        {currentOrder.isDelivered && currentOrder.deliveredAt && (
                            <div className="bg-green-50 border border-green-200 rounded p-3">
                                <p className="text-sm text-green-800">
                                    <span className="font-medium">Đã giao:</span> {new Date(currentOrder.deliveredAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
