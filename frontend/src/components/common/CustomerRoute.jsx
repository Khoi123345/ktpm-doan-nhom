import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CustomerRoute = ({ children }) => {
    const { userInfo } = useSelector((state) => state.auth);

    // If user is admin, redirect to admin dashboard
    if (userInfo && userInfo.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
};

export default CustomerRoute;
