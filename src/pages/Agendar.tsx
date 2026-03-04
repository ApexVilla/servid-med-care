import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAfiliados, useClinicas } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CalendarPlus } from 'lucide-react';
import { es } from 'date-fns/locale';

const serviciosDentales = ['Limpieza dental', 'Consulta general dental', 'Extracción dental', 'Obturación (calza)', 'Radiografía dental', 'Emergencia dental'];
const serviciosVisuales = ['Consulta oftalmológica', 'Examen de agudeza visual', 'Fondo de ojo', 'Adaptación de lentes', 'Control de lentes de contacto'];

const horarios = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

const Agendar = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tipo, setTipo] = useState(searchParams.get('tipo') || 'dental');
  const [clinicaId, setClinicaId] = useState('');
  const [servicio, setServicio] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [hora, setHora] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: afiliados } = useAfiliados();
  const { data: clinicas } = useClinicas(tipo);

  const servicios = tipo === 'dental' ? serviciosDentales : serviciosVisuales;
  const afiliado = afiliados?.find(a => {
    const plano = (a as any).planos;
    return plano?.tipo === tipo || plano?.tipo === 'combo';
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!afiliado) {
      toast.error('No tienes un plan activo para este tipo de servicio');
      return;
    }
    if (!date || !hora || !clinicaId || !servicio) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    const dataConsulta = new Date(date);
    const [h, m] = hora.split(':');
    dataConsulta.setHours(parseInt(h), parseInt(m));

    try {
      const { error } = await supabase.from('consultas').insert({
        afiliado_id: afiliado.id,
        clinica_id: clinicaId,
        tipo_servico: servicio,
        data_consulta: dataConsulta.toISOString(),
        observacoes: observaciones || null,
      });
      if (error) throw error;
      toast.success('¡Cita agendada exitosamente!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-xl font-bold text-foreground">Agendar Cita</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Tipo de servicio</Label>
              <div className="flex gap-2">
                {['dental', 'visual'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTipo(t); setServicio(''); setClinicaId(''); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex-1 transition-colors ${
                      tipo === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {t === 'dental' ? '🦷 Dental' : '👁 Visual'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Clínica</Label>
              <Select value={clinicaId} onValueChange={setClinicaId}>
                <SelectTrigger><SelectValue placeholder="Selecciona una clínica" /></SelectTrigger>
                <SelectContent>
                  {clinicas?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Especialidad / Procedimiento</Label>
              <Select value={servicio} onValueChange={setServicio}>
                <SelectTrigger><SelectValue placeholder="Selecciona un servicio" /></SelectTrigger>
                <SelectContent>
                  {servicios.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <Label>Fecha</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={es}
                disabled={(d) => d < new Date() || d.getDay() === 0}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Horario</Label>
              <Select value={hora} onValueChange={setHora}>
                <SelectTrigger><SelectValue placeholder="Selecciona un horario" /></SelectTrigger>
                <SelectContent>
                  {horarios.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Observaciones (opcional)</Label>
              <Textarea
                placeholder="Información adicional sobre tu cita..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                maxLength={500}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12" disabled={loading}>
          <CalendarPlus className="w-5 h-5 mr-2" />
          {loading ? 'Agendando...' : 'Confirmar Cita'}
        </Button>
      </form>
    </div>
  );
};

export default Agendar;
