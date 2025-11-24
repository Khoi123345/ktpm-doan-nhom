import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderById } from '../../features/orderSlice';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
    FiPackage,
    FiTruck,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiUser,
    FiPhone,
    FiMail,
    FiMapPin,
    FiRotateCcw,
} from 'react-icons/fi';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { order: currentOrder, loading } = useSelector((state) => state.orders);
    const [updating, setUpdating] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [returnReason, setReturnReason] = useState('');

    useEffect(() => {
        dispatch(getOrderById(id));
    }, [dispatch, id]);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-blue-100 text-blue-800',
            shipping: 'bg-purple-100 text-purple-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            returned: 'bg-orange-100 text-orange-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            processing: 'Đã xác nhận',
            shipping: 'Đang giao hàng',
            shipped: 'Đang giao hàng',
            delivered: 'Đã giao hàng',
            returned: 'Đã hoàn hàng',
            cancelled: 'Đã hủy',
        };
        return texts[status] || status;
    };

    const handleUpdateStatus = async (newStatus) => {
        if (window.confirm(`Bạn có chắc muốn chuyển trạng thái sang "${getStatusText(newStatus)}"?`)) {
            setUpdating(true);
            try {
                await api.put(`/orders/${id}/status`, { status: newStatus });
                toast.success('Cập nhật trạng thái thành công');
                dispatch(getOrderById(id));
            } catch (error) {
                toast.error(error.response?.data?.message || 'Cập nhật thất bại');
            } finally {
                setUpdating(false);
            }
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast.error('Vui lòng nhập lý do hủy đơn');
            return;
        }

        setUpdating(true);
        try {
            await api.put(`/orders/${id}/cancel`, { reason: cancelReason });
            toast.success('Đã hủy đơn hàng và trả hàng về kho');
            setShowCancelModal(false);
            setCancelReason('');
            dispatch(getOrderById(id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Hủy đơn thất bại');
        } finally {
            setUpdating(false);
        }
    };

    const handleReturnOrder = async () => {
        if (!returnReason.trim()) {
            toast.error('Vui lòng nhập lý do hoàn hàng');
            return;
        }

        setUpdating(true);
        try {
            await api.put(`/orders/${id}/return`, { reason: returnReason });
            toast.success('Đã đánh dấu hoàn hàng và trả hàng về kho');
            setShowReturnModal(false);
            setReturnReason('');
            dispatch(getOrderById(id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdatePayment = async () => {
        if (window.confirm('Xác nhận đơn hàng đã thanh toán?')) {
            setUpdating(true);
            try {
                await api.put(`/orders/${id}/pay`, {
                    id: 'ADMIN_CONFIRMED',
                    status: 'COMPLETED',
                    update_time: new Date().toISOString(),
                });
                toast.success('Cập nhật thanh toán thành công');
                dispatch(getOrderById(id));
            } catch (error) {
                toast.error(error.response?.data?.message || 'Cập nhật thất bại');
            } finally {
                setUpdating(false);
            }
        }
    };

    const handleUnpayOrder = async () => {
        if (window.confirm('Hủy trạng thái thanh toán? (Dùng khi đánh dấu nhầm)')) {
            setUpdating(true);
            try {
                await api.put(`/orders/${id}/unpay`);
                toast.success('Đã hủy trạng thái thanh toán');
                dispatch(getOrderById(id));
            } catch (error) {
                toast.error(error.response?.data?.message || 'Cập nhật thất bại');
            } finally {
                setUpdating(false);
            }
        }
    };

    if (loading) {
        return <div className="container mx-auto px-4 py-8 text-center">Đang tải...</div>;
    }

    if (!currentOrder) {
        return <div className="container mx-auto px-4 py-8 text-center">Không tìm thấy đơn hàng</div>;
    }

    const order = currentOrder;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="text-primary-600 hover:text-primary-700 mb-4"
                >
                    ← Quay lại danh sách
                </button>
                <h1 className="text-3xl font-bold">Chi tiết đơn hàng #{order._id}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Information */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Thông tin đơn hàng</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600 text-sm">Mã đơn hàng</p>
                                <p className="font-medium">#{order._id}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Trạng thái</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Ngày đặt hàng</p>
                                <p className="font-medium">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Phương thức thanh toán</p>
                                <p className="font-medium">{order.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Tổng tiền hàng</p>
                                <p className="font-medium">{order.itemsPrice.toLocaleString('vi-VN')} đ</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Phí vận chuyển</p>
                                <p className="font-medium">{order.shippingPrice.toLocaleString('vi-VN')} đ</p>
                            </div>
                            {order.couponApplied?.code && (
                                <div>
                                    <p className="text-gray-600 text-sm">Mã giảm giá</p>
                                    <p className="font-medium text-green-600">
                                        {order.couponApplied.code} (-{order.couponApplied.discountAmount.toLocaleString('vi-VN')} đ)
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-gray-600 text-sm">Tổng thanh toán</p>
                                <p className="font-bold text-lg text-primary-600">{order.totalPrice.toLocaleString('vi-VN')} đ</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Trạng thái thanh toán</p>
                                <p className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                    {order.isPaid ? `Đã thanh toán (${new Date(order.paidAt).toLocaleDateString('vi-VN')})` : 'Chưa thanh toán'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FiUser /> Thông tin khách hàng
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <FiUser className="text-gray-400" />
                                <span className="font-medium">{order.user?.name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiMail className="text-gray-400" />
                                <span>{order.user?.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiPhone className="text-gray-400" />
                                <span>{order.user?.phone || order.shippingAddress?.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FiMapPin /> Địa chỉ giao hàng
                        </h2>
                        <div className="space-y-2">
                            <p><span className="font-medium">Người nhận:</span> {order.shippingAddress.fullName}</p>
                            <p><span className="font-medium">Số điện thoại:</span> {order.shippingAddress.phone}</p>
                            <p><span className="font-medium">Địa chỉ:</span> {order.shippingAddress.address}</p>
                            <p><span className="font-medium">Quận/Huyện:</span> {order.shippingAddress.district}</p>
                            <p><span className="font-medium">Tỉnh/Thành phố:</span> {order.shippingAddress.city}</p>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Danh sách sản phẩm</h2>
                        <div className="space-y-4">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="flex gap-4 border-b pb-4 last:border-b-0">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-20 h-28 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.title}</h3>
                                        <p className="text-gray-600 mt-1">Số lượng: {item.quantity}</p>
                                        <p className="text-primary-600 font-semibold mt-1">
                                            {item.price.toLocaleString('vi-VN')} đ
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">
                                            {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Status Timeline */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Trạng thái vận chuyển</h2>
                        <div className="space-y-4">
                            <div className={`flex items-start gap-3 ${['pending', 'confirmed', 'shipping', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                                <FiCheckCircle className="mt-1" />
                                <div>
                                    <p className="font-medium">Đơn hàng đã đặt</p>
                                    <p className="text-sm">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                            <div className={`flex items-start gap-3 ${['confirmed', 'shipping', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                                <FiPackage className="mt-1" />
                                <div>
                                    <p className="font-medium">Đã xác nhận & đóng gói</p>
                                    {order.status === 'confirmed' && <p className="text-sm">Đang chuẩn bị...</p>}
                                </div>
                            </div>
                            <div className={`flex items-start gap-3 ${['shipping', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                                <FiTruck className="mt-1" />
                                <div>
                                    <p className="font-medium">Đang giao hàng</p>
                                    {order.status === 'shipping' && <p className="text-sm">Đang trên đường giao...</p>}
                                </div>
                            </div>
                            <div className={`flex items-start gap-3 ${order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                                <FiCheckCircle className="mt-1" />
                                <div>
                                    <p className="font-medium">Giao hàng thành công</p>
                                    {order.isDelivered && <p className="text-sm">{new Date(order.deliveredAt).toLocaleString('vi-VN')}</p>}
                                </div>
                            </div>
                            {order.status === 'returned' && (
                                <div className="flex items-start gap-3 text-orange-600">
                                    <FiRotateCcw className="mt-1" />
                                    <div>
                                        <p className="font-medium">Đã hoàn hàng về kho</p>
                                        {order.cancelReason && <p className="text-sm mt-1">Lý do: {order.cancelReason}</p>}
                                    </div>
                                </div>
                            )}
                            {order.status === 'cancelled' && (
                                <div className="flex items-start gap-3 text-red-600">
                                    <FiXCircle className="mt-1" />
                                    <div>
                                        <p className="font-medium">Đơn hàng đã bị hủy</p>
                                        {order.cancelReason && <p className="text-sm mt-1">Lý do: {order.cancelReason}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Hành động</h2>
                        <div className="space-y-3">
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => handleUpdateStatus('confirmed')}
                                    disabled={updating}
                                    className="btn-primary w-full"
                                >
                                    ✔️ Xác nhận đơn hàng
                                </button>
                            )}
                            {order.status === 'confirmed' && (
                                <button
                                    onClick={() => handleUpdateStatus('shipping')}
                                    disabled={updating}
                                    className="btn-primary w-full"
                                >
                                    🚚 Chuyển sang giao hàng
                                </button>
                            )}
                            {order.status === 'shipping' && (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus('delivered')}
                                        disabled={updating}
                                        className="btn-primary w-full"
                                    >
                                        ✅ Đánh dấu đã giao
                                    </button>
                                    <button
                                        onClick={() => setShowReturnModal(true)}
                                        disabled={updating}
                                        className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                                    >
                                        🔄 Khách không nhận - Hoàn hàng
                                    </button>
                                </>
                            )}

                            {!order.isPaid && order.status !== 'cancelled' && order.status !== 'returned' && (
                                <button
                                    onClick={handleUpdatePayment}
                                    disabled={updating}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    💵 Xác nhận đã thanh toán
                                </button>
                            )}
                            {order.isPaid && order.status !== 'delivered' && (
                                <button
                                    onClick={handleUnpayOrder}
                                    disabled={updating}
                                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                >
                                    ⚠️ Hủy trạng thái thanh toán
                                </button>
                            )}
                            {!order.isPaid && order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'returned' && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    disabled={updating}
                                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    ❌ Hủy đơn hàng
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Hủy đơn hàng</h3>
                        <p className="text-sm text-gray-600 mb-4">⚠️ Hàng sẽ được trả về kho tự động</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lý do hủy đơn *</label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="input-field"
                                rows="4"
                                placeholder="Nhập lý do hủy đơn (hết hàng, khách yêu cầu, sai thông tin...)"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                }}
                                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={updating || !cancelReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {updating ? 'Đang xử lý...' : 'Xác nhận hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Order Modal */}
            {showReturnModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Hoàn hàng về kho</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            ⚠️ Hàng sẽ được trả về kho tự động. Nếu khách muốn giao lại, tạo đơn mới.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lý do hoàn hàng *</label>
                            <textarea
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                className="input-field"
                                rows="4"
                                placeholder="Nhập lý do (khách không nhận, sai địa chỉ, không liên lạc được...)"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowReturnModal(false);
                                    setReturnReason('');
                                }}
                                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleReturnOrder}
                                disabled={updating || !returnReason.trim()}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                            >
                                {updating ? 'Đang xử lý...' : 'Xác nhận hoàn hàng'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrderDetail;
