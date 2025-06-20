import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, loading, user, hasAnyRole } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !hasAnyRole(roles)) {
    switch (user?.role) {
      case 'Admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'Doctor':
        return <Navigate to="/doctor/dashboard" replace />;
      case 'Patient':
        return <Navigate to="/patient/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 