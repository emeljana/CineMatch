import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './AdminRoute.css';

const ROLE_ADMIN = 1;

function AdminRoute() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="loading-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== ROLE_ADMIN) return <Navigate to="/home" replace />;

  return <Outlet />;
}

export default AdminRoute;
