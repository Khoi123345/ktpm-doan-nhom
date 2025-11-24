import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getBooks } from '../../features/bookSlice';
import { getCategories } from '../../features/categorySlice';
import { addToCart, addToCartAsync } from '../../features/cartSlice';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiTag } from 'react-icons/fi';
import { toast } from 'react-toastify';

const HomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { categories } = useSelector((state) => state.categories);
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getBooks({ page: 1, limit: 12 }));
        dispatch(getCategories());
    }, [dispatch]);

    const handleAddToCart = (book) => {
        if (userInfo) {
            dispatch(addToCartAsync({ bookId: book._id, quantity: 1 }));
        } else {
            dispatch(addToCart({ ...book, quantity: 1 }));
        }
        toast.success('Đã thêm vào giỏ hàng!');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-primary-900 text-white overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1507842217121-9e962835d751?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        alt="Library Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800/80 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
                    <div className="max-w-2xl">
                        <span className="inline-block bg-yellow-400 text-primary-900 font-bold px-4 py-2 rounded-full mb-6 animate-fade-in-up">
                            #1 Nhà Sách Trực Tuyến
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up delay-100">
                            Khám Phá Tri Thức <br />
                            <span className="text-yellow-400">Mở Rộng Tương Lai</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in-up delay-200">
                            Hàng ngàn đầu sách chất lượng đang chờ đón bạn. Giao hàng nhanh chóng, thanh toán tiện lợi.
                        </p>

                        <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
                            <Link
                                to="/books"
                                className="bg-white text-primary-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-xl flex items-center gap-2"
                            >
                                Mua Ngay
                                <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-white shadow-sm -mt-8 relative z-20 container mx-auto px-4 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                            <FiTruck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Giao Hàng Nhanh</h3>
                            <p className="text-sm text-gray-500">Miễn phí đơn từ 500k</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <FiShield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Bảo Mật 100%</h3>
                            <p className="text-sm text-gray-500">Thanh toán an toàn</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                            <FiRefreshCw className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Đổi Trả Dễ Dàng</h3>
                            <p className="text-sm text-gray-500">Trong vòng 30 ngày</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <FiHeadphones className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Hỗ Trợ 24/7</h3>
                            <p className="text-sm text-gray-500">Hotline: 1900 xxxx</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">Danh Mục Phổ Biến</h2>
                    <div className="w-20 h-1 bg-primary-600 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.slice(0, 6).map((category) => (
                        <Link
                            key={category._id}
                            to={`/books?category=${category._id}`}
                            className="group bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-primary-200"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 rounded-full flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-300">
                                <FiTag className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
                                {category.name}
                            </h3>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="bg-gray-100 py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">Đăng Ký Nhận Tin</h2>
                        <p className="text-gray-600 mb-8">
                            Nhận thông tin về sách mới, sự kiện tác giả và ưu đãi độc quyền trực tiếp vào hộp thư của bạn.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="flex-1 px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                            />
                            <button className="bg-primary-600 text-white px-8 py-4 rounded-full font-bold hover:bg-primary-700 transition shadow-lg">
                                Đăng Ký
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
