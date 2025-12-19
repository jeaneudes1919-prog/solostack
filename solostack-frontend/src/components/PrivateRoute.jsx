import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <div className="p-10 text-center text-primary-500">Chargement...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;