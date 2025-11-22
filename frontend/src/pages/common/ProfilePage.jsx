import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../features/authSlice';
import { FiUser, FiMail, FiLock, FiSave, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { userInfo, loading } = useSelector((state) => state.auth);

    // Profile update states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // Password change states
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUpperCase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    useEffect(() => {
        if (userInfo) {
            setName(userInfo.name || '');
            setEmail(userInfo.email || '');
        }
    }, [userInfo]);

    // Validate new password on change
    useEffect(() => {
        setPasswordValidation({
            minLength: newPassword.length >= 8,
            hasUpperCase: /[A-Z]/.test(newPassword),
            hasNumber: /[0-9]/.test(newPassword),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
        });
    }, [newPassword]);

    const isPasswordValid = () => {
        return Object.values(passwordValidation).every(Boolean);
    };

    // Handle profile update (name only, email is read-only)
    const handleProfileSubmit = (e) => {
        e.preventDefault();

        const updateData = {
            name,
        };

        dispatch(updateProfile(updateData))
            .unwrap()
            .then(() => {
                toast.success('Cập nhật thông tin thành công!');
            })
            .catch((error) => {
                toast.error(error || 'Cập nhật thất bại');
            });
    };

    // Handle password change
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!oldPassword) {
            toast.error('Vui lòng nhập mật khẩu cũ');
            return;
        }

        if (!isPasswordValid()) {
            toast.error('Mật khẩu mới không đáp ứng các yêu cầu bảo mật');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        setPasswordLoading(true);
        try {
            await api.put('/users/change-password', {
                oldPassword,
                newPassword,
            });
            toast.success('Đổi mật khẩu thành công!');
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Thông tin tài khoản</h1>

                {/* Profile Update Form */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiUser className="inline mr-2" />
                                Họ tên
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiMail className="inline mr-2" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                className="input-field bg-gray-50"
                                disabled
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vai trò
                            </label>
                            <input
                                type="text"
                                value={userInfo?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                                className="input-field bg-gray-50"
                                disabled
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <FiSave />
                            {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                        </button>
                    </form>
                </div>

                {/* Password Change Form */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4">Đổi mật khẩu</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        {/* Old Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiLock className="inline mr-2" />
                                Mật khẩu cũ *
                            </label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="input-field"
                                placeholder="Nhập mật khẩu hiện tại"
                                required
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiLock className="inline mr-2" />
                                Mật khẩu mới *
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field"
                                placeholder="Nhập mật khẩu mới"
                                required
                            />

                            {/* Password Requirements */}
                            {newPassword && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Yêu cầu mật khẩu:</p>
                                    <div className="space-y-1">
                                        <div className={`flex items-center gap-2 text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                                            {passwordValidation.minLength ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
                                            <span>Ít nhất 8 ký tự</span>
                                        </div>
                                        <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                                            {passwordValidation.hasUpperCase ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
                                            <span>Ít nhất một chữ cái viết hoa</span>
                                        </div>
                                        <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                                            {passwordValidation.hasNumber ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
                                            <span>Ít nhất một số</span>
                                        </div>
                                        <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                                            {passwordValidation.hasSpecialChar ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
                                            <span>Ít nhất một ký tự đặc biệt (!@#$%^&*...)</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiLock className="inline mr-2" />
                                Xác nhận mật khẩu mới *
                            </label>
                            <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="input-field"
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <FiLock />
                            {passwordLoading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                </div>

                {/* Account Info */}
                <div className="card mt-6">
                    <h3 className="text-lg font-semibold mb-4">Thông tin tài khoản</h3>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                            <span className="font-medium">Ngày tạo:</span>{' '}
                            {userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Cập nhật lần cuối:</span>{' '}
                            {userInfo?.updatedAt ? new Date(userInfo.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
