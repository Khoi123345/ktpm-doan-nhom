import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../features/authSlice';
import { toast } from 'react-toastify';
import { FiCheck, FiX } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUpperCase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo, loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (userInfo) {
            navigate('/');
        }
    }, [userInfo, navigate]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Validate password on change
    useEffect(() => {
        setPasswordValidation({
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    }, [password]);

    const isPasswordValid = () => {
        return Object.values(passwordValidation).every(Boolean);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isPasswordValid()) {
            toast.error('Mật khẩu không đáp ứng các yêu cầu bảo mật');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Mật khẩu không khớp');
            return;
        }

        dispatch(register({ name, email, password }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full">
                <Card>
                    <h2 className="text-3xl font-bold text-center mb-8">Đăng ký</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Họ tên"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div>
                            <Input
                                label="Mật khẩu"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            {/* Password Requirements */}
                            {password && (
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

                        <Input
                            label="Xác nhận mật khẩu"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            disabled={loading}
                            isLoading={loading}
                            className="w-full"
                        >
                            Đăng ký
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            Đăng nhập
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
