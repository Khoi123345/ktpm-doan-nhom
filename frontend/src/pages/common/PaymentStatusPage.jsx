import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { paymentAPI } from '../../services/api';
import { fetchCart } from '../../features/cartSlice';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const PaymentStatusPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Get all params from URL
                const params = Object.fromEntries([...searchParams]);

                // Call backend to check status
                const { data } = await paymentAPI.checkMoMoStatus(params);

                if (data.message === 'Payment successful') {
                    toast.success('Thanh toán thành công!');
                    dispatch(fetchCart()); // Sync cart with backend (items removed)
                    navigate('/payment/success');
                } else {
                    toast.error('Thanh toán thất bại!');
                    navigate('/payment/fail');
                }
            } catch (error) {
                console.error('Check status error:', error);
                toast.error('Lỗi kiểm tra trạng thái thanh toán');
                navigate('/payment/fail');
            } finally {
                setLoading(false);
            }
        };

        if (searchParams.get('resultCode')) {
            checkStatus();
        } else {
            // No params, redirect home
            navigate('/');
        }
    }, [searchParams, navigate]);

    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <Loader size="lg" />
            <p className="mt-4 text-gray-600">Đang kiểm tra trạng thái thanh toán...</p>
        </div>
    );
};

export default PaymentStatusPage;
