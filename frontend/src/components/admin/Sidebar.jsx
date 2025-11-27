import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBook, FiTag, FiShoppingBag, FiUsers, FiGift, FiStar, FiSettings } from 'react-icons/fi';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/admin/orders', icon: FiShoppingBag, label: 'Đơn hàng' },
        { path: '/admin/books', icon: FiBook, label: 'Sách' },
        { path: '/admin/categories', icon: FiTag, label: 'Danh mục' },
        { path: '/admin/users', icon: FiUsers, label: 'Khách hàng' },
        { path: '/admin/coupons', icon: FiGift, label: 'Mã giảm giá' },
        { path: '/admin/reviews', icon: FiStar, label: 'Đánh giá' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-30 hidden lg:block">
            <div className="h-16 flex items-center justify-center border-b border-gray-200">
                <Link to="/admin/dashboard" className="text-xl font-bold text-primary-600 flex items-center gap-2">
                    <span className="text-2xl">📚</span> Admin
                </Link>
            </div>

            <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-2">Menu</p>
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-primary-50 text-primary-600 font-medium shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 cursor-pointer rounded-lg hover:bg-gray-50 transition">
                    <FiSettings className="w-5 h-5 text-gray-400" />
                    <span>Cài đặt</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;