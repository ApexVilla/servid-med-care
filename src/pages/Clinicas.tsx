import { useState } from 'react';
import { useClinicas } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Phone, MessageCircle, Clock, Building2 } from 'lucide-react';

const Clinicas = () => {
  const [tipoFilter, setTipoFilter] = useState('todos');
  const { data: clinicas, isLoading } = useClinicas(tipoFilter);

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-xl font-bold text-foreground">Red de Clínicas</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {['todos', 'dental', 'visual'].map(t => (
          <button
            key={t}
            onClick={() => setTipoFilter(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tipoFilter === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {t === 'todos' ? 'Todas' : t === 'dental' ? '🦷 Dental' : '👁 Visual'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : clinicas?.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center text-muted-foreground">
            No se encontraron clínicas.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clinicas?.map(clinica => (
            <Card key={clinica.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{clinica.nome}</p>
                      <p className="text-xs text-muted-foreground capitalize">{clinica.tipo === 'ambos' ? 'Dental y Visual' : clinica.tipo}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{clinica.endereco}, {clinica.cidade}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{clinica.horario}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {clinica.latitude && clinica.longitude && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`https://www.google.com/maps?q=${clinica.latitude},${clinica.longitude}`} target="_blank" rel="noopener noreferrer">
                        <MapPin className="w-3 h-3 mr-1" /> Mapa
                      </a>
                    </Button>
                  )}
                  {clinica.telefone && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`tel:${clinica.telefone}`}>
                        <Phone className="w-3 h-3 mr-1" /> Llamar
                      </a>
                    </Button>
                  )}
                  {clinica.whatsapp && (
                    <Button size="sm" className="flex-1 bg-success text-success-foreground hover:bg-success/90" asChild>
                      <a href={`https://wa.me/${clinica.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-3 h-3 mr-1" /> WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clinicas;
