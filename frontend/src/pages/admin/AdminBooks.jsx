import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBooks, deleteBook, createBook, updateBook } from '../../features/bookSlice';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import AdminBookForm from '../../components/admin/AdminBookForm';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ActionButtons from '../../components/common/ActionButtons';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

const AdminBooks = () => {
    const dispatch = useDispatch();
    const { books, loading, error, pages } = useSelector((state) => state.books);
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(getBooks({ page: currentPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dispatch, currentPage]);

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
            dispatch(deleteBook(id))
                .unwrap()
                .then(() => toast.success('Đã xóa sách thành công'))
                .catch((err) => toast.error(err));
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingBook(null);
        setShowModal(true);
    };

    const handleSubmit = async (bookData) => {
        try {
            if (editingBook) {
                await dispatch(updateBook({ id: editingBook._id, bookData })).unwrap();
                toast.success('Cập nhật sách thành công');
            } else {
                await dispatch(createBook(bookData)).unwrap();
                toast.success('Thêm sách mới thành công');
            }
            setShowModal(false);
            dispatch(getBooks({ page: currentPage })); // Refresh list on current page
        } catch (err) {
            toast.error(err || 'Có lỗi xảy ra');
        }
    };

    if (error && !showModal) return <ErrorState message={error} onRetry={() => dispatch(getBooks({ page: currentPage }))} />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý sách</h1>
                <button
                    onClick={handleCreate}
                    className="btn-primary flex items-center gap-2"
                >
                    <FiPlus /> Thêm sách mới
                </button>
            </div>

            <div className="relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-start justify-center pt-20 pointer-events-none">
                        <div className="bg-white/90 p-3 rounded-full shadow-lg backdrop-blur-sm">
                            <LoadingState />
                        </div>
                    </div>
                )}

                <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="card overflow-x-auto mb-6">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b bg-gray-50">
                                    <th className="p-4">Hình ảnh</th>
                                    <th className="p-4">Tên sách</th>
                                    <th className="p-4">Tác giả</th>
                                    <th className="p-4">Giá</th>
                                    <th className="p-4">Kho</th>
                                    <th className="p-4">Danh mục</th>
                                    <th className="p-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map((book) => (
                                    <tr key={book._id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <img
                                                src={book.images[0] || 'https://via.placeholder.com/50'}
                                                alt={book.title}
                                                className="w-12 h-16 object-cover rounded"
                                            />
                                        </td>
                                        <td className="p-4 font-medium max-w-xs truncate" title={book.title}>
                                            {book.title}
                                        </td>
                                        <td className="p-4">{book.author}</td>
                                        <td className="p-4 text-primary-600 font-semibold">
                                            {book.price.toLocaleString('vi-VN')} đ
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={book.stock > 0 ? 'success' : 'error'}>
                                                {book.stock}
                                            </Badge>
                                        </td>
                                        <td className="p-4">{book.category?.name || 'N/A'}</td>
                                        <td className="p-4">
                                            <ActionButtons
                                                onEdit={() => handleEdit(book)}
                                                onDelete={() => handleDelete(book._id)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={pages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <AdminBookForm
                    initialData={editingBook}
                    onSubmit={handleSubmit}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default AdminBooks;
