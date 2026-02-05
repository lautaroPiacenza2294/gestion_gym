import React from 'react';
const Header = ({ title }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      
      {/* Título de la página */}
      <h1 className="text-2xl font-bold text-gray-900">
        {title}
      </h1>

      {/* Área de usuario (opcional, puedes personalizarlo) */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <span className="text-xl">🔔</span>
        </button>

        {/* Avatar del usuario */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            LP
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;