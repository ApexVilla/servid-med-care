import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAfiliados, useConsultas } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Stethoscope, Eye, CheckCircle, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Planes = () => {
  const [searchParams] = useSearchParams();
  const tipoFilter = searchParams.get('tipo');
  const navigate = useNavigate();
  const { data: afiliados, isLoading } = useAfiliados();
  const { data: consultas } = useConsultas();

  const filteredAfiliados = afiliados?.filter(a => {
    if (!tipoFilter) return true;
    const plano = (a as any).planos;
    return plano?.tipo === tipoFilter || plano?.tipo === 'combo';
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-xl font-bold text-foreground">Mis Planes</h1>

      {/* Plan type tabs */}
      <div className="flex gap-2">
        {['todos', 'dental', 'visual'].map(t => (
          <button
            key={t}
            onClick={() => navigate(t === 'todos' ? '/planes' : `/planes?tipo=${t}`)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              (tipoFilter || 'todos') === t
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {t === 'todos' ? 'Todos' : t === 'dental' ? '🦷 Dental' : '👁 Visual'}
          </button>
        ))}
      </div>

      {(!filteredAfiliados || filteredAfiliados.length === 0) ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No tienes planes {tipoFilter ? `de tipo ${tipoFilter}` : ''} activos.</p>
          </CardContent>
        </Card>
      ) : (
        filteredAfiliados.map(afiliado => {
          const plano = (afiliado as any).planos;
          const coberturas = (plano?.coberturas as string[]) || [];
          const planConsultas = consultas?.filter(c => c.afiliado_id === afiliado.id && c.status === 'realizada') || [];
          const isDental = plano?.tipo === 'dental' || plano?.tipo === 'combo';

          return (
            <Card key={afiliado.id} className="border-0 shadow-md overflow-hidden">
              <div className={`h-1.5 ${isDental ? 'bg-primary' : 'bg-success'}`} />
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                      {isDental ? <Stethoscope className="w-5 h-5 text-primary" /> : <Eye className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{plano?.nome}</p>
                      <p className="text-xs text-muted-foreground">{plano?.descricao}</p>
                    </div>
                  </div>
                  <Badge variant={afiliado.status === 'ativo' ? 'default' : 'destructive'} className={afiliado.status === 'ativo' ? 'bg-success text-success-foreground' : ''}>
                    {afiliado.status}
                  </Badge>
                </div>

                {/* Coberturas */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Coberturas incluidas</p>
                  <div className="space-y-1.5">
                    {coberturas.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success shrink-0" />
                        <span>{String(c)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{planConsultas.length}</p>
                    <p className="text-[10px] text-muted-foreground">Consultas realizadas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{format(new Date(afiliado.data_vencimento), 'dd/MM/yy')}</p>
                    <p className="text-[10px] text-muted-foreground">Vencimiento</p>
                  </div>
                </div>

                {/* Historial */}
                {planConsultas.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Historial</p>
                    {planConsultas.slice(0, 3).map(c => (
                      <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{c.tipo_servico}</p>
                          <p className="text-xs text-muted-foreground">{(c as any).clinicas?.nome}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(c.data_consulta), 'dd/MM/yy', { locale: es })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <Button className="w-full" onClick={() => navigate(`/agendar?tipo=${plano?.tipo}`)}>
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Agendar Consulta
                </Button>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default Planes;
