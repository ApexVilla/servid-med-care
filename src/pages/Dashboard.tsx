import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUsuario, useAfiliados, useConsultas, useNotificacoes } from '@/hooks/useSupabaseData';
import { Bell, Stethoscope, Eye, Calendar, AlertTriangle, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: usuario, isLoading: loadingUser } = useUsuario();
  const { data: afiliados, isLoading: loadingAfiliados } = useAfiliados();
  const { data: consultas } = useConsultas();
  const { data: notificacoes } = useNotificacoes();

  const unreadCount = notificacoes?.filter(n => !n.lida).length || 0;
  const proximaConsulta = consultas?.find(c => c.status === 'agendada' && new Date(c.data_consulta) > new Date());

  const dentalAfiliado = afiliados?.find(a => (a as any).planos?.tipo === 'dental' || (a as any).planos?.tipo === 'combo');
  const visualAfiliado = afiliados?.find(a => (a as any).planos?.tipo === 'visual' || (a as any).planos?.tipo === 'combo');
  const primaryAfiliado = afiliados?.[0];

  const diasParaVencer = primaryAfiliado ? differenceInDays(new Date(primaryAfiliado.data_vencimento), new Date()) : null;

  if (loadingUser || loadingAfiliados) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Bienvenido</p>
            <h1 className="text-lg font-bold text-foreground leading-tight">
              {usuario?.nome_completo || 'Usuario'}
            </h1>
          </div>
        </div>
        <button onClick={() => navigate('/notificaciones')} className="relative p-2 rounded-xl bg-secondary">
          <Bell className="w-5 h-5 text-secondary-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Status Card */}
      {primaryAfiliado ? (
        <Card className="border-0 shadow-md overflow-hidden">
          <div className={`h-1.5 ${primaryAfiliado.status === 'ativo' ? 'bg-success' : 'bg-destructive'}`} />
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Afiliado</p>
                <p className="text-lg font-bold text-foreground">{usuario?.nome_completo}</p>
              </div>
              <Badge variant={primaryAfiliado.status === 'ativo' ? 'default' : 'destructive'} className={primaryAfiliado.status === 'ativo' ? 'bg-success text-success-foreground' : ''}>
                {primaryAfiliado.status === 'ativo' ? 'Activo' : primaryAfiliado.status === 'suspenso' ? 'Suspendido' : 'Vencido'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">N° Carnet</span>
              <span className="font-mono font-bold text-foreground">{primaryAfiliado.numero_carteirinha}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Vencimiento</span>
              <div className="flex items-center gap-1">
                {diasParaVencer !== null && diasParaVencer <= 30 && (
                  <AlertTriangle className="w-4 h-4 text-warning" />
                )}
                <span className={`font-medium ${diasParaVencer !== null && diasParaVencer <= 30 ? 'text-warning' : 'text-foreground'}`}>
                  {format(new Date(primaryAfiliado.data_vencimento), 'dd/MM/yyyy')}
                </span>
              </div>
            </div>
            {diasParaVencer !== null && diasParaVencer <= 30 && diasParaVencer > 0 && (
              <p className="text-xs text-warning font-medium">⚠️ Tu plan vence en {diasParaVencer} días</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No tienes un plan activo.</p>
            <p className="text-sm text-muted-foreground mt-1">Contacta a soporte para afiliarte.</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/planes?tipo=dental')} className="text-left">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 space-y-2">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-sm text-foreground">Plan Dental</p>
              <p className="text-xs text-muted-foreground">
                {dentalAfiliado ? (dentalAfiliado as any).planos?.nome : 'Sin plan'}
              </p>
            </CardContent>
          </Card>
        </button>
        <button onClick={() => navigate('/planes?tipo=visual')} className="text-left">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 space-y-2">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-sm text-foreground">Plan Visual</p>
              <p className="text-xs text-muted-foreground">
                {visualAfiliado ? (visualAfiliado as any).planos?.nome : 'Sin plan'}
              </p>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Next Appointment */}
      {proximaConsulta && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Próxima Cita</p>
                <p className="font-semibold text-sm text-foreground truncate">{proximaConsulta.tipo_servico}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(proximaConsulta.data_consulta), "d 'de' MMMM, HH:mm", { locale: es })}
                  {' · '}
                  {(proximaConsulta as any).clinicas?.nome}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/584125550505?text=Hola%2C%20necesito%20ayuda%20con%20mi%20plan"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 w-14 h-14 bg-success rounded-full flex items-center justify-center shadow-lg z-40 hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-6 h-6 text-success-foreground" />
      </a>
    </div>
  );
};

export default Dashboard;
