import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-center">
          <span className="w-10 h-10 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin inline-block" />
          <p className="text-gray-400 text-sm mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
