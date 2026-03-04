import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, CreditCard, Building2, CalendarPlus, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/planes', icon: CreditCard, label: 'Mis Planes' },
  { path: '/clinicas', icon: Building2, label: 'Clínicas' },
  { path: '/agendar', icon: CalendarPlus, label: 'Cita' },
  { path: '/perfil', icon: User, label: 'Perfil' },
];

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
