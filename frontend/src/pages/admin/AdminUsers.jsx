import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, deleteUser, toggleUserLock } from '../../features/userSlice';
import { FiUser, FiShield, FiLock, FiUnlock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ActionButtons from '../../components/common/ActionButtons';
import Pagination from '../../components/common/Pagination';

const AdminUsers = () => {
    const dispatch = useDispatch();
    const { users, loading, error, page, pages, total } = useSelector((state) => state.users);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            dispatch(getUsers({ page: currentPage, limit: 10, keyword: searchTerm, role: 'user' }));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [dispatch, currentPage, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) {
            dispatch(deleteUser(id))
                .unwrap()
                .then(() => toast.success('Đã xóa người dùng thành công'))
                .catch((err) => toast.error(err));
        }
    };

    const handleToggleLock = (id, isLocked) => {
        const action = isLocked ? 'mở khóa' : 'khóa';
        if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
            dispatch(toggleUserLock(id))
                .unwrap()
                .then(() => toast.success(`Đã ${action} tài khoản thành công`))
                .catch((err) => toast.error(err));
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={() => dispatch(getUsers({ page: currentPage, limit: 10, keyword: searchTerm, role: 'user' }))} />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý khách hàng</h1>
                <div className="text-sm text-gray-500">
                    Trang: {page} | Tổng trang: {pages} | Tổng: {total}
                </div>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email..."
                    className="input-field w-full md:w-1/3"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            <div className="card overflow-x-auto mb-6">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b bg-gray-50">
                            <th className="p-4">ID</th>
                            <th className="p-4">Họ tên</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Vai trò</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4">Ngày tham gia</th>
                            <th className="p-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-mono text-sm">{user._id.slice(-6).toUpperCase()}</td>
                                <td className="p-4 font-medium">{user.name}</td>
                                <td className="p-4 text-gray-600">{user.email}</td>
                                <td className="p-4">
                                    {user.role === 'admin' ? (
                                        <span className="flex items-center gap-1 text-purple-600 font-semibold">
                                            <FiShield /> Admin
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-600">
                                            <FiUser /> User
                                        </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {user.isLocked ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <FiLock className="mr-1" /> Đã khóa
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <FiUnlock className="mr-1" /> Hoạt động
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-sm">
                                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-4">
                                    {user.role !== 'admin' && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleLock(user._id, user.isLocked)}
                                                className={`p-2 rounded hover:bg-gray-100 ${user.isLocked ? 'text-green-600' : 'text-orange-600'
                                                    }`}
                                                title={user.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                                            >
                                                {user.isLocked ? <FiUnlock /> : <FiLock />}
                                            </button>
                                            <ActionButtons
                                                onDelete={() => handleDelete(user._id)}
                                                deleteTitle="Xóa người dùng"
                                            />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pages > 1 && (
                <div className="flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
