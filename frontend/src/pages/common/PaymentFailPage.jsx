const PaymentFailPage = () => {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto card">
                <div className="text-red-500 text-6xl mb-4">✗</div>
                <h1 className="text-3xl font-bold mb-4">Thanh toán thất bại</h1>
                <p className="text-gray-600 mb-6">Đã có lỗi xảy ra trong quá trình thanh toán.</p>
                <a href="/cart" className="btn-primary">
                    Quay lại giỏ hàng
                </a>
            </div>
        </div>
    );
};

export default PaymentFailPage;
