const PaymentSuccessPage = () => {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto card">
                <div className="text-green-500 text-6xl mb-4">✓</div>
                <h1 className="text-3xl font-bold mb-4">Thanh toán thành công!</h1>
                <p className="text-gray-600 mb-6">Đơn hàng của bạn đã được xác nhận.</p>
                <a href="/orders" className="btn-primary">
                    Xem đơn hàng
                </a>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
