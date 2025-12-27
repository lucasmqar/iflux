import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bell, Lightbulb, Info, Moon, Sun, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const Configuracoes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [showTips, setShowTips] = useState(() => {
    const saved = localStorage.getItem('flux_show_tips');
    return saved !== 'false';
  });
  
  const [soundNotifications, setSoundNotifications] = useState(() => {
    const saved = localStorage.getItem('flux_sound_notifications');
    return saved !== 'false';
  });
  
  const [popupNotifications, setPopupNotifications] = useState(() => {
    const saved = localStorage.getItem('flux_popup_notifications');
    return saved !== 'false';
  });

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('flux_show_tips', String(showTips));
  }, [showTips]);
  
  useEffect(() => {
    localStorage.setItem('flux_sound_notifications', String(soundNotifications));
  }, [soundNotifications]);
  
  useEffect(() => {
    localStorage.setItem('flux_popup_notifications', String(popupNotifications));
  }, [popupNotifications]);

  if (!user) return null;

  const handleSave = () => {
    toast.success('Configurações salvas');
  };

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Personalize sua experiência</p>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="card-static p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            {mounted && theme === 'dark' ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
            <h2 className="text-lg font-semibold text-foreground">Aparência</h2>
          </div>
          
          <div className="space-y-3">
            <Label>Tema do aplicativo</Label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => {
                const isSelected = mounted && theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-background hover:bg-secondary/50"
                    )}
                  >
                    <option.icon className={cn(
                      "h-6 w-6",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              O tema "Sistema" segue automaticamente as configurações do seu dispositivo.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="card-static p-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="popup-notifications">Notificações Pop-up</Label>
                <p className="text-xs text-muted-foreground">
                  Receba alertas visuais quando houver atualizações
                </p>
              </div>
              <Switch
                id="popup-notifications"
                checked={popupNotifications}
                onCheckedChange={setPopupNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-notifications">Som de Notificação</Label>
                <p className="text-xs text-muted-foreground">
                  Ative sons para novas entregas e atualizações
                </p>
              </div>
              <Switch
                id="sound-notifications"
                checked={soundNotifications}
                onCheckedChange={setSoundNotifications}
              />
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="card-static p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-foreground">Dicas e Instruções</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-tips">Mostrar Dicas</Label>
                <p className="text-xs text-muted-foreground">
                  Exibe instruções e orientações em todas as telas
                </p>
              </div>
              <Switch
                id="show-tips"
                checked={showTips}
                onCheckedChange={setShowTips}
              />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="card-static p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-foreground">Sobre o App</h2>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>FLUX</strong> - Entregas Sob Demanda</p>
            <p>Versão: 1.0.0</p>
            <p>© 2025 FLUX. Todos os direitos reservados.</p>
          </div>
        </div>

        <Button className="w-full" onClick={handleSave}>
          Salvar Configurações
        </Button>
      </div>
    </AppLayout>
  );
};

export default Configuracoes;
