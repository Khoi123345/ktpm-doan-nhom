import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadBookImages } from '../../features/bookSlice';
import { getCategories } from '../../features/categorySlice';
import { FiX, FiUpload, FiTrash } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminBookForm = ({ initialData, onSubmit, onClose }) => {
    const dispatch = useDispatch();
    const { categories } = useSelector((state) => state.categories);

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        stock: '',
        ISBN: '',
        publisher: '',
        publishedDate: '',
        pages: '',
        images: []
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        dispatch(getCategories());
        if (initialData) {
            setFormData({
                ...initialData,
                category: initialData.category?._id || initialData.category,
                publishedDate: initialData.publishedDate ? new Date(initialData.publishedDate).toISOString().split('T')[0] : ''
            });
        }
    }, [dispatch, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeFile = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let finalImages = [...formData.images];

            // Upload new images if any
            if (imageFiles.length > 0) {
                const data = new FormData();
                imageFiles.forEach(file => {
                    data.append('images', file);
                });

                const uploadedUrls = await dispatch(uploadBookImages(data)).unwrap();
                finalImages = [...finalImages, ...uploadedUrls];
            }

            const submitData = {
                ...formData,
                images: finalImages,
                price: Number(formData.price),
                discountPrice: Number(formData.discountPrice) || 0,
                stock: Number(formData.stock),
                pages: Number(formData.pages)
            };

            await onSubmit(submitData);
            onClose();
        } catch (error) {
            toast.error(error || 'Có lỗi xảy ra');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
            <div className="bg-white rounded-lg w-full max-w-4xl m-4 p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{initialData ? 'Cập nhật sách' : 'Thêm sách mới'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sách *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả *</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="input-field"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi</label>
                                    <input
                                        type="number"
                                        name="discountPrice"
                                        value={formData.discountPrice}
                                        onChange={handleChange}
                                        className="input-field"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kho *</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="input-field"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà xuất bản</label>
                                <input
                                    type="text"
                                    name="publisher"
                                    value={formData.publisher}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Năm xuất bản</label>
                                    <input
                                        type="date"
                                        name="publishedDate"
                                        value={formData.publishedDate}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số trang</label>
                                    <input
                                        type="number"
                                        name="pages"
                                        value={formData.pages}
                                        onChange={handleChange}
                                        className="input-field"
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                                <input
                                    type="text"
                                    name="ISBN"
                                    value={formData.ISBN}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="input-field"
                        ></textarea>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                        <div className="grid grid-cols-5 gap-4 mb-4">
                            {formData.images.map((url, idx) => (
                                <div key={idx} className="relative group">
                                    <img src={url} alt={`Book ${idx}`} className="w-full h-24 object-cover rounded border" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <FiTrash size={12} />
                                    </button>
                                </div>
                            ))}
                            {imageFiles.map((file, idx) => (
                                <div key={`file-${idx}`} className="relative group">
                                    <div className="w-full h-24 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500 px-2 text-center">
                                        {file.name}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <FiTrash size={12} />
                                    </button>
                                </div>
                            ))}
                            <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition">
                                <FiUpload className="text-gray-400 text-xl mb-1" />
                                <span className="text-xs text-gray-500">Thêm ảnh</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="btn-primary min-w-[120px]"
                        >
                            {uploading ? 'Đang xử lý...' : (initialData ? 'Cập nhật' : 'Thêm mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminBookForm;
