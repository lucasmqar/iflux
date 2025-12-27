import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';
import EmpresaDashboard from './empresa/EmpresaDashboard';
import EntregadorDashboard from './entregador/EntregadorDashboard';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // If user has no role (Google signup incomplete), redirect to complete profile
  if (!user.role) {
    return <Navigate to="/completar-perfil" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'company':
      return <EmpresaDashboard />;
    case 'driver':
      return <EntregadorDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default Dashboard;
