import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminCoupons, createCoupon, deleteCoupon, updateCoupon } from '../../features/couponSlice';
import { FiTrash2, FiPlus, FiX, FiCalendar, FiTag, FiPercent, FiDollarSign, FiCheck, FiXCircle, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminCoupons = () => {
    const dispatch = useDispatch();
    const { coupons, loading, error } = useSelector((state) => state.coupons);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: 0,
        maxDiscountAmount: 0,
        startDate: '',
        endDate: '',
        usageLimit: 0,
        isActive: true
    });

    useEffect(() => {
        dispatch(getAdminCoupons());
    }, [dispatch]);

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
            dispatch(deleteCoupon(id))
                .unwrap()
                .then(() => toast.success('Đã xóa mã giảm giá thành công'))
                .catch((err) => toast.error(err));
        }
    };

    const handleEdit = (coupon) => {
        setFormData({
            code: coupon.code,
            description: coupon.description || '',
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderValue: coupon.minOrderValue,
            maxDiscountAmount: coupon.maxDiscountAmount,
            startDate: coupon.startDate.split('T')[0],
            endDate: coupon.endDate.split('T')[0],
            usageLimit: coupon.usageLimit,
            isActive: coupon.isActive
        });
        setEditingId(coupon._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleOpenCreate = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: '',
            minOrderValue: 0,
            maxDiscountAmount: 0,
            startDate: '',
            endDate: '',
            usageLimit: 0,
            isActive: true
        });
        setIsEditing(false);
        setEditingId(null);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            dispatch(updateCoupon({ id: editingId, couponData: formData }))
                .unwrap()
                .then(() => {
                    toast.success('Cập nhật mã giảm giá thành công');
                    setShowModal(false);
                })
                .catch((err) => toast.error(err));
        } else {
            dispatch(createCoupon(formData))
                .unwrap()
                .then(() => {
                    toast.success('Tạo mã giảm giá thành công');
                    setShowModal(false);
                })
                .catch((err) => toast.error(err));
        }
    };

    if (loading && !showModal) return <div className="text-center py-10">Đang tải...</div>;
    if (error && !showModal) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý mã giảm giá</h1>
                <button
                    onClick={handleOpenCreate}
                    className="btn-primary flex items-center gap-2"
                >
                    <FiPlus /> Thêm mã mới
                </button>
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b bg-gray-50">
                            <th className="p-4">Mã / Mô tả</th>
                            <th className="p-4">Giảm giá</th>
                            <th className="p-4">Điều kiện</th>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4">Lượt dùng</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((coupon) => (
                            <tr key={coupon._id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="font-mono font-bold text-primary-600 text-lg">{coupon.code}</div>
                                    <div className="text-sm text-gray-500">{coupon.description}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium">
                                        {coupon.discountType === 'percentage'
                                            ? `${coupon.discountValue}%`
                                            : `${coupon.discountValue.toLocaleString('vi-VN')} đ`}
                                    </div>
                                    {coupon.maxDiscountAmount > 0 && (
                                        <div className="text-xs text-gray-500">
                                            Tối đa: {coupon.maxDiscountAmount.toLocaleString('vi-VN')} đ
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="text-sm">
                                        Đơn tối thiểu: {coupon.minOrderValue?.toLocaleString('vi-VN')} đ
                                    </div>
                                </td>
                                <td className="p-4 text-sm">
                                    <div>{new Date(coupon.startDate).toLocaleDateString('vi-VN')}</div>
                                    <div className="text-gray-500">đến</div>
                                    <div>{new Date(coupon.endDate).toLocaleDateString('vi-VN')}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm">
                                        {coupon.usedCount} / {coupon.usageLimit > 0 ? coupon.usageLimit : '∞'}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {coupon.isActive ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                            <FiCheck /> Hoạt động
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                            <FiXCircle /> Vô hiệu
                                        </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(coupon)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Sửa mã"
                                        >
                                            <FiEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            title="Xóa mã"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-500">
                                    Chưa có mã giảm giá nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Coupon Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">{isEditing ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá mới'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <FiX size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã Code *</label>
                                        <div className="relative">
                                            <FiTag className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                className={`input-field pl-10 ${isEditing ? 'bg-gray-100' : ''}`}
                                                placeholder="VD: SUMMER2024"
                                                required
                                                disabled={isEditing}
                                            />
                                        </div>
                                        {isEditing && <p className="text-xs text-gray-500 mt-1">Không thể chỉnh sửa mã code</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input-field"
                                            placeholder="Mô tả ngắn về mã giảm giá"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá *</label>
                                        <select
                                            value={formData.discountType}
                                            onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                            className={`input-field ${isEditing ? 'bg-gray-100' : ''}`}
                                            disabled={isEditing}
                                        >
                                            <option value="percentage">Phần trăm (%)</option>
                                            <option value="fixed">Số tiền cố định (VNĐ)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giảm *</label>
                                        <div className="relative">
                                            {formData.discountType === 'percentage' ? (
                                                <FiPercent className="absolute left-3 top-3 text-gray-400" />
                                            ) : (
                                                <FiDollarSign className="absolute left-3 top-3 text-gray-400" />
                                            )}
                                            <input
                                                type="number"
                                                value={formData.discountValue}
                                                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                                className={`input-field pl-10 ${isEditing ? 'bg-gray-100' : ''}`}
                                                placeholder={formData.discountType === 'percentage' ? "VD: 10" : "VD: 50000"}
                                                required
                                                min="0"
                                                disabled={isEditing}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Conditions & Limits */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu (VNĐ)</label>
                                        <input
                                            type="number"
                                            value={formData.minOrderValue}
                                            onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                                            className={`input-field ${isEditing ? 'bg-gray-100' : ''}`}
                                            min="0"
                                            disabled={isEditing}
                                        />
                                    </div>
                                    {formData.discountType === 'percentage' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa (VNĐ)</label>
                                            <input
                                                type="number"
                                                value={formData.maxDiscountAmount}
                                                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                                                className={`input-field ${isEditing ? 'bg-gray-100' : ''}`}
                                                placeholder="0 = Không giới hạn"
                                                min="0"
                                                disabled={isEditing}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn lượt dùng</label>
                                        <input
                                            type="number"
                                            value={formData.usageLimit}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                            className="input-field"
                                            placeholder="0 = Không giới hạn"
                                            min="0"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-8">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                        />
                                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                            Kích hoạt ngay
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className={`input-field pl-10 ${isEditing ? 'bg-gray-100' : ''}`}
                                            required
                                            disabled={isEditing}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className={`input-field pl-10 ${isEditing ? 'bg-gray-100' : ''}`}
                                            required
                                            disabled={isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="flex-1 btn-primary">
                                    {isEditing ? 'Cập nhật' : 'Tạo mã giảm giá'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;
