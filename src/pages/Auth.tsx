import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCompanyProfile } from '@/hooks/useCompanyProfiles';
import { useCreateDriverProfile, VehicleType } from '@/hooks/useDriverProfiles';
import fluxLogo from '@/assets/flux-logo.png';
import { Loader2, Mail, Lock, User, Phone, AlertCircle, Building2, Truck, Car, Bike, MapPin, FileText } from 'lucide-react';
import type { AppRole } from '@/contexts/AuthContext';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 0, 0)">
      <path fill="#EA4335" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
    </g>
  </svg>
);

const Auth = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state - Basic
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupRole, setSignupRole] = useState<'company' | 'driver'>('company');
  
  // Signup state - Company
  const [companyName, setCompanyName] = useState('');
  const [companyCnpj, setCompanyCnpj] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  
  // Signup state - Driver
  const [vehicleType, setVehicleType] = useState<VehicleType>('moto');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'basic' | 'details'>('basic');
  
  const { signIn, signUp, signInWithGoogle, isAuthenticated, isLoading } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  
  const createCompanyProfile = useCreateCompanyProfile();
  const createDriverProfile = useCreateDriverProfile();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(loginEmail, loginPassword);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Erro ao fazer login');
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    const result = await signInWithGoogle();

    if (!result.success) {
      setError(result.error || 'Erro ao fazer login com Google');
      setGoogleLoading(false);
    }
    // Se sucesso, o usuário será redirecionado pelo OAuth
  };

  const handleSignupBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signupPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (!signupPhone) {
      setError('O WhatsApp é obrigatório');
      return;
    }

    setStep('details');
  };

  const handleSignupComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate role-specific fields
    if (signupRole === 'company') {
      if (!companyName.trim()) {
        setError('Nome da empresa é obrigatório');
        setLoading(false);
        return;
      }
      if (!companyAddress.trim()) {
        setError('Endereço é obrigatório');
        setLoading(false);
        return;
      }
    } else {
      if (!vehicleModel.trim()) {
        setError('Modelo do veículo é obrigatório');
        setLoading(false);
        return;
      }
      if (!vehiclePlate.trim()) {
        setError('Placa do veículo é obrigatória');
        setLoading(false);
        return;
      }
    }

    const result = await signUp(signupEmail, signupPassword, signupName, signupPhone, signupRole);

    if (result.success) {
      // Wait for the auth session to be established, then create profile
      // The profiles are created via trigger, but we need to create the role-specific profile
      // We'll try creating the profile after a short delay since the user was just created
      setTimeout(async () => {
        try {
          // Get the user ID from a fresh sign in
          const signInResult = await signIn(signupEmail, signupPassword);
          if (signInResult.success) {
            // Create role-specific profile
            // Note: This will be handled by navigating to complete profile
            navigate('/completar-perfil');
            return;
          }
        } catch (error) {
          console.error('Error creating profile:', error);
        }
        
        setSuccess('Conta criada com sucesso! Complete seu perfil após o login.');
        setActiveTab('login');
        setLoginEmail(signupEmail);
        resetSignupForm();
      }, 1000);
    } else {
      setError(result.error || 'Erro ao criar conta');
    }

    setLoading(false);
  };

  const resetSignupForm = () => {
    setSignupEmail('');
    setSignupPassword('');
    setSignupName('');
    setSignupPhone('');
    setCompanyName('');
    setCompanyCnpj('');
    setCompanyAddress('');
    setVehicleType('moto');
    setVehicleModel('');
    setVehiclePlate('');
    setStep('basic');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  const formatPlate = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length <= 3) return clean;
    if (clean.length <= 4) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

          {/* Auth form */}
          <div className="card-static p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'signup'); setError(''); setSuccess(''); setStep('basic'); }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-100 text-emerald-800 text-sm mb-4">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {success}
                </div>
              )}

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
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
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading || googleLoading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>

                  {/* Separador */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
                    </div>
                  </div>

                  {/* Botão Google */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleGoogleLogin}
                    disabled={loading || googleLoading}
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <GoogleIcon />
                        <span className="ml-2">Continuar com Google</span>
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                {step === 'basic' ? (
                  <form onSubmit={handleSignupBasic} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="pl-10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
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
                      <Label htmlFor="signup-phone">WhatsApp *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="(00) 00000-0000"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(formatPhone(e.target.value))}
                          className="pl-10"
                          required
                          disabled={loading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Usado para contato entre empresa e entregador</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="pl-10"
                          required
                          disabled={loading}
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Tipo de conta</Label>
                      <RadioGroup
                        value={signupRole}
                        onValueChange={(v) => setSignupRole(v as 'company' | 'driver')}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <RadioGroupItem value="company" id="role-company" className="peer sr-only" />
                          <Label
                            htmlFor="role-company"
                            className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <Building2 className="mb-2 h-6 w-6" />
                            <span className="text-sm font-medium">Empresa</span>
                            <span className="text-xs text-muted-foreground">Solicitar entregas</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="driver" id="role-driver" className="peer sr-only" />
                          <Label
                            htmlFor="role-driver"
                            className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <Truck className="mb-2 h-6 w-6" />
                            <span className="text-sm font-medium">Entregador</span>
                            <span className="text-xs text-muted-foreground">Realizar entregas</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      Continuar
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignupComplete} className="space-y-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setStep('basic')}
                      className="mb-2"
                    >
                      ← Voltar
                    </Button>

                    {signupRole === 'company' ? (
                      <>
                        <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-sm mb-4">
                          <Building2 className="h-4 w-4 inline mr-2" />
                          Complete os dados da sua empresa
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company-name">Nome da Empresa *</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="company-name"
                              type="text"
                              placeholder="Nome da sua empresa"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="pl-10"
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company-cnpj">CNPJ (opcional)</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="company-cnpj"
                              type="text"
                              placeholder="00.000.000/0000-00"
                              value={companyCnpj}
                              onChange={(e) => setCompanyCnpj(formatCnpj(e.target.value))}
                              className="pl-10"
                              disabled={loading}
                              maxLength={18}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company-address">Endereço Padrão *</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="company-address"
                              type="text"
                              placeholder="Endereço completo para retiradas"
                              value={companyAddress}
                              onChange={(e) => setCompanyAddress(e.target.value)}
                              className="pl-10"
                              required
                              disabled={loading}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Será usado como endereço de retirada padrão nos pedidos</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm mb-4">
                          <Truck className="h-4 w-4 inline mr-2" />
                          Complete os dados do seu veículo
                        </div>

                        <div className="space-y-2">
                          <Label>Tipo de Veículo *</Label>
                          <RadioGroup
                            value={vehicleType}
                            onValueChange={(v) => setVehicleType(v as VehicleType)}
                            className="grid grid-cols-3 gap-3"
                          >
                            <div>
                              <RadioGroupItem value="moto" id="vehicle-moto" className="peer sr-only" />
                              <Label
                                htmlFor="vehicle-moto"
                                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                <span className="text-2xl mb-1">🏍️</span>
                                <span className="text-xs font-medium">Moto</span>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="car" id="vehicle-car" className="peer sr-only" />
                              <Label
                                htmlFor="vehicle-car"
                                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                <span className="text-2xl mb-1">🚗</span>
                                <span className="text-xs font-medium">Carro</span>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="bike" id="vehicle-bike" className="peer sr-only" />
                              <Label
                                htmlFor="vehicle-bike"
                                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                <span className="text-2xl mb-1">🚲</span>
                                <span className="text-xs font-medium">Bike</span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vehicle-model">Modelo do Veículo *</Label>
                          <div className="relative">
                            <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="vehicle-model"
                              type="text"
                              placeholder="Ex: Honda CG 160"
                              value={vehicleModel}
                              onChange={(e) => setVehicleModel(e.target.value)}
                              className="pl-10"
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vehicle-plate">Placa do Veículo *</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="vehicle-plate"
                              type="text"
                              placeholder="ABC-1234"
                              value={vehiclePlate}
                              onChange={(e) => setVehiclePlate(formatPlate(e.target.value))}
                              className="pl-10"
                              required
                              disabled={loading}
                              maxLength={8}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        'Criar Conta'
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
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

export default Auth;
