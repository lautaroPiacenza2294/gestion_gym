import { Bell, Search } from 'lucide-react';

const Header = ({ title = 'Dashboard' }) => {
  return (
    <header className="header">
      {/* Título de la página */}
      <h1 className="header-title">{title}</h1>

      {/* Acciones del header */}
      <div className="header-actions">
        {/* Botón de notificaciones */}
        <button className="header-btn">
          <Bell size={20} />
        </button>

        {/* Botón de búsqueda */}
        <button className="header-btn">
          <Search size={20} />
        </button>

        {/* Avatar del usuario */}
        <div className="user-avatar">
          <span>LP</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
