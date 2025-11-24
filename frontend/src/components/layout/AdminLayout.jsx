import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiHome, FiBook, FiTag, FiShoppingBag, FiUsers, FiGift, FiUser, FiLogOut } from 'react-icons/fi';
import { logout } from '../../features/authSlice';
import { useState, useEffect, useRef } from 'react';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    const navItems = [
        { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/admin/books', icon: FiBook, label: 'Sách' },
        { path: '/admin/categories', icon: FiTag, label: 'Danh mục' },
        { path: '/admin/orders', icon: FiShoppingBag, label: 'Đơn hàng' },
        { path: '/admin/users', icon: FiUsers, label: 'Người dùng' },
        { path: '/admin/coupons', icon: FiGift, label: 'Mã giảm giá' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Admin Header */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/admin/dashboard" className="text-2xl font-bold text-primary-600">
                            📚 Bookstore Admin
                        </Link>

                        {/* Admin Navigation */}
                        <nav className="hidden md:flex items-center space-x-6">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center space-x-2 transition ${isActive
                                            ? 'text-primary-600 font-semibold'
                                            : 'text-gray-700 hover:text-primary-600'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                            >
                                <FiUser className="w-6 h-6" />
                                <span className="hidden md:block">{userInfo?.name}</span>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Tài khoản
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                                    >
                                        <FiLogOut />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Admin Footer */}
            <footer className="bg-white border-t mt-auto">
                <div className="container mx-auto px-4 py-6">
                    <div className="text-center text-gray-600 text-sm">
                        <p>© 2024 Bookstore Admin Panel. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AdminLayout;
