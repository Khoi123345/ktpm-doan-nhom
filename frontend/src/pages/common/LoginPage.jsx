import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError } from '../../features/authSlice';
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo, loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    useEffect(() => {
        if (userInfo) {
            // Redirect admin to admin dashboard, customers to home
            if (userInfo.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        }
    }, [userInfo, navigate]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login({ email, password }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full">
                <Card>
                    <h2 className="text-3xl font-bold text-center mb-8">Đăng nhập</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Mật khẩu"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            disabled={loading}
                            isLoading={loading}
                            className="w-full"
                        >
                            Đăng nhập
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                            Đăng ký ngay
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
