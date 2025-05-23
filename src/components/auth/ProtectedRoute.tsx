
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  // Changed from JSX.Element to React.ReactNode for greater flexibility.
  // This addresses the error in App.tsx where <ProtectedRoute> was reported
  // to receive multiple children, even though it appeared to receive a single valid element.
  // React.ReactNode is more permissive and suitable here as the component just renders its children.
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You might want to show a global loading spinner here instead of just text
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-slate-700 text-lg">Loading authentication status...</p>
        </div>
    );
  }

  if (!currentUser) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;