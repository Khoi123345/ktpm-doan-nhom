import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, deleteUser } from '../../features/userSlice';
import { FiUser, FiShield } from 'react-icons/fi';
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
                                <td className="p-4 text-sm">
                                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-4">
                                    {user.role !== 'admin' && (
                                        <ActionButtons
                                            onDelete={() => handleDelete(user._id)}
                                            deleteTitle="Xóa người dùng"
                                        />
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
