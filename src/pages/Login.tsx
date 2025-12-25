import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import fluxLogo from '@/assets/flux-logo.png';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: doLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await doLogin(login, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Erro ao fazer login');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md">
          {/* Logo and branding */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
              <img src={fluxLogo} alt="FLUX" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-brand text-4xl text-foreground mb-2">FLUX</h1>
            <p className="text-muted-foreground">Entregas Sob Demanda</p>
          </div>

          {/* Login form */}
          <div className="card-static p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-semibold text-foreground mb-6">Entrar na sua conta</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login">Login</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login"
                    type="text"
                    placeholder="admin | loja | entregador"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Logins de demonstração (login / senha):
              </p>
              <div className="grid gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
                  <span className="text-muted-foreground">Admin:</span>
                  <code className="text-foreground">admin / admin</code>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
                  <span className="text-muted-foreground">Loja:</span>
                  <code className="text-foreground">loja / loja</code>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
                  <span className="text-muted-foreground">Entregador:</span>
                  <code className="text-foreground">entregador / entregador</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center p-4 text-xs text-muted-foreground relative">
        © 2025 FLUX. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Login;
