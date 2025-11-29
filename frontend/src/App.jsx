import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/common/HomePage';
import BookListPage from './pages/common/BookListPage';
import BookDetailPage from './pages/common/BookDetailPage';
import CartPage from './pages/common/CartPage';
import CheckoutPage from './pages/common/CheckoutPage';
import LoginPage from './pages/common/LoginPage';
import RegisterPage from './pages/common/RegisterPage';
import ProfilePage from './pages/common/ProfilePage';
import OrderHistoryPage from './pages/common/OrderHistoryPage';
import OrderDetailPage from './pages/common/OrderDetailPage';
import PaymentSuccessPage from './pages/common/PaymentSuccessPage';
import PaymentFailPage from './pages/common/PaymentFailPage';
import VNPayPaymentPage from './pages/common/VNPayPaymentPage';
import MoMoPaymentPage from './pages/common/MoMoPaymentPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminReviews from './pages/admin/AdminReviews';
import AdminRating from './pages/admin/AdminRating';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/admin/AdminRoute';
import CustomerRoute from './components/common/CustomerRoute';

function App() {
    return (
        <Routes>
            {/* Customer Routes with Header/Footer */}
            <Route path="/*" element={
                <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-grow">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/books" element={<BookListPage />} />
                            <Route path="/books/:id" element={<BookDetailPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            {/* Customer-Only Routes */}
                            <Route path="/cart" element={<CustomerRoute><CartPage /></CustomerRoute>} />
                            <Route path="/checkout" element={<PrivateRoute><CustomerRoute><CheckoutPage /></CustomerRoute></PrivateRoute>} />

                            {/* Protected Routes */}
                            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                            <Route path="/orders" element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
                            <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />

                            {/* Payment Routes */}
                            <Route path="/payment/vnpay/:orderId" element={<PrivateRoute><VNPayPaymentPage /></PrivateRoute>} />
                            <Route path="/payment/momo/:orderId" element={<PrivateRoute><MoMoPaymentPage /></PrivateRoute>} />
                            <Route path="/payment/success" element={<PrivateRoute><PaymentSuccessPage /></PrivateRoute>} />
                            <Route path="/payment/fail" element={<PrivateRoute><PaymentFailPage /></PrivateRoute>} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            } />

            {/* Admin Routes with AdminLayout */}
            <Route path="/admin/*" element={
                <AdminRoute>
                    <AdminLayout>
                        <Routes>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="books" element={<AdminBooks />} />
                            <Route path="categories" element={<AdminCategories />} />
                            <Route path="orders" element={<AdminOrders />} />
                            <Route path="orders/:id" element={<AdminOrderDetail />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="coupons" element={<AdminCoupons />} />
                            <Route path="reviews" element={<AdminReviews />} />
                            <Route path="analytics" element={<AdminRating />} />
                        </Routes>
                    </AdminLayout>
                </AdminRoute>
            } />
        </Routes>
    );
}

export default App;