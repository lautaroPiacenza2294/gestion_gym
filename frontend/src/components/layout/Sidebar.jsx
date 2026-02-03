import { Home, Users, CreditCard, DollarSign, BarChart3, Settings } from 'lucide-react';

const Sidebar = () => {
  // Lista de items del menú
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/', active: true },
    { icon: Users, label: 'Clientes', path: '/clientes', active: false },
    { icon: CreditCard, label: 'Membresías', path: '/membresias', active: false },
    { icon: DollarSign, label: 'Finanzas', path: '/finanzas', active: false },
    { icon: BarChart3, label: 'Reportes', path: '/reportes', active: false },
    { icon: Settings, label: 'Configuración', path: '/configuracion', active: false },
  ];

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="logo">
        <span className="logo-icon">💪</span>
        <span className="logo-text">
          <span className="gym">GYM</span> <span className="manager">Manager</span>
        </span>
      </div>

      {/* Menú de navegación */}
      <nav className="menu">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href={item.path}
              className={`menu-item ${item.active ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;