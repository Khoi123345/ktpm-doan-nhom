import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, deleteUser, toggleUserLock } from '../../features/userSlice';
import { FiUser, FiShield, FiLock, FiUnlock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ActionButtons from '../../components/common/ActionButtons';

const AdminUsers = () => {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.users);

    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

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
    if (error) return <ErrorState message={error} onRetry={() => dispatch(getUsers())} />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>

            <div className="card overflow-x-auto">
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
                        {users.filter(user => user.role !== 'admin').map((user) => (
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
        </div>
    );
};

export default AdminUsers;
