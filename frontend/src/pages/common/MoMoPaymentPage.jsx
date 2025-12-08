import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import { paymentAPI } from '../../services/api';

const MoMoPaymentPage = () => {
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
                // amount is 0 because backend calculates it from order
                const { data } = await paymentAPI.createMoMoPayment(
                    orderId,
                    0,
                    `Thanh toán đơn hàng ${orderId}`
                );

                if (data.success && data.data && data.data.paymentUrl) {
                    // Redirect to MoMo
                    window.location.href = data.data.paymentUrl;
                } else {
                    throw new Error('Không thể tạo link thanh toán');
                }
            } catch (err) {
                console.error('Payment error:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Không thể tạo link thanh toán MoMo';
                setError(errorMessage);
                setLoading(false);
                toast.error(errorMessage);
                // Don't auto redirect immediately on error so user can see the error
            }
        };

        createPayment();
    }, [orderId, userInfo, navigate]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Loader size="lg" />
                <p className="mt-4 text-gray-600">Đang chuyển đến cổng thanh toán MoMo...</p>
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
                <button
                    onClick={() => navigate(`/orders/${orderId}`)}
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                >
                    Quay lại đơn hàng
                </button>
            </div>
        );
    }

    return null;
};

export default MoMoPaymentPage;
