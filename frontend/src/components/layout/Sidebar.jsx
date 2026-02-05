import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, CreditCard, DollarSign, BarChart3, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  // Lista de items del menú
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: CreditCard, label: 'Membresías', path: '/membresias' },
    { icon: DollarSign, label: 'Finanzas', path: '/finanzas' },
    { icon: BarChart3, label: 'Reportes', path: '/reportes' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
  ];

  return (
    <div className="w-64 bg-slate-800 text-white h-screen fixed left-0 top-0 flex flex-col">
      
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <span className="text-4xl">💪</span>
        <div className="flex flex-col">
          <div className="text-xl font-bold">
            <span className="text-white">GYM</span>
            {' '}
            <span className="text-blue-400">Manager</span>
          </div>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 px-3 py-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 mb-1
                rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer opcional */}
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-gray-400 text-center">
          © 2026 GYM Manager
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
