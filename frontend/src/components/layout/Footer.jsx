import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin, FiYoutube, FiArrowRight } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* About */}
                    <div>
                        <Link to="/" className="text-2xl font-bold text-white mb-6 block">
                            📚 Bookstore
                        </Link>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Nơi hội tụ những cuốn sách hay nhất, giúp bạn mở rộng tri thức và khám phá thế giới. Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition">
                                <FiFacebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition">
                                <FiInstagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-400 hover:text-white transition">
                                <FiTwitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition">
                                <FiYoutube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white">Khám Phá</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/blog" className="text-gray-400 hover:text-primary-500 transition flex items-center gap-2">
                                    <FiArrowRight className="w-4 h-4" /> Tin Tức
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white">Hỗ Trợ</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/help" className="text-gray-400 hover:text-primary-500 transition">
                                    Trung tâm trợ giúp
                                </Link>
                            </li>
                            <li>
                                <Link to="/shipping" className="text-gray-400 hover:text-primary-500 transition">
                                    Chính sách vận chuyển
                                </Link>
                            </li>
                            <li>
                                <Link to="/returns" className="text-gray-400 hover:text-primary-500 transition">
                                    Chính sách đổi trả
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-gray-400 hover:text-primary-500 transition">
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-gray-400 hover:text-primary-500 transition">
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Newsletter */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white">Liên Hệ</h4>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3 text-gray-400">
                                <FiMapPin className="w-5 h-5 mt-1 text-primary-500 shrink-0" />
                                <span>123 Đường Sách, Quận 1, TP. Hồ Chí Minh, Việt Nam</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <FiPhone className="w-5 h-5 text-primary-500 shrink-0" />
                                <span>1900 123 456</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <FiMail className="w-5 h-5 text-primary-500 shrink-0" />
                                <span>support@bookstore.vn</span>
                            </li>
                        </ul>

                        <h5 className="font-bold mb-3 text-white">Đăng ký nhận tin</h5>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="bg-gray-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary-500 w-full border border-gray-700"
                            />
                            <button className="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700 transition">
                                <FiArrowRight />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Bookstore. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/2560px-MasterCard_Logo.svg.png" alt="Mastercard" className="h-6 opacity-50 grayscale hover:grayscale-0 transition" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 opacity-50 grayscale hover:grayscale-0 transition" />
                        <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="h-6 opacity-50 grayscale hover:grayscale-0 transition" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
