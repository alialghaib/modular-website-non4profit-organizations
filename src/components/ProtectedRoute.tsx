
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

type ProtectedRouteProps = {
  allowedRoles: Array<'admin' | 'guide' | 'hiker'>;
  redirectPath?: string;
};

const ProtectedRoute = ({ allowedRoles, redirectPath = '/login' }: ProtectedRouteProps) => {
  const { isAuthenticated, checkRole, isLoading } = useAuth();

  // If still loading auth state, show nothing (or could add a loading spinner here)
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated but wrong role, redirect to appropriate dashboard or home
  if (!checkRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the children
  return <Outlet />;
};

export default ProtectedRoute;
