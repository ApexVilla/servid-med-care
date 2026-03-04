import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsuario, useAfiliados } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { User, LogOut, Camera, CreditCard, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const Perfil = () => {
  const { user, signOut } = useAuth();
  const { data: usuario, isLoading } = useUsuario();
  const { data: afiliados } = useAfiliados();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cedula, setCedula] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setNome(usuario?.nome_completo || '');
    setTelefone(usuario?.telefone || '');
    setCedula(usuario?.cedula || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!usuario) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ nome_completo: nome, telefone, cedula })
        .eq('id', usuario.id);
      if (error) throw error;
      toast.success('Perfil actualizado');
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['usuario'] });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const filePath = `${user.id}/avatar.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ foto_url: publicUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      toast.success('Foto actualizada');
      queryClient.invalidateQueries({ queryKey: ['usuario'] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const dependentes = afiliados?.[0]?.dependentes as any[] || [];

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-xl font-bold text-foreground">Mi Perfil</h1>

      {/* Photo + Name */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                {usuario?.foto_url ? (
                  <img src={usuario.foto_url} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer">
                <Camera className="w-4 h-4 text-primary-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-foreground">{usuario?.nome_completo}</p>
              <p className="text-sm text-muted-foreground">{usuario?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          {editing ? (
            <>
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="+58 412..." />
              </div>
              <div className="space-y-2">
                <Label>Cédula</Label>
                <Input value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="V-12345678" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">Cancelar</Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Nombre</span>
                  <span className="text-sm font-medium text-foreground">{usuario?.nome_completo}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Correo</span>
                  <span className="text-sm font-medium text-foreground">{usuario?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Teléfono</span>
                  <span className="text-sm font-medium text-foreground">{usuario?.telefone || 'No registrado'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Cédula</span>
                  <span className="text-sm font-medium text-foreground">{usuario?.cedula || 'No registrada'}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={startEdit}>Editar Datos</Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Carnet */}
      <Button variant="outline" className="w-full" onClick={() => navigate('/carteirinha')}>
        <CreditCard className="w-4 h-4 mr-2" /> Ver Carnet Digital
      </Button>

      {/* Dependentes */}
      {dependentes.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <p className="font-semibold text-sm text-foreground">Dependientes</p>
            </div>
            <div className="space-y-2">
              {dependentes.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{d.nome || d.nombre}</span>
                  <span className="text-xs text-muted-foreground">{d.parentesco}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign Out */}
      <Button variant="destructive" className="w-full" onClick={handleSignOut}>
        <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
      </Button>
    </div>
  );
};

export default Perfil;
