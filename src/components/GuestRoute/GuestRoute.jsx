import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import '../ProtectedRoute/ProtectedRoute.css';

function GuestRoute() {
  const { user, loading } = useUser();

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (user) return <Navigate to="/home" replace />;

  return <Outlet />;
}

export default GuestRoute;
