import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingCart, FiUser, FiLogOut, FiSearch, FiMenu } from 'react-icons/fi';
import { logout } from '../../features/authSlice';
import { fetchCart, clearCartOnLogout } from '../../features/cartSlice';
import { useState, useEffect } from 'react';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    const { cartItems } = useSelector((state) => state.cart);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        if (userInfo && userInfo.role !== 'admin') {
            dispatch(fetchCart());
        }
    }, [dispatch, userInfo]);

    const handleLogout = () => {
        dispatch(clearCartOnLogout()); // Clear cart when logout
        dispatch(logout());
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/books?keyword=${keyword}`);
        }
    };

    const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="bg-white shadow-md z-50">

            {/* --- Top Bar đã được xóa theo yêu cầu --- */}

            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-8">

                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-primary-600 flex-shrink-0">
                        📚 Bookstore
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl hidden md:block">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sách, tác giả..."
                                className="w-full px-4 py-2.5 pl-10 rounded-full border border-gray-300 
                                focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary-600 text-white px-4 rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
                            >
                                Tìm kiếm
                            </button>
                        </form>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-6 flex-shrink-0">
                        {/* Mobile Search Icon */}
                        <button className="md:hidden text-gray-700 hover:text-primary-600">
                            <FiSearch className="w-6 h-6" />
                        </button>

                        {/* Cart */}
                        {(!userInfo || userInfo.role !== 'admin') && (
                            <Link to="/cart" className="relative group">
                                <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <FiShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-primary-600 transition-colors" />
                                    {cartItemsCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                            {cartItemsCount}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        )}

                        {/* User Menu */}
                        {userInfo ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 hover:bg-gray-50 rounded-full p-1 pr-3 transition-colors border border-transparent hover:border-gray-200"
                                >
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                        {userInfo.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden md:block font-medium text-gray-700">{userInfo.name}</span>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100 animate-fade-in">
                                        <div className="px-4 py-2 border-b border-gray-100 mb-2">
                                            <p className="text-sm text-gray-500">Xin chào,</p>
                                            <p className="font-bold text-gray-900">{userInfo.name}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <FiUser className="w-4 h-4" />
                                            Tài khoản
                                        </Link>

                                        {userInfo.role !== 'admin' && (
                                            <Link
                                                to="/orders"
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <FiShoppingCart className="w-4 h-4" />
                                                Đơn hàng
                                            </Link>
                                        )}

                                        {userInfo.role === 'admin' && (
                                            <Link
                                                to="/admin/dashboard"
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <FiMenu className="w-4 h-4" />
                                                Quản trị
                                            </Link>
                                        )}

                                        <div className="border-t border-gray-100 my-2"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <FiLogOut className="w-4 h-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="bg-primary-600 text-white px-5 py-2 rounded-full hover:bg-primary-700 transition-all shadow-md hover:shadow-lg font-medium">
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Secondary Navigation */}
                <nav className="hidden md:flex items-center justify-center space-x-8 mt-4 border-t border-gray-100 pt-4">
                    <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors uppercase text-sm tracking-wide">
                        Trang chủ
                    </Link>
                    <Link to="/books" className="text-gray-600 hover:text-primary-600 font-medium transition-colors uppercase text-sm tracking-wide">
                        Tất cả sách
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
