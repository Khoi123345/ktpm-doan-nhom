import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchOverviewStats,
    fetchRevenueStats,
    fetchOrderStats,
    fetchTopProducts,
    fetchCategoryStats
} from '../../features/statsSlice';
import { FiUsers, FiBook, FiShoppingBag, FiDollarSign, FiArrowUp, FiArrowDown, FiTrendingUp } from 'react-icons/fi';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import LoadingState from '../../components/common/LoadingState';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { overview, revenue, orders, topProducts, categories, loading } = useSelector((state) => state.stats);
    const [revenuePeriod, setRevenuePeriod] = useState('7days');

    useEffect(() => {
        dispatch(fetchOverviewStats());
        dispatch(fetchRevenueStats('7days'));
        dispatch(fetchOrderStats());
        dispatch(fetchTopProducts(5));
        dispatch(fetchCategoryStats());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchRevenueStats(revenuePeriod));
    }, [dispatch, revenuePeriod]);

    if (loading && !overview) return <LoadingState />;

    // Stats cards configuration
    const stats = [
        {
            title: 'Tổng doanh thu',
            value: `${(overview?.totalRevenue || 0).toLocaleString('vi-VN')} đ`,
            icon: <FiDollarSign className="w-6 h-6 text-white" />,
            bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
            link: '/admin/orders',
            trend: overview?.trends?.revenue || 0
        },
        {
            title: 'Đơn hàng',
            value: overview?.totalOrders || 0,
            icon: <FiShoppingBag className="w-6 h-6 text-white" />,
            bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
            link: '/admin/orders',
            trend: overview?.trends?.orders || 0
        },
        {
            title: 'Sản phẩm',
            value: overview?.totalBooks || 0,
            icon: <FiBook className="w-6 h-6 text-white" />,
            bg: 'bg-gradient-to-r from-purple-500 to-pink-600',
            link: '/admin/books',
            trend: 0
        },
        {
            title: 'Khách hàng',
            value: overview?.totalUsers || 0,
            icon: <FiUsers className="w-6 h-6 text-white" />,
            bg: 'bg-gradient-to-r from-orange-500 to-red-600',
            link: '/admin/users',
            trend: overview?.trends?.users || 0
        },
    ];

    // Prepare revenue chart data
    const revenueChartData = revenue?.stats?.map(item => ({
        date: revenuePeriod === '12months'
            ? new Date(item.date + '-01').toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })
            : new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: item.revenue,
        orders: item.orders
    })) || [];

    // Prepare order status chart data
    const statusLabels = {
        pending: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        processing: 'Đang xử lý',
        shipping: 'Đang giao',
        shipped: 'Đang giao',
        delivered: 'Đã giao',
        cancelled: 'Đã hủy',
        returned: 'Đã hoàn'
    };

    const orderStatusData = orders?.byStatus?.map(item => ({
        name: statusLabels[item.status] || item.status,
        value: item.count
    })) || [];

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

    // Prepare category chart data
    const categoryChartData = categories?.slice(0, 5).map(item => ({
        name: item.category.name,
        revenue: item.revenue,
        items: item.itemsSold
    })) || [];

    // Custom label for pie chart - positioned outside
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 30;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#374151"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-xs font-medium"
            >
                {`${name}: ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
                <p className="text-gray-500">Chào mừng trở lại, đây là tình hình kinh doanh của bạn.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Link
                        to={stat.link}
                        key={index}
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg shadow-lg ${stat.bg}`}>
                                {stat.icon}
                            </div>
                            {stat.trend !== 0 && (
                                <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${stat.trend > 0
                                        ? 'text-green-600 bg-green-50'
                                        : 'text-red-600 bg-red-50'
                                    }`}>
                                    {stat.trend > 0 ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
                                    {Math.abs(stat.trend)}%
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Charts Row 1 - Revenue and Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FiTrendingUp className="text-green-500" />
                                Biểu đồ doanh thu
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Theo dõi xu hướng doanh thu</p>
                        </div>
                        <select
                            value={revenuePeriod}
                            onChange={(e) => setRevenuePeriod(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="7days">7 ngày qua</option>
                            <option value="30days">30 ngày qua</option>
                            <option value="12months">12 tháng qua</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                stroke="#9CA3AF"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                stroke="#9CA3AF"
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                formatter={(value, name) => [
                                    name === 'revenue'
                                        ? `${value.toLocaleString('vi-VN')} đ`
                                        : value,
                                    name === 'revenue' ? 'Doanh thu' : 'Đơn hàng'
                                ]}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            />
                            <Legend
                                formatter={(value) => value === 'revenue' ? 'Doanh thu' : 'Đơn hàng'}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ fill: '#10B981', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Order Status Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Phân bố đơn hàng</h2>
                    <p className="text-sm text-gray-500 mb-6">Theo trạng thái</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={orderStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={{
                                    stroke: '#9CA3AF',
                                    strokeWidth: 1
                                }}
                                label={renderCustomLabel}
                                outerRadius={65}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {orderStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 - Categories and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Doanh thu theo danh mục</h2>
                    <p className="text-sm text-gray-500 mb-6">Top 5 danh mục</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12 }}
                                stroke="#9CA3AF"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                stroke="#9CA3AF"
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                formatter={(value, name) => [
                                    name === 'revenue'
                                        ? `${value.toLocaleString('vi-VN')} đ`
                                        : `${value} sản phẩm`,
                                    name === 'revenue' ? 'Doanh thu' : 'Đã bán'
                                ]}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            />
                            <Legend
                                formatter={(value) => value === 'revenue' ? 'Doanh thu' : 'Đã bán'}
                            />
                            <Bar dataKey="revenue" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Sản phẩm bán chạy</h2>
                    <p className="text-sm text-gray-500 mb-6">Top 5 sản phẩm</p>
                    {topProducts && topProducts.length > 0 ? (
                        <div className="space-y-3">
                            {topProducts.map((item, index) => (
                                <div key={item.book._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                                        #{index + 1}
                                    </div>
                                    {item.book.image ? (
                                        <img
                                            src={item.book.image}
                                            alt={item.book.title}
                                            className="w-10 h-14 object-cover rounded border border-gray-200 flex-shrink-0"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const fallback = e.target.nextElementSibling;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="w-10 h-14 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0"
                                        style={{ display: item.book.image ? 'none' : 'flex' }}
                                    >
                                        <FiBook className="text-gray-400 text-sm" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate text-sm">{item.book.title}</p>
                                        <p className="text-xs text-gray-500 truncate">{item.book.author}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800 text-sm">{item.totalSold}</p>
                                        <p className="text-xs text-gray-500">đã bán</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;