import { useNotificacoes, useUsuario } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';

const Notificaciones = () => {
  const { data: usuario } = useUsuario();
  const { data: notificacoes, isLoading } = useNotificacoes();
  const queryClient = useQueryClient();

  const markAsRead = async (id: string) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-xl font-bold text-foreground">Notificaciones</h1>

      {(!notificacoes || notificacoes.length === 0) ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center space-y-2">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No tienes notificaciones.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notificacoes.map(n => (
            <button
              key={n.id}
              onClick={() => !n.lida && markAsRead(n.id)}
              className="w-full text-left"
            >
              <Card className={`border-0 shadow-sm transition-colors ${!n.lida ? 'bg-secondary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold text-foreground ${!n.lida ? '' : 'opacity-70'}`}>{n.titulo}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.mensagem}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(n.criado_em), "d MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                    {!n.lida && <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />}
                    {n.lida && <Check className="w-4 h-4 text-success shrink-0 mt-1" />}
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notificaciones;
