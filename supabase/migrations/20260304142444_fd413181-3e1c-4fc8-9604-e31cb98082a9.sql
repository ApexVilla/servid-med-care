
-- Create update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. USUARIOS
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  cedula TEXT,
  foto_url TEXT,
  data_nascimento DATE,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.usuarios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.usuarios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.usuarios FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-create usuario on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (user_id, nome_completo, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. PLANOS
CREATE TABLE public.planos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('dental', 'visual', 'combo')),
  descricao TEXT,
  preco_mensal NUMERIC NOT NULL DEFAULT 0,
  coberturas JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active plans" ON public.planos FOR SELECT USING (true);

-- 3. AFILIADOS
CREATE TABLE public.afiliados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  plano_id UUID NOT NULL REFERENCES public.planos(id),
  numero_carteirinha TEXT UNIQUE NOT NULL,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'vencido')),
  dependentes JSONB DEFAULT '[]'::jsonb
);
ALTER TABLE public.afiliados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own affiliations" ON public.afiliados FOR SELECT USING (
  usuario_id IN (SELECT id FROM public.usuarios WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own affiliations" ON public.afiliados FOR UPDATE USING (
  usuario_id IN (SELECT id FROM public.usuarios WHERE user_id = auth.uid())
);

-- 4. CLINICAS
CREATE TABLE public.clinicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('dental', 'visual', 'ambos')),
  endereco TEXT,
  cidade TEXT,
  telefone TEXT,
  whatsapp TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  horario TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active clinics" ON public.clinicas FOR SELECT USING (true);

-- 5. CONSULTAS
CREATE TABLE public.consultas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  afiliado_id UUID NOT NULL REFERENCES public.afiliados(id) ON DELETE CASCADE,
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id),
  tipo_servico TEXT NOT NULL,
  data_consulta TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada')),
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own appointments" ON public.consultas FOR SELECT USING (
  afiliado_id IN (
    SELECT a.id FROM public.afiliados a
    JOIN public.usuarios u ON u.id = a.usuario_id
    WHERE u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert own appointments" ON public.consultas FOR INSERT WITH CHECK (
  afiliado_id IN (
    SELECT a.id FROM public.afiliados a
    JOIN public.usuarios u ON u.id = a.usuario_id
    WHERE u.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update own appointments" ON public.consultas FOR UPDATE USING (
  afiliado_id IN (
    SELECT a.id FROM public.afiliados a
    JOIN public.usuarios u ON u.id = a.usuario_id
    WHERE u.user_id = auth.uid()
  )
);

-- 6. NOTIFICACOES
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notificacoes FOR SELECT USING (
  usuario_id IN (SELECT id FROM public.usuarios WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own notifications" ON public.notificacoes FOR UPDATE USING (
  usuario_id IN (SELECT id FROM public.usuarios WHERE user_id = auth.uid())
);

-- Storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
