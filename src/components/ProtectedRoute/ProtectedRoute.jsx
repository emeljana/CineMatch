import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './ProtectedRoute.css';

function ProtectedRoute() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="loading-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export default ProtectedRoute;
