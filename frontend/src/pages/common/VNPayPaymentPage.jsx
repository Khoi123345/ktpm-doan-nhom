import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';

const VNPayPaymentPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }

        const createPayment = async () => {
            try {
                setLoading(true);
                const { data } = await axios.post(`/api/payment/vnpay/create`, {
                    orderId,
                    amount: 0, // Backend will get from order
                    orderDescription: `Thanh toán đơn hàng ${orderId}`,
                });

                if (data.success && data.data && data.data.paymentUrl) {
                    // Redirect to VNPay
                    window.location.href = data.data.paymentUrl;
                } else {
                    throw new Error('Không thể tạo link thanh toán');
                }
            } catch (err) {
                console.error('Payment error:', err);
                setError(err.response?.data?.message || 'Không thể tạo link thanh toán VNPay');
                setLoading(false);
                toast.error('Không thể tạo link thanh toán');
                setTimeout(() => navigate(`/orders/${orderId}`), 2000);
            }
        };

        createPayment();
    }, [orderId, userInfo, navigate]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Loader size="lg" />
                <p className="mt-4 text-gray-600">Đang chuyển đến cổng thanh toán VNPay...</p>
                <p className="text-sm text-gray-500 mt-2">Vui lòng không tắt trang này</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi thanh toán</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <p className="text-sm text-gray-500">Đang chuyển về trang đơn hàng...</p>
            </div>
        );
    }

    return null;
};

export default VNPayPaymentPage;
