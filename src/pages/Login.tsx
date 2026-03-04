import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('¡Bienvenido!');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nome_completo: nome },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success('Cuenta creada. Revisa tu correo para confirmar.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Se envió un enlace de recuperación a tu correo');
      setShowForgot(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showForgot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg border-0 animate-fade-in">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Recuperar Contraseña</h1>
              <p className="text-muted-foreground text-sm mt-1">Ingresa tu correo para recibir un enlace</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgot(false)}>
                Volver al inicio de sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0 animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <Stethoscope className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Servid Med ELAM</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta nueva'}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="nome">Nombre completo</Label>
                <Input id="nome" placeholder="Tu nombre completo" value={nome} onChange={(e) => setNome(e.target.value)} required={!isLogin} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {isLogin && (
              <button type="button" className="text-sm text-primary hover:underline" onClick={() => setShowForgot(true)}>
                ¿Olvidaste tu contraseña?
              </button>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button className="text-sm text-muted-foreground hover:text-primary" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
