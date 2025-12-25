import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCompanyProfile, useCreateCompanyProfile, useUpdateCompanyProfile } from '@/hooks/useCompanyProfiles';
import { useDriverProfile, useCreateDriverProfile, useUpdateDriverProfile, VehicleType } from '@/hooks/useDriverProfiles';
import { toast } from 'sonner';
import { 
  Loader2, 
  Building2, 
  Truck, 
  Car, 
  MapPin, 
  FileText,
  CheckCircle2,
  ArrowLeft 
} from 'lucide-react';

const CompletarPerfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: companyProfile, isLoading: companyLoading } = useCompanyProfile(user?.id);
  const { data: driverProfile, isLoading: driverLoading } = useDriverProfile(user?.id);
  
  const createCompanyProfile = useCreateCompanyProfile();
  const updateCompanyProfile = useUpdateCompanyProfile();
  const createDriverProfile = useCreateDriverProfile();
  const updateDriverProfile = useUpdateDriverProfile();

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [companyCnpj, setCompanyCnpj] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  
  // Driver fields
  const [vehicleType, setVehicleType] = useState<VehicleType>('moto');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (companyProfile) {
      setCompanyName(companyProfile.company_name || '');
      setCompanyCnpj(companyProfile.cnpj || '');
      setCompanyAddress(companyProfile.address_default || '');
    }
  }, [companyProfile]);

  useEffect(() => {
    if (driverProfile) {
      setVehicleType(driverProfile.vehicle_type);
      setVehicleModel(driverProfile.vehicle_model || '');
      setVehiclePlate(driverProfile.plate || '');
    }
  }, [driverProfile]);

  if (!user) return null;

  const isLoading = companyLoading || driverLoading;
  const isCompany = user.role === 'company';
  const isDriver = user.role === 'driver';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isCompany) {
        if (!companyName.trim()) {
          toast.error('Nome da empresa é obrigatório');
          setLoading(false);
          return;
        }
        if (!companyAddress.trim()) {
          toast.error('Endereço é obrigatório');
          setLoading(false);
          return;
        }

        if (companyProfile) {
          await updateCompanyProfile.mutateAsync({
            userId: user.id,
            updates: {
              company_name: companyName,
              cnpj: companyCnpj || null,
              address_default: companyAddress,
            },
          });
        } else {
          await createCompanyProfile.mutateAsync({
            user_id: user.id,
            company_name: companyName,
            cnpj: companyCnpj || null,
            address_default: companyAddress,
          });
        }
        toast.success('Perfil da empresa atualizado!');
      } else if (isDriver) {
        if (!vehicleModel.trim()) {
          toast.error('Modelo do veículo é obrigatório');
          setLoading(false);
          return;
        }
        if (!vehiclePlate.trim()) {
          toast.error('Placa do veículo é obrigatória');
          setLoading(false);
          return;
        }

        if (driverProfile) {
          await updateDriverProfile.mutateAsync({
            userId: user.id,
            updates: {
              vehicle_type: vehicleType,
              vehicle_model: vehicleModel,
              plate: vehiclePlate,
            },
          });
        } else {
          await createDriverProfile.mutateAsync({
            user_id: user.id,
            vehicle_type: vehicleType,
            vehicle_model: vehicleModel,
            plate: vehiclePlate,
          });
        }
        toast.success('Perfil do entregador atualizado!');
      }

      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao salvar perfil');
    }

    setLoading(false);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Completar Perfil</h1>
            <p className="text-muted-foreground">
              {isCompany ? 'Dados da sua empresa' : 'Dados do seu veículo'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-static p-6 space-y-4">
          {isCompany && (
            <>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-sm">
                <Building2 className="h-4 w-4 inline mr-2" />
                Preencha os dados da sua empresa
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
                <p className="text-xs text-muted-foreground">Será usado como endereço de retirada padrão</p>
              </div>
            </>
          )}

          {isDriver && (
            <>
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm">
                <Truck className="h-4 w-4 inline mr-2" />
                Preencha os dados do seu veículo
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
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Salvar Perfil
              </>
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default CompletarPerfil;
