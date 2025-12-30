/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-gray-50)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--color-gray-600)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
