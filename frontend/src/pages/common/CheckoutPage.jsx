import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiTruck, FiCreditCard, FiTag, FiX } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { createOrder } from '../../features/orderSlice';
import {
    clearCart,
    clearCartAsync,
    applyCoupon,
    removeCoupon,
    saveShippingAddress,
    removeItemsFromCart,
    removeMultipleFromCartAsync
} from '../../features/cartSlice';
import { couponsAPI } from '../../services/api';
import axios from 'axios';
import Combobox from '../../components/common/Combobox';

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const {
        cartItems,
        shippingAddress: savedAddress,
        appliedCoupon,
    } = useSelector((state) => state.cart);

    const { userInfo } = useSelector((state) => state.auth);
    const { loading: orderLoading } = useSelector((state) => state.orders);

    // Get selected items passed from navigation
    const selectedItemIds = location.state?.selectedItems || [];

    // Filter cart items to get only selected ones
    const checkoutItems = useMemo(() => {
        return cartItems.filter(item => {
            // Handle both Cart Item ID (from CartPage) and Book ID (from Buy Now)
            const itemId = item._id;
            const bookId = item.book?._id || item._id;
            return selectedItemIds.includes(itemId) || selectedItemIds.includes(bookId);
        });
    }, [cartItems, selectedItemIds]);

    // Form state
    const [fullName, setFullName] = useState(savedAddress?.fullName || userInfo?.name || '');
    const [phone, setPhone] = useState(savedAddress?.phone || userInfo?.phone || '');
    const [city, setCity] = useState(savedAddress?.city || '');
    const [district, setDistrict] = useState(savedAddress?.district || '');
    const [ward, setWard] = useState(savedAddress?.ward || '');
    const [address, setAddress] = useState(savedAddress?.address || '');
    const [selectedPayment, setSelectedPayment] = useState('COD');
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    // Location state
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    // Fetch provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get('https://provinces.open-api.vn/api/p/');
                setProvinces(response.data);

                // Try to match existing city
                if (city) {
                    const found = response.data.find(p => p.name === city || city.includes(p.name) || p.name.includes(city));
                    if (found) setSelectedProvince(found);
                }
            } catch (error) {
                console.error('Failed to fetch provinces', error);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch districts when province changes
    useEffect(() => {
        if (selectedProvince) {
            const fetchDistricts = async () => {
                try {
                    const response = await axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`);
                    setDistricts(response.data.districts);

                    // Try to match existing district if we just loaded districts and haven't selected one manually yet
                    if (district && !selectedDistrict) {
                        const found = response.data.districts.find(d => d.name === district || district.includes(d.name) || d.name.includes(district));
                        if (found) setSelectedDistrict(found);
                    }
                } catch (error) {
                    console.error('Failed to fetch districts', error);
                    setDistricts([]);
                }
            };
            fetchDistricts();
        } else {
            setDistricts([]);
            setSelectedDistrict(null);
        }
    }, [selectedProvince]);

    // Fetch wards when district changes
    useEffect(() => {
        if (selectedDistrict) {
            const fetchWards = async () => {
                try {
                    const response = await axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`);
                    setWards(response.data.wards);

                    // Try to match existing ward
                    if (ward && !selectedWard) {
                        const found = response.data.wards.find(w => w.name === ward || ward.includes(w.name) || w.name.includes(ward));
                        if (found) setSelectedWard(found);
                    }
                } catch (error) {
                    console.error('Failed to fetch wards', error);
                    setWards([]);
                }
            };
            fetchWards();
        } else {
            setWards([]);
            setSelectedWard(null);
        }
    }, [selectedDistrict]);

    const handleProvinceChange = (province) => {
        setSelectedProvince(province);
        setCity(province?.name || '');
        // Reset district and ward when province changes
        setSelectedDistrict(null);
        setDistrict('');
        setSelectedWard(null);
        setWard('');
    };

    const handleDistrictChange = (district) => {
        setSelectedDistrict(district);
        setDistrict(district?.name || '');
        // Reset ward when district changes
        setSelectedWard(null);
        setWard('');
    };

    const handleWardChange = (ward) => {
        setSelectedWard(ward);
        setWard(ward?.name || '');
    };

    // Redirect if no items selected
    useEffect(() => {
        if (selectedItemIds.length === 0 || checkoutItems.length === 0) {
            // Only redirect if we have cart items but none matched (invalid selection)
            // or if we have no cart items at all
            if (cartItems.length > 0 && checkoutItems.length === 0) {
                toast.error('Vui lòng chọn sản phẩm để thanh toán');
                navigate('/cart');
            } else if (cartItems.length === 0) {
                // Allow empty cart to load briefly or handle gracefully, but usually redirect
                // navigate('/cart'); 
            }
        }
    }, [selectedItemIds, checkoutItems, cartItems, navigate]);

    // Calculate prices
    const itemsPrice = checkoutItems.reduce((acc, item) => acc + ((item.discountPrice || item.price) * item.quantity), 0);
    const shippingPrice = itemsPrice > 200000 ? 0 : 30000;

    const discountAmount = useMemo(() => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.discountType === 'percentage') {
            return Math.round((itemsPrice * appliedCoupon.discountValue) / 100);
        }
        return appliedCoupon.discountValue;
    }, [appliedCoupon, itemsPrice]);

    const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountAmount);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setCouponLoading(true);
        try {
            const { data } = await couponsAPI.validateCoupon(couponCode, itemsPrice);
            dispatch(applyCoupon(data.data));
            toast.success('Áp dụng mã giảm giá thành công!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
            dispatch(removeCoupon());
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        dispatch(removeCoupon());
        setCouponCode('');
    };

    const handlePlaceOrder = async () => {
        try {
            // Validate form
            if (!fullName || !phone || !city || !district || !ward || !address) {
                toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
                return;
            }

            const shippingAddress = { fullName, phone, city, district, ward, address };
            dispatch(saveShippingAddress(shippingAddress));

            const orderData = {
                orderItems: checkoutItems.map(item => ({
                    book: userInfo ? item.book._id : item._id, // Handle different structure for guest/user
                    quantity: item.quantity,
                    price: item.discountPrice || item.price,
                    image: item.image,
                    title: item.title
                })),
                shippingAddress,
                paymentMethod: selectedPayment,
                itemsPrice,
                shippingPrice,
                totalPrice,
                couponCode: appliedCoupon?.code
            };

            const resultAction = await dispatch(createOrder(orderData));

            if (createOrder.fulfilled.match(resultAction)) {
                const order = resultAction.payload;

                // Remove bought items from cart
                // Extract Book IDs for removal (Backend expects Book IDs, Guest Local expects Book IDs)
                const bookIdsToRemove = checkoutItems.map(item =>
                    userInfo ? item.book._id : item._id
                );

                if (userInfo) {
                    dispatch(removeMultipleFromCartAsync(bookIdsToRemove));
                } else {
                    dispatch(removeItemsFromCart(bookIdsToRemove));
                }

                // Clear coupon
                dispatch(removeCoupon());

                toast.success('Đặt hàng thành công!');

                // Navigate based on payment method
                if (selectedPayment === 'VNPay') {
                    navigate(`/payment/vnpay/${order._id}`);
                } else if (selectedPayment === 'MoMo') {
                    navigate(`/payment/momo/${order._id}`);
                } else {
                    navigate(`/orders/${order._id}`);
                }
            } else {
                throw new Error(resultAction.payload || 'Đặt hàng thất bại');
            }
        } catch (error) {
            console.error('Order error:', error);
            toast.error(error.message || 'Đặt hàng thất bại. Vui lòng thử lại');
        }
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                                    <Input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                                    <Input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0123456789"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố *</label>
                                    <Combobox
                                        options={provinces}
                                        value={selectedProvince}
                                        onChange={handleProvinceChange}
                                        placeholder="Chọn Tỉnh/Thành phố"
                                        displayValue={(item) => item?.name || ''}
                                        className="mb-4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện *</label>
                                    <Combobox
                                        options={districts}
                                        value={selectedDistrict}
                                        onChange={handleDistrictChange}
                                        placeholder="Chọn Quận/Huyện"
                                        displayValue={(item) => item?.name || ''}
                                        disabled={!selectedProvince}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phường/Xã *</label>
                                    <Combobox
                                        options={wards}
                                        value={selectedWard}
                                        onChange={handleWardChange}
                                        placeholder="Chọn Phường/Xã"
                                        displayValue={(item) => item?.name || ''}
                                        disabled={!selectedDistrict}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ giao hàng *</label>
                                    <Input
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Số nhà, tên đường..."
                                        required
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
                                {checkoutItems.map((item) => (
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
                                                {((item.discountPrice || item.price) * item.quantity).toLocaleString('vi-VN')} đ
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
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="text-gray-400 hover:text-red-500 transition"
                                            type="button"
                                        >
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
                                            type="button"
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
                                    <span className="font-medium text-gray-900">
                                        {shippingPrice === 0 ? 'Miễn phí' : `${shippingPrice.toLocaleString('vi-VN')} đ`}
                                    </span>
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
                                disabled={orderLoading || checkoutItems.length === 0}
                                className="w-full mt-8 py-4 text-lg shadow-lg shadow-primary-200"
                                type="button"
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