import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import fluxLogo from '@/assets/flux-logo.png';
import { Loader2 } from 'lucide-react';

// This page now redirects to /auth
const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <img src={fluxLogo} alt="FLUX" className="w-20 h-20 object-contain mb-4" />
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Login;
