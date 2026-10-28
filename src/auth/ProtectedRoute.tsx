import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'farmer' | 'buyer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9F4]">
        <LoadingSpinner message="Authenticating session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to the role's appropriate dashboard
    const redirectPath = user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
