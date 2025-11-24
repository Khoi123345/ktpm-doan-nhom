import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders } from '../../features/orderSlice';
import { getUsers } from '../../features/userSlice';
import { getBooks } from '../../features/bookSlice';
import { FiUsers, FiBook, FiShoppingBag, FiTag } from 'react-icons/fi';

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
            icon: <FiTag className="text-green-600 text-3xl" />,
            color: 'bg-green-100',
            link: '/admin/orders'
        },
        {
            title: 'Đơn hàng',
            value: orders?.length || 0,
            icon: <FiShoppingBag className="text-blue-600 text-3xl" />,
            color: 'bg-blue-100',
            link: '/admin/orders'
        },
        {
            title: 'Sản phẩm',
            value: totalBooks || 0,
            icon: <FiBook className="text-purple-600 text-3xl" />,
            color: 'bg-purple-100',
            link: '/admin/books'
        },
        {
            title: 'Người dùng',
            value: users?.length || 0,
            icon: <FiUsers className="text-orange-600 text-3xl" />,
            color: 'bg-orange-100',
            link: '/admin/users'
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <Link to={stat.link} key={index} className="card hover:shadow-lg transition flex items-center p-6">
                        <div className={`p-4 rounded-full ${stat.color} mr-4`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">{stat.title}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Đơn hàng mới nhất</h2>
                        <Link to="/admin/orders" className="text-primary-600 hover:underline text-sm">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="pb-3">ID</th>
                                    <th className="pb-3">Khách hàng</th>
                                    <th className="pb-3">Tổng tiền</th>
                                    <th className="pb-3">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders?.slice(0, 5).map((order) => (
                                    <tr key={order._id} className="border-b last:border-0">
                                        <td className="py-3 text-sm font-mono">{order._id.slice(-6).toUpperCase()}</td>
                                        <td className="py-3">{order.user?.name || 'N/A'}</td>
                                        <td className="py-3">{order.totalPrice.toLocaleString('vi-VN')} đ</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Thao tác nhanh</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/admin/books" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                            <FiBook className="mx-auto text-2xl mb-2 text-primary-600" />
                            <span className="font-medium">Quản lý sách</span>
                        </Link>
                        <Link to="/admin/orders" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                            <FiShoppingBag className="mx-auto text-2xl mb-2 text-primary-600" />
                            <span className="font-medium">Quản lý đơn hàng</span>
                        </Link>
                        <Link to="/admin/users" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                            <FiUsers className="mx-auto text-2xl mb-2 text-primary-600" />
                            <span className="font-medium">Quản lý người dùng</span>
                        </Link>
                        <Link to="/admin/categories" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                            <FiTag className="mx-auto text-2xl mb-2 text-primary-600" />
                            <span className="font-medium">Quản lý danh mục</span>
                        </Link>
                        <Link to="/admin/coupons" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                            <FiTag className="mx-auto text-2xl mb-2 text-primary-600" />
                            <span className="font-medium">Mã giảm giá</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
