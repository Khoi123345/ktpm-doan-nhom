import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress, savePaymentMethod, applyCoupon, removeCoupon, clearCart, clearCartAsync } from '../../features/cartSlice';
import { createOrder } from '../../features/orderSlice';
import { validateCoupon } from '../../features/couponSlice';
import { FiTag, FiX, FiCreditCard, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { cartItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, discountAmount, totalPrice, appliedCoupon } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);
    const { loading: orderLoading } = useSelector((state) => state.orders);

    const [fullName, setFullName] = useState(shippingAddress.fullName || userInfo?.name || '');
    const [phone, setPhone] = useState(shippingAddress.phone || '');
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [district, setDistrict] = useState(shippingAddress.district || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [selectedPayment, setSelectedPayment] = useState(paymentMethod || 'COD');
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=/checkout');
        }
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [userInfo, cartItems, navigate]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Vui lòng nhập mã giảm giá');
            return;
        }

        setCouponLoading(true);
        try {
            const result = await dispatch(validateCoupon({ code: couponCode, orderValue: itemsPrice })).unwrap();
            dispatch(applyCoupon(result.coupon));
            toast.success('Áp dụng mã giảm giá thành công!');
            setCouponCode('');
        } catch (error) {
            toast.error(error || 'Mã giảm giá không hợp lệ');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        dispatch(removeCoupon());
        toast.info('Đã xóa mã giảm giá');
    };

    const handlePlaceOrder = () => {
        if (!fullName || !phone || !address || !district || !city) {
            toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
            return;
        }

        // Save shipping info
        dispatch(saveShippingAddress({ fullName, phone, address, district, city }));
        dispatch(savePaymentMethod(selectedPayment));

        // Create order
        const orderData = {
            orderItems: cartItems.map(item => ({
                book: item._id,
                title: item.title,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
            })),
            shippingAddress: { fullName, phone, address, district, city },
            paymentMethod: selectedPayment,
            itemsPrice,
            shippingPrice,
            discountAmount,
            totalPrice,
            couponCode: appliedCoupon?.code || null,
        };

        dispatch(createOrder(orderData))
            .unwrap()
            .then((order) => {
                // Clear cart after successful order
                if (userInfo) {
                    dispatch(clearCartAsync());
                } else {
                    dispatch(clearCart());
                }

                toast.success('Đặt hàng thành công!');

                // If payment method is VNPay or MoMo, redirect to payment
                if (selectedPayment === 'VNPay' || selectedPayment === 'MoMo') {
                    navigate(`/payment/${selectedPayment.toLowerCase()}/${order._id}`);
                } else {
                    navigate(`/orders/${order._id}`);
                }
            })
            .catch((error) => {
                toast.error(error || 'Đặt hàng thất bại');
            });
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Hoàn Tất Đơn Hàng</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Left Column - Shipping & Payment */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Shipping Address */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm">1</div>
                                Thông tin giao hàng
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                                    <Input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                    <Input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0123456789"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
                                    <Input
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Hà Nội, TP.HCM..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                                    <Input
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        placeholder="Quận 1, Huyện Gia Lâm..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ cụ thể</label>
                                    <Input
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Số nhà, tên đường..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm">2</div>
                                Phương thức thanh toán
                            </h2>
                            <div className="space-y-4">
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPayment === 'COD' ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="COD"
                                        checked={selectedPayment === 'COD'}
                                        onChange={(e) => setSelectedPayment(e.target.value)}
                                        className="mr-4 w-5 h-5 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                                            <FiTruck className="text-gray-400 w-6 h-6" />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Thanh toán bằng tiền mặt khi nhận hàng</p>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPayment === 'VNPay' ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="VNPay"
                                        checked={selectedPayment === 'VNPay'}
                                        onChange={(e) => setSelectedPayment(e.target.value)}
                                        className="mr-4 w-5 h-5 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-gray-900">VNPay</p>
                                            <FiCreditCard className="text-gray-400 w-6 h-6" />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Thanh toán an toàn qua cổng VNPay</p>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPayment === 'MoMo' ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="MoMo"
                                        checked={selectedPayment === 'MoMo'}
                                        onChange={(e) => setSelectedPayment(e.target.value)}
                                        className="mr-4 w-5 h-5 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-gray-900">Ví MoMo</p>
                                            <div className="w-6 h-6 bg-pink-600 rounded flex items-center justify-center text-white text-xs font-bold">M</div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Thanh toán siêu tốc qua ví MoMo</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Đơn hàng của bạn</h2>

                            {/* Cart Items */}
                            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="flex gap-4">
                                        <div className="relative shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-16 h-20 object-cover rounded-lg border border-gray-100"
                                            />
                                            <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 line-clamp-2">{item.title}</p>
                                            <p className="text-sm font-semibold text-primary-600 mt-1">
                                                {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon */}
                            <div className="border-t border-gray-100 pt-6 mb-6">
                                {appliedCoupon ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                <FiTag />
                                            </div>
                                            <div>
                                                <p className="font-bold text-green-800 text-sm">{appliedCoupon.code}</p>
                                                <p className="text-xs text-green-600">
                                                    Giảm {appliedCoupon.discountType === 'percentage'
                                                        ? `${appliedCoupon.discountValue}%`
                                                        : `${appliedCoupon.discountValue.toLocaleString('vi-VN')}đ`}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 transition">
                                            <FiX />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Mã giảm giá"
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="secondary"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading}
                                            className="whitespace-nowrap px-4"
                                        >
                                            {couponLoading ? '...' : 'Áp dụng'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Price Summary */}
                            <div className="space-y-3 border-t border-gray-100 pt-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span className="font-medium text-gray-900">{itemsPrice.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-medium text-gray-900">{shippingPrice === 0 ? 'Miễn phí' : `${shippingPrice.toLocaleString('vi-VN')} đ`}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá</span>
                                        <span className="font-medium">-{discountAmount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-2">
                                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-primary-600">{totalPrice.toLocaleString('vi-VN')} đ</span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <Button
                                onClick={handlePlaceOrder}
                                disabled={orderLoading}
                                className="w-full mt-8 py-4 text-lg shadow-lg shadow-primary-200"
                            >
                                {orderLoading ? 'Đang xử lý...' : 'Đặt Hàng Ngay'}
                            </Button>

                            <p className="text-xs text-center text-gray-500 mt-4">
                                Nhấn "Đặt Hàng Ngay" đồng nghĩa với việc bạn đồng ý tuân theo Điều khoản dịch vụ của chúng tôi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
