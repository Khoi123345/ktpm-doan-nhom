import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../features/categorySlice';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ActionButtons from '../../components/common/ActionButtons';

const AdminCategories = () => {
    const dispatch = useDispatch();
    const { categories, loading, error } = useSelector((state) => state.categories);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [name, setName] = useState('');

    useEffect(() => {
        dispatch(getCategories());
    }, [dispatch]);

    const handleEdit = (category) => {
        setEditingCategory(category);
        setName(category.name);
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setName('');
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            dispatch(deleteCategory(id))
                .unwrap()
                .then(() => toast.success('Đã xóa danh mục thành công'))
                .catch((err) => toast.error(err));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            dispatch(updateCategory({ id: editingCategory._id, categoryData: { name } }))
                .unwrap()
                .then(() => {
                    toast.success('Cập nhật danh mục thành công');
                    setShowModal(false);
                })
                .catch((err) => toast.error(err));
        } else {
            dispatch(createCategory({ name }))
                .unwrap()
                .then(() => {
                    toast.success('Tạo danh mục thành công');
                    setShowModal(false);
                })
                .catch((err) => toast.error(err));
        }
    };

    if (loading && !showModal) return <LoadingState />;
    if (error && !showModal) return <ErrorState message={error} onRetry={() => dispatch(getCategories())} />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
                <button
                    onClick={handleCreate}
                    className="btn-primary flex items-center gap-2"
                >
                    <FiPlus /> Thêm danh mục
                </button>
            </div>

            <div className="card max-w-2xl mx-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b bg-gray-50">
                            <th className="p-4">Tên danh mục</th>
                            <th className="p-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category._id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{category.name}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end">
                                        <ActionButtons
                                            onEdit={() => handleEdit(category)}
                                            onDelete={() => handleDelete(category._id)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan="2" className="p-4 text-center text-gray-500">
                                    Chưa có danh mục nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                            required
                            placeholder="Ví dụ: Tiểu thuyết, Kinh tế..."
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full mt-4">
                        {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default AdminCategories;
