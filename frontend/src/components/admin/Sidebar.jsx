import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBook, FiTag, FiShoppingBag, FiUsers, FiGift, FiStar, FiSettings, FiBarChart2 } from 'react-icons/fi';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/admin/dashboard', icon: FiHome, label: 'Tổng quan' },
        { path: '/admin/orders', icon: FiShoppingBag, label: 'Đơn hàng' },
        { path: '/admin/books', icon: FiBook, label: 'Sách' },
        { path: '/admin/categories', icon: FiTag, label: 'Danh mục' },
        { path: '/admin/users', icon: FiUsers, label: 'Khách hàng' },
        { path: '/admin/coupons', icon: FiGift, label: 'Mã giảm giá' },
        { path: '/admin/reviews', icon: FiStar, label: 'Đánh giá' },
        { path: '/admin/analytics', icon: FiBarChart2, label: 'Xếp hạng' },
    ];

    return (
        <aside className="w-64 bg-[#1F1F1F] border-r border-gray-800 min-h-screen fixed left-0 top-0 z-30 hidden lg:block">
            <div className="h-16 flex items-center justify-center border-b border-gray-800">
                <Link to="/admin/dashboard" className="text-xl font-bold text-primary-400 flex items-center gap-2">
                    <span className="text-2xl">📚</span> Admin
                </Link>
            </div>

            <div className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 pl-2">
                    Menu
                </p>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                            ${isActive
                                        ? 'bg-primary-600/20 text-primary-400 font-medium'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }
                        `}
                            >
                                <Icon
                                    className={`w-5 h-5 ${isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-white'
                                        }`}
                                />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                {/* Optional footer */}
            </div>
        </aside>
    );
};

export default Sidebar;