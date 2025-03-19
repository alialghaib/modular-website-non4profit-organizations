
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

type ProtectedRouteProps = {
  allowedRoles: Array<'admin' | 'guide' | 'hiker'>;
  redirectPath?: string;
};

const ProtectedRoute = ({ allowedRoles, redirectPath = '/login' }: ProtectedRouteProps) => {
  const { isAuthenticated, user, checkRole, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute mounted with:", {
      isAuthenticated,
      userRole: user?.role,
      allowedRoles,
      path: location.pathname,
      isLoading
    });
  }, [isAuthenticated, user, allowedRoles, location.pathname, isLoading]);

  // If still loading auth state, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3">Authenticating...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to={redirectPath} replace />;
  }

  // Force a state check to make sure role is correct
  const userRole = user?.role;
  console.log("User role inside ProtectedRoute:", userRole);
  
  // If authenticated but wrong role, redirect to appropriate dashboard
  const hasAllowedRole = allowedRoles.includes(userRole as 'admin' | 'guide' | 'hiker');
  console.log("Role check result:", hasAllowedRole);

  if (!hasAllowedRole) {
    console.log("Wrong role, redirecting to appropriate dashboard");
    
    // Determine the appropriate dashboard based on user role
    let dashboardPath = '/';
    if (userRole === 'admin') {
      dashboardPath = '/admin/dashboard';
    } else if (userRole === 'guide') {
      dashboardPath = '/guide/dashboard';
    } else if (userRole === 'hiker') {
      dashboardPath = '/hiker/dashboard';
    }
    
    return <Navigate to={dashboardPath} replace />;
  }

  // If all checks pass, render the children
  console.log("All checks passed, rendering protected content");
  return <Outlet />;
};

export default ProtectedRoute;
