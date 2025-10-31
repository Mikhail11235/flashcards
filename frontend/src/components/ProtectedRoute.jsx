import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (!user && !loading) {
    return <Navigate to="/login" replace />;
  }

  return children;
};