import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders } from '../../features/orderSlice';
import { getUsers } from '../../features/userSlice';
import { getBooks } from '../../features/bookSlice';
import { FiUsers, FiBook, FiShoppingBag, FiDollarSign, FiArrowUp, FiArrowRight } from 'react-icons/fi';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { orders } = useSelector((state) => state.orders);
    const { users } = useSelector((state) => state.users);
    const { total: totalBooks } = useSelector((state) => state.books);

    useEffect(() => {
        dispatch(getOrders());
        dispatch(getUsers());
        dispatch(getBooks({}));
    }, [dispatch]);

    const totalRevenue = orders?.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0) || 0;

    const stats = [
        {
            title: 'Tổng doanh thu',
            value: `${totalRevenue.toLocaleString('vi-VN')} đ`,
            icon: <FiDollarSign className="w-6 h-6 text-white" />,
            bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
            link: '/admin/orders',
            trend: '+12.5%'
        },
        {
            title: 'Đơn hàng',
            value: orders?.length || 0,
            icon: <FiShoppingBag className="w-6 h-6 text-white" />,
            bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
            link: '/admin/orders',
            trend: '+5.2%'
        },
        {
            title: 'Sản phẩm',
            value: totalBooks || 0,
            icon: <FiBook className="w-6 h-6 text-white" />,
            bg: 'bg-gradient-to-r from-purple-500 to-pink-600',
            link: '/admin/books',
            trend: '+2.4%'
        },
        {
            title: 'Khách hàng',
            value: users?.length || 0,
            icon: <FiUsers className="w-6 h-6 text-white" />,
            bg: 'bg-gradient-to-r from-orange-500 to-red-600',
            link: '/admin/users',
            trend: '+8.1%'
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
                <p className="text-gray-500">Chào mừng trở lại, đây là tình hình kinh doanh hôm nay.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <Link to={stat.link} key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg shadow-lg ${stat.bg}`}>
                                {stat.icon}
                            </div>
                            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <FiArrowUp className="mr-1" /> {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Recent Orders Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Đơn hàng mới nhất</h2>
                        <Link to="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                            Xem tất cả <FiArrowRight />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái đơn</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders?.slice(0, 5).map((order) => {
                                    const getStatusColor = (status) => {
                                        switch (status) {
                                            case 'pending': return 'bg-yellow-100 text-yellow-800';
                                            case 'confirmed':
                                            case 'processing':
                                            case 'shipping':
                                            case 'shipped': return 'bg-blue-100 text-blue-800';
                                            case 'delivered': return 'bg-green-100 text-green-800';
                                            case 'cancelled': return 'bg-red-100 text-red-800';
                                            default: return 'bg-gray-100 text-gray-800';
                                        }
                                    };

                                    const getStatusText = (status) => {
                                        switch (status) {
                                            case 'pending': return 'Chờ xác nhận';
                                            case 'confirmed': return 'Đã xác nhận';
                                            case 'processing': return 'Đang xử lý';
                                            case 'shipping':
                                            case 'shipped': return 'Đang giao';
                                            case 'delivered': return 'Đã giao';
                                            case 'cancelled': return 'Đã hủy';
                                            default: return status;
                                        }
                                    };

                                    return (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                        {order.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    {order.user?.name || 'Khách vãng lai'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {order.totalPrice.toLocaleString('vi-VN')} đ
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.isPaid
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;