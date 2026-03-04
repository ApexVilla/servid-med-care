import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

export const useUsuario = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['usuario', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useAfiliados = () => {
  const { data: usuario } = useUsuario();
  return useQuery({
    queryKey: ['afiliados', usuario?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('afiliados')
        .select('*, planos(*)')
        .eq('usuario_id', usuario!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!usuario,
  });
};

export const useClinicas = (tipo?: string) => {
  return useQuery({
    queryKey: ['clinicas', tipo],
    queryFn: async () => {
      let query = supabase.from('clinicas').select('*').eq('ativo', true);
      if (tipo && tipo !== 'todos') {
        query = query.or(`tipo.eq.${tipo},tipo.eq.ambos`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useConsultas = () => {
  const { data: afiliados } = useAfiliados();
  return useQuery({
    queryKey: ['consultas', afiliados?.map(a => a.id)],
    queryFn: async () => {
      const ids = afiliados!.map(a => a.id);
      const { data, error } = await supabase
        .from('consultas')
        .select('*, clinicas(*)')
        .in('afiliado_id', ids)
        .order('data_consulta', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!afiliados && afiliados.length > 0,
  });
};

export const useNotificacoes = () => {
  const { data: usuario } = useUsuario();
  return useQuery({
    queryKey: ['notificacoes', usuario?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', usuario!.id)
        .order('criado_em', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!usuario,
  });
};
