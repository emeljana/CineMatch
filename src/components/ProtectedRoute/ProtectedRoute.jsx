import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

function ProtectedRoute() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted text-[15px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export default ProtectedRoute;
