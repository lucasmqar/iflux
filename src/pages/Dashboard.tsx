import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';
import EmpresaDashboard from './empresa/EmpresaDashboard';
import EntregadorDashboard from './entregador/EntregadorDashboard';

const Dashboard = () => {
  const { user, isAuthenticated, hasCredits } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // If no credits and trying to access dashboard, still show it but with limitations
  // The AppLayout will handle navigation restrictions

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'empresa':
      return <EmpresaDashboard />;
    case 'entregador':
      return <EntregadorDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default Dashboard;
