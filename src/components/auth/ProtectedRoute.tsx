
import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext'; // Import UserRole
import { useHasPermission } from '../../hooks/useHasPermission'; // Import useHasPermission

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[]; // Add optional requiredRoles prop
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { t } = useTranslation(); // Initialize useTranslation
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();
  const hasRequiredPermission = requiredRoles ? useHasPermission(requiredRoles) : true; // Check permission if requiredRoles is provided

  if (isLoading) {
    // You might want to show a global loading spinner here instead of just text
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-slate-700 text-lg">{t('protectedRoute.loadingAuthStatus')}</p>
        </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are required and user doesn't have permission, redirect
  if (requiredRoles && !hasRequiredPermission) {
    // TODO: Consider a dedicated "Unauthorized" page later if needed
    // For now, redirecting to home.
    // A notification could also be shown here.
    console.warn(`User does not have required roles: ${requiredRoles.join(', ')}. Redirecting.`);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;