import { useAfiliados, useUsuario } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { QrCode, Share2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const Carteirinha = () => {
  const { data: usuario, isLoading: loadingUser } = useUsuario();
  const { data: afiliados, isLoading: loadingAfiliados } = useAfiliados();
  const primaryAfiliado = afiliados?.[0];
  const plano = primaryAfiliado ? (primaryAfiliado as any).planos : null;

  if (loadingUser || loadingAfiliados) {
    return <div className="p-4"><Skeleton className="h-96 rounded-xl" /></div>;
  }

  if (!primaryAfiliado) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center text-muted-foreground">No tienes un carnet activo.</CardContent>
        </Card>
      </div>
    );
  }

  const qrData = encodeURIComponent(JSON.stringify({
    carnet: primaryAfiliado.numero_carteirinha,
    nombre: usuario?.nome_completo,
    cedula: usuario?.cedula,
    plan: plano?.nome,
    vencimiento: primaryAfiliado.data_vencimento,
  }));

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-xl font-bold text-foreground">Carnet Digital</h1>

      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardContent className="p-6 space-y-5">
          {/* Photo + Name */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center overflow-hidden">
              {usuario?.foto_url ? (
                <img src={usuario.foto_url} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{usuario?.nome_completo}</p>
              <p className="text-sm text-muted-foreground">C.I.: {usuario?.cedula || 'No registrada'}</p>
            </div>
          </div>

          {/* Card Number */}
          <div className="bg-primary rounded-xl p-4 text-center">
            <p className="text-xs text-primary-foreground/70">Número de Carnet</p>
            <p className="text-2xl font-mono font-bold tracking-wider text-primary-foreground mt-1">
              {primaryAfiliado.numero_carteirinha}
            </p>
          </div>

          {/* Plan Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="font-semibold text-foreground">{plano?.nome}</p>
            </div>
            <Badge className={primaryAfiliado.status === 'ativo' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
              {primaryAfiliado.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Inicio</p>
              <p className="font-medium text-foreground">{format(new Date(primaryAfiliado.data_inicio), 'dd/MM/yyyy')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Vencimiento</p>
              <p className="font-medium text-foreground">{format(new Date(primaryAfiliado.data_vencimento), 'dd/MM/yyyy')}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-card p-3 rounded-xl border border-border">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`}
                alt="QR Code"
                className="w-36 h-36"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <QrCode className="w-3 h-3" />
            <span>Escanea para verificar afiliación</span>
          </div>

          <Button variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Compartir Carnet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Carteirinha;
